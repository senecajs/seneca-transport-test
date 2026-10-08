# Getting started: add the standard transport tests to your transport plugin

In this tutorial you add the standard transport cases to a transport
plugin and run them with node:test. The transport here is a small one
that moves messages between two Seneca instances in the same process;
in your project, your own transport takes its place. At the end you know
what the cases do, what they assert, and how to read their output.

You need Node.js 22 or later, Seneca 4, and about ten minutes.

## 1. Install

In your transport plugin's project:

```sh
npm install --save-dev @seneca/transport-test seneca
```

(The package name is explained in the [README](../../README.md#install).)
The cases receive Seneca instances from your test, so the package does
not depend on `seneca` itself; the devDependency on `seneca` is yours.
This tutorial was run with the Seneca 4 prerelease, `seneca@4.0.0-rc5`.

## 2. The transport under test

Here is the transport the tutorial tests,
[examples/memory-transport.js](../examples/memory-transport.js). It
provides the two actions every transport provides, a listen hook and a
client hook for its type, and it releases its listeners when the
instance closes:

```js
// Listeners by port: each listen call takes a port (a number) and receives
// the messages that clients send to that port.
const listeners = {}

module.exports = function memory (options) {
  const seneca = this

  // Helpers from Seneca core: externalize/internalize messages and replies.
  const utils = seneca.export('transport/utils')

  // listen: the message is the listen configuration (type, port, pin, ...).
  seneca.add('role:transport,hook:listen,type:memory', function (config, reply) {
    const port = config.port

    listeners[port] = function receive (data, respond) {
      const msg = utils.internalize_msg(seneca, data)
      seneca.act(msg, function (err, out, meta) {
        respond(utils.externalize_reply(seneca, err, out, meta))
      })
    }

    // Seneca 4 closes an instance through sys:seneca,cmd:close. Release the
    // listener, then continue the chain.
    seneca.add('sys:seneca,cmd:close', function (msg, reply) {
      delete listeners[port]
      this.prior(msg, reply)
    })

    reply(null, { type: 'memory', port })
  })

  // client: reply with an object that has a send function.
  seneca.add('role:transport,hook:client,type:memory', function (config, reply) {
    const port = config.port

    reply(null, {
      send: function (msg, reply, meta) {
        const receive = listeners[port]

        if (null == receive) {
          return reply(new Error('memory transport: nothing listens on port ' + port))
        }

        const data = roundtrip(utils.externalize_msg(seneca, msg, meta))

        receive(data, function (replydata) {
          const res = utils.internalize_reply(seneca, roundtrip(replydata))
          reply(res.err, res.out, res.meta)
        })
      },
    })
  })

  // What a real transport does on the wire: encode, send, decode.
  function roundtrip (obj) {
    return utils.parseJSON(utils.stringifyJSON(obj))
  }
}
```

`seneca.listen({ type: 'memory', port: 10801 })` ends up in the listen
hook, which stores a receive function under the port.
`seneca.client({ type: 'memory', port: 10801 })` ends up in the client
hook, which replies with a `send` function; Seneca core calls `send`
for every message routed to that client. The JSON round trip stands in
for the network. [What a transport must provide](../explanation/what-a-transport-must-provide.md)
explains each part.

## 3. The test file

Save this as
[examples/memory-transport-node.test.js](../examples/memory-transport-node.test.js).
In your project it would be a file such as `test/standard.test.js`
that requires your transport and `@seneca/transport-test`:

```js
const Seneca = require('seneca')

// In your own plugin: require('@seneca/transport-test')
const TransportTest = require('../..')

const MemoryTransport = require('./memory-transport')

// Called once for the service instance and once for the client instance.
function make () {
  return Seneca().test().use(MemoryTransport)
}

TransportTest.basictest({
  seneca: make,
  script: require('node:test'),
  type: 'memory',
  port: 10801,
})

TransportTest.basicpintest({
  seneca: make,
  script: require('node:test'),
  type: 'memory',
  port: 10811,
})
```

Three things to note:

* `seneca` is a function. Each test function calls it twice, once for
  the service instance and once for the client instance, so that every
  message really travels through the transport. With one shared
  instance the calls would be answered locally.
* `script` is the `node:test` module: it provides `describe`, `it`,
  `before` and `after`, which is all the test functions use. For lab,
  pass `Lab.script()` instead (see
  [Run the cases with lab](../how-to/run-the-cases-with-lab.md)).
* `type` is the transport type, as given to `listen` and `client`, and
  `port` is the first of three ports the service listens on. The two
  suites get different ports so that they never collide.

## 4. Run it

```sh
node --test docs/examples/memory-transport-node.test.js
```

Output (Node.js 24, seneca 4.0.0-rc5):

```
▶ Basic Transport for type memory
  ✔ should execute three consecutive calls (473.593399ms)
✔ Basic Transport for type memory (744.254075ms)
▶ Basic Transport using pin for type memory
  ✔ should execute two consecutive calls using pin (253.20377ms)
✔ Basic Transport using pin for type memory (506.227334ms)
ℹ tests 2
ℹ suites 2
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1415.183129
```

Running the file with plain `node` gives the same report: node:test
runs the tests in the current process when the file is not started by
`node --test`.

## 5. What happened

The first suite, `Basic Transport for type memory`:

1. `before`: a new instance is made with `make()`. The test function
   loads its service plugin into it (actions such as `foo:1`, `nores:1`
   and `faf:1`) and calls `listen` three times: `{ type: 'memory',
   port: 10801 }` for all messages, then ports 10802 and 10803 with
   the pins `{ role: 'a', cmd: '*' }` and `{ role: 'b', cmd: '*' }`.
   Each call reaches the transport's listen hook. The `before` hook
   then waits for the instance to be ready.
2. `should execute three consecutive calls`: a second instance is made
   with `make()`, and `client({ type: 'memory', port: 10801 })` is added
   to it. This client has no pin, so it catches every message the
   client instance cannot answer locally. The case sends
   `foo:1,bar:A` and checks the reply `{ dee: '1-A' }`; then
   `foo:1,bar:AA` and checks `{ dee: '1-AA' }`; then `nores:1` and
   checks that the reply is empty; then `faf:1` with a random key and
   value and no callback, waits 222 ms, and checks that the service
   stored the value. Finally it closes the client instance.
3. `after`: the service instance is closed. The transport added one
   close action per listener, and each removes its listener.

The second suite, `Basic Transport using pin for type memory`, starts
the same service on ports 10811 to 10813 and adds two clients to the
client instance: one with the pin `'role: a, cmd:*'` given as a string,
sending to port 10812, and one with the pin `{ role: 'b', cmd: '*' }`
given as an object, sending to port 10813. It sends
`role:a,cmd:1,bar:B` and checks `{ out: 'a1-B' }`, then
`role:b,cmd:2,bar:BB` and checks `{ out: 'b2-BB' }`.

The full list of calls and assertions is in
[Messages and assertions](../reference/messages.md).

## 6. When a case fails

A failed assertion or an error reply fails the case with that error.
For example, a transport that left an extra property on every reply
fails with:

```
AssertionError [ERR_ASSERTION]: '{"dee":"1-A"}' == '{"dee":"1-A","extra":true}'
```

A listener that never comes up fails the `before` hook with
`seneca-transport-test: service not ready within 5555ms`, and a close
action that never continues fails the `after` hook with
`seneca-transport-test: service not closed within 5555ms`.
[Diagnose a failing case](../how-to/diagnose-a-failing-case.md) lists
the failures and what to look at for each.

## Next steps

* Run the same cases under lab:
  [Run the cases with lab](../how-to/run-the-cases-with-lab.md).
* Give your transport its options, choose ports, or test a transport
  without ports:
  [Test a transport that needs options or ports](../how-to/test-a-transport-that-needs-options-or-ports.md).
* Read what the cases require from a transport and why:
  [What a transport must provide](../explanation/what-a-transport-must-provide.md),
  [Why a conformance suite](../explanation/why-a-conformance-suite.md).
* Support Seneca 3 and Seneca 4 in one transport:
  [Seneca 3 and Seneca 4](../explanation/seneca-3-and-4.md).
