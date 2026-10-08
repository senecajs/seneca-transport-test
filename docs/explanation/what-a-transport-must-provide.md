# What a transport must provide

What the standard cases need from a transport plugin, and how Seneca
core and the transport share the work. The core side is described in
the [Seneca transport reference](https://github.com/senecajs/seneca/blob/master/docs/reference/transport.md).

## Two hook actions per type

`seneca.listen(config)` and `seneca.client(config)` do not open
anything themselves. Seneca core completes the configuration and sends
it, as a message, to an action of the transport:

| Call | Action the transport adds | The action replies |
| ---- | ------------------------- | ------------------ |
| `listen({ type: 'mytype', ... })` | `role:transport,hook:listen,type:mytype` | once the listener is up |
| `client({ type: 'mytype', ... })` | `role:transport,hook:client,type:mytype` | with an object that has a `send(msg, reply, meta)` function |

The message carries the configuration the caller gave (`type`, `port`,
`pin` and any other key), plus the keys core adds (see
[Expect configuration keys from core](../how-to/test-a-transport-that-needs-options-or-ports.md#expect-configuration-keys-from-core)).

An instance is not ready until these actions have replied. A listen
hook that never replies therefore fails the `before` hook with
`service not ready`.

## Routing is done by core

For each pin of a client, core adds an action that calls the
transport's `send`. A client without pin is added with an empty
pattern, so it receives every message that has no more specific action
on the client instance. The transport does not filter messages by pin
on the client side. The pin case checks that pins given as a string and
as an object both work, and that each client's messages reach the
listener on its own port.

## Carrying a message and its reply

For each message, `send` must get the message to the listener, have the
service instance act on it, and call `reply(err, out, meta)` once with
the result. Seneca 4 core provides helpers for the steps, through
`seneca.export('transport/utils')`:

1. `externalize_msg(seneca, msg, meta)`, on the client side, prepares
   the message for the wire: it attaches the meta data as `meta$`.
2. The transport encodes the message and sends it; the listener
   decodes it.
3. `internalize_msg(seneca, data)`, on the service side, turns the meta
   data back into directives (`id$`, `custom$`, `parents$` and others)
   and marks the message `remote$`. The service acts on the result.
4. `externalize_reply(seneca, err, out, meta)` prepares the reply:
   an error becomes a plain object marked with `meta$.error`, and an
   empty reply becomes `{}` marked with `meta$.empty`.
5. The transport sends the reply back; the client side decodes it.
6. `internalize_reply(seneca, data)` returns `{ err, out, meta }`: it
   removes `meta$`, rebuilds an `Error` from an error reply, and gives
   no `out` for an empty reply.

The cases depend on steps 4 and 6 directly: `out` must equal the
action's reply when both are written as JSON, so nothing the transport
added may be left on it; and `nores:1` must arrive empty, not as `{}`.

## Messages without a callback

`seneca.act(msg)` without a callback still goes through the client
action and the transport's `send`. The transport must deliver it like
any other message; the `faf:1` check looks for its effect on the
service 222 ms after sending it.

## Several listeners on one instance

The service instance listens three times, with different ports and
pins. The transport must keep the listeners apart, and close all of
them.

## Closing

When an instance closes, Seneca 4 acts `sys:seneca,cmd:close`. A
transport adds an action on that pattern for each resource it opens,
releases the resource, and continues the chain:

```js
seneca.add('sys:seneca,cmd:close', function (msg, reply) {
  server.close()
  this.prior(msg, reply)
})
```

If the chain is not continued, `close()` calls back only when the close
message times out (after 22222 ms by default), and the `after` hook
fails before that with `service not closed`. If the resource is not
released, node:test does not end the process. Seneca 3 closes through
`role:seneca,cmd:close`; [Seneca 3 and Seneca 4](seneca-3-and-4.md#closing)
shows how to support both.

## Not covered by the cases

Error replies, meta data, timeouts and the other points in
[What they do not check](why-a-conformance-suite.md#what-they-do-not-check)
are still part of a transport's job: test them in the transport's own
suite.
