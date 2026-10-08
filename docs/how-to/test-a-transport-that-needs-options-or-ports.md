# Test a transport that needs options or ports

Goal: run the standard cases against a transport that needs plugin
options, particular ports, a broker, or more time.

## Give the transport its options

The `seneca` setting is a function, so load the transport with its
options there:

```js
function make () {
  return Seneca().test().use(MyTransport, { url: 'amqp://127.0.0.1' })
}

TransportTest.basictest({ seneca: make, script, type: 'mytype', port: 10201 })
```

Both the service instance and the client instance are made by this
function, so both get the options.

## Use different options for the client

Pass the client instance as `client`; the service still comes from
`seneca`:

```js
TransportTest.basictest({
  seneca: () => Seneca().test().use(MyTransport, serviceOptions),
  client: Seneca().test().use(MyTransport, clientOptions),
  script,
  type: 'mytype',
  port: 10201,
})
```

Each test function call closes its client instance, so give each call
its own.

## Choose the ports

Each suite listens on three ports: `port`, `port + 1` and `port + 2`
(the [port table](../reference/settings.md#port) has the details). Give
each suite its own base port, at least 3 apart, and keep them away from
ports other processes use:

```js
TransportTest.basictest({ seneca: make, script, type: 'mytype', port: 10201 })
TransportTest.basicpintest({ seneca: make, script, type: 'mytype', port: 10211 })
```

A port that is in use shows as `EADDRINUSE` and
`=== SENECA FATAL ERROR ===` in the log (with a transport that binds
ports, such as seneca-transport), and the case then fails with an
unrelated error.

Without `port` (or with `0`), the first listener gets no `port` key and
Seneca core fills in `options.transport.port`, which is `10101` unless
you set it; the other two listeners use `10102` and `10103`.

## Test a transport whose listeners share one port

Some transports do not open a port per listener: the port is that of a
broker that every listener and client connects to. Give the port as a
negative number:

```js
TransportTest.basictest({ seneca: make, script, type: 'mytype', port: -5672 })
```

All three listeners and all clients then get `port: 5672`. The pins in
the configurations still differ, so the transport can tell the
listeners apart by pin.

## Start and stop a broker around the cases

Register your own `before` and `after` on the same script before
calling the test functions. They run before the first suite starts and
after the last one ends, in lab and in node:test:

```js
const script = require('node:test')

script.before(async () => { await broker.start() })
script.after(async () => { await broker.stop() })

TransportTest.basictest({ seneca: make, script, type: 'mytype', port: -5672 })
```

## Use the right type name

`type` must be the type in your plugin's hook patterns,
`role:transport,hook:listen,type:<type>` and
`role:transport,hook:client,type:<type>`. Without `type`, Seneca uses
`web`. A type that no plugin answers makes `listen` fail: the log shows
`No matching action pattern found for { type: '<type>', ... role: 'transport', hook: 'listen' }`
followed by `=== SENECA FATAL ERROR ===`, and the case times out.

## Expect configuration keys from core

Seneca core adds keys to every listen and client configuration before
your hooks see it, whatever the type:

| Seneca | Keys added |
| ------ | ---------- |
| 3.x, 4.0.0 | `port: 10101` when no port is given |
| 4.0.0-rc5 | `port: 10101` when no port is given, and `host: '127.0.0.1'`, `path: '/act'`, `protocol: 'http'` |

Client configurations also carry `id` and `pg` (the pins in canonical
string form), and `pin` as the caller gave it, a string or an object.
A transport that gives `path` a meaning of its own (a UNIX socket path,
for example) must not mistake the web path `/act` for it on rc5:
seneca-transport 8.3.0 does exactly that, and its tcp listeners do not
bind on rc5.

## Give a slow transport more time

```js
TransportTest.basictest({ seneca: make, script, type: 'mytype', port: 10201, timeout: 20000 })
```

`timeout` limits each case and the service's ready and close steps.
It does not change the fire-and-forget check, which looks for the
`faf:1` message on the service 222 ms after sending it: a transport
that takes longer to deliver fails that check whatever the timeout.
