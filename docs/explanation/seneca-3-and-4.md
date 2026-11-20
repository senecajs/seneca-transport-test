# Seneca 3 and Seneca 4

Version 2.0.0 of the test functions is for Seneca 4: its peer
dependency is `seneca` `^4.0.0`. Transports that are still tested on
Seneca 3 use `seneca-transport-test@1`. What differs between the
versions is what a transport, and its tests, have to do. This page
lists the differences that matter for the standard cases, for a
transport that moves from Seneca 3 to Seneca 4, and how the
seneca-transport releases fare on each version.

## Transports are plugins on Seneca 4

Seneca 3 depends on seneca-transport and loads it by default, so `web`
and `tcp` work without `use`. Seneca 4 has no
network transport in core: load the transport in the factory, as in
`Seneca().test().use('@seneca/transport')`. Load it by its full
package name.

## The transport helpers

Seneca 4 core exports helpers for transport plugins as
`seneca.export('transport/utils')`: `externalize_msg`,
`internalize_msg`, `externalize_reply`, `internalize_reply`,
`stringifyJSON`, `parseJSON`, `close` and `info`. On Seneca 3, the
seneca-transport that is loaded by default replaces this export with
helpers of its own, under other names. @seneca/transport 9.0.0 keeps
the core helpers in the export it provides. A transport written against
the core helpers, such as the
[memory transport example](../examples/memory-transport.js), needs
Seneca 4.

## Closing

Seneca 4 closes an instance through `sys:seneca,cmd:close`; Seneca 3
through `role:seneca,cmd:close`.

* Seneca 4.0.0 also calls actions added on `role:seneca,cmd:close`,
  for compatibility. By default Seneca 4 has no builtin action on that
  pattern, so on an instance with a client without pin, the client's
  action becomes the prior of such a close action. The call is a
  `local$` message, so `this.prior(msg, reply)` passes it on locally
  instead of sending it to the transport.
* The core helper `close(seneca, closer)` adds its action on
  `sys:seneca,cmd:close`.

A transport that still supports both versions chooses the pattern by
version:

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

Seneca 3 and Seneca 4.0.0 add only `port` (10101) to a listen or client
configuration, when none is given.

## Changes the test functions handle

* The test functions use the callback form of `ready`,
  `seneca.ready(callback)`, which works on every Seneca version.
* `this.good(out)`, deprecated in Seneca 3, is gone in Seneca 4. The
  service plugin replies with `reply(null, out)`.
* Seneca 4 gives the caller the error an action replied, without
  wrapping it. The cases fail with whatever error they receive, and do
  not inspect it.

## seneca-transport on each version

What the standard cases show for each combination:

| Transport | seneca 3.38 | seneca 4.0.0 |
| --------- | ----------- | ------------ |
| `seneca-transport` 8.3.0 | web and tcp pass | web and tcp pass |
| `@seneca/transport` 9.0.0 | not supported (peer `seneca` `^4.0.0`) | web and tcp pass, with no Seneca deprecation warning |

On Seneca 4 use @seneca/transport 9.0.0. seneca-transport 8.3.0 has the
required peer dependency `seneca-entity` `>=28`, which brings the
Seneca 3 era `seneca-entity` 28 into the install, and it uses APIs that
Seneca 4 deprecates. @seneca/transport 9.0.0 is the same transport
under its new name; seneca-transport 8.4.0 was never published.

Use `type: 'web'` on Seneca 4. With seneca-transport 8.3.0,
`type: 'http'` fails (`Cannot read properties of undefined (reading
'headers')`).
