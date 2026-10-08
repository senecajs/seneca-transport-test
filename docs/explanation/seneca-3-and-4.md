# Seneca 3 and Seneca 4

The test functions accept Seneca 3 and Seneca 4 instances alike. What
differs between the versions is what a transport, and its tests, have
to do. This page lists the differences that matter for the standard
cases, and how seneca-transport fares on each version.

## Transports are plugins on Seneca 4

Seneca 3 depends on seneca-transport and loads it by default, so `web`
and `tcp` work without `use`. Seneca 4 has no
network transport in core: load the transport in the factory, as in
`Seneca().test().use('seneca-transport')`.

## The transport helpers

Seneca 4 core exports helpers for transport plugins as
`seneca.export('transport/utils')`: `externalize_msg`,
`internalize_msg`, `externalize_reply`, `internalize_reply`,
`stringifyJSON`, `parseJSON`, `close` and `info`. On Seneca 3, the
seneca-transport that is loaded by default replaces this export with
helpers of its own, under other names. A transport written against the
core helpers, such as the
[memory transport example](../examples/memory-transport.js), needs
Seneca 4.

## Closing

Seneca 4 closes an instance through `sys:seneca,cmd:close`; Seneca 3
through `role:seneca,cmd:close`.

* seneca 4.0.0-rc5 never calls actions added on
  `role:seneca,cmd:close`, so resources that a transport releases there
  stay open.
* seneca 4.0.0 calls them, for compatibility. By default Seneca 4 has
  no builtin action on that pattern, so on an instance with a client
  without pin, the client's action becomes the prior of such a close
  action: `this.prior(msg, reply)` then sends the close message to the
  transport.
* The core helper `close(seneca, closer)` adds its action on
  `role:seneca,cmd:close` in 4.0.0-rc5, and on `sys:seneca,cmd:close`
  in 4.0.0. Add the close action yourself to work on both.

A transport for both versions chooses the pattern by version:

```js
// Seneca 3 closes via role:seneca,cmd:close; Seneca 4 via sys:seneca,cmd:close.
const close_pattern = seneca.version.startsWith('3.')
  ? 'role:seneca,cmd:close' : 'sys:seneca,cmd:close'

seneca.add(close_pattern, function (msg, reply) {
  // release resources, then continue the chain
  this.prior(msg, reply)
})
```

`seneca.has('sys:seneca,cmd:close')` does not tell the versions apart:
Seneca 3 translates `sys:seneca` to `role:seneca`.

## Configuration from core

seneca 4.0.0-rc5 copies `host: '127.0.0.1'`, `path: '/act'` and
`protocol: 'http'` into every listen and client configuration, whatever
the type. Seneca 3 and seneca 4.0.0 add only `port` (10101), when none
is given.

## Changes the test functions handle

* `await seneca.ready()` can wait forever on an idle seneca 4.0.0-rc5
  instance. The test functions use the callback form,
  `seneca.ready(callback)`.
* `this.good(out)`, deprecated in Seneca 3, is gone in Seneca 4. The
  service plugin replies with `reply(null, out)`.
* Seneca 4 gives the caller the error an action replied, without
  wrapping it. The cases fail with whatever error they receive, and do
  not inspect it.

## seneca-transport on each version

What this repository's own tests show for each combination:

| seneca-transport | seneca 3.38 | seneca 4.0.0-rc5 | seneca 4.0.0 |
| ---------------- | ----------- | ---------------- | ------------ |
| 8.3.0 (published) | web and tcp pass | web passes; tcp listeners do not bind (they take `path: '/act'` for a UNIX socket path); close actions are not called, so listeners stay open | web passes; tcp pin case passes; in the tcp basic case the client's close waits for an `action_timeout` (22 seconds), see [Closing](#closing) |
| 8.4.0 (not yet published) | web and tcp pass | web and tcp pass | web and tcp pass |

With seneca-transport 8.3.0 on Seneca 4, `type: 'http'` fails too
(`Cannot read properties of undefined (reading 'headers')`): use
`type: 'web'`.

The repository's tests skip the tcp cases that cannot pass with the
installed versions, and give the reason in the test report.
