# Messages and assertions reference

What the service provides, what the clients send, and what the cases
assert.

## The service plugin

The `before` hook loads this plugin into the service instance:

| Pattern | Reply |
| ------- | ----- |
| `foo:1` | `{ dee: '1-' + msg.bar }` |
| `foo:2` | `{ dee: '2-' + msg.bar }` (defined, not called by the cases) |
| `foo:3` | `{ dee: '3-' + msg.bar }` (defined, not called by the cases) |
| `foo:4` | `{ dee: '4-' + msg.bar }` (defined, not called by the cases) |
| `foo:5` | `{ dee: '5-' + msg.bar }` (defined, not called by the cases) |
| `nores:1` | empty: `reply()` |
| `faf:1` | stores `msg.v` under the key `msg.k` in a map the client side reads, then `reply()` |
| `role:a,cmd:1` | `{ out: 'a1-' + msg.bar }` |
| `role:b,cmd:2` | `{ out: 'b2-' + msg.bar }` |

The map behind `faf:1` is a variable of the module, so the service and
the client must run in the same process.

## Listeners

The service instance listens three times. The ports come from
[`settings.port`](settings.md#port).

| Listener | Configuration | Receives |
| -------- | ------------- | -------- |
| 1 | `{ type, port }` | every message a client sends to it |
| 2 | `{ type, port: port + 1, pin: { role: 'a', cmd: '*' } }` | `role:a,cmd:*` |
| 3 | `{ type, port: port + 2, pin: { role: 'b', cmd: '*' } }` | `role:b,cmd:*` |

## Clients

| Case | Configuration | Sends |
| ---- | ------------- | ----- |
| basic | `{ type, port }` | every message that has no local action on the client instance |
| pin | `{ type, port: port + 1, pin: 'role: a, cmd:*' }` | messages matching `role:a,cmd:*` |
| pin | `{ type, port: port + 2, pin: { role: 'b', cmd: '*' } }` | messages matching `role:b,cmd:*` |

The pin case gives one pin as a string and one as an object, so a
transport sees both forms.

## Basic calls

`basictest` makes these calls on the client instance, each one after
the reply to the previous one:

| Call | Assertion |
| ---- | --------- |
| `act('foo:1,bar:A')` | `JSON.stringify(out) === '{"dee":"1-A"}'` |
| `act('foo:1,bar:AA')` | `JSON.stringify(out) === '{"dee":"1-AA"}'` |
| `act('nores:1')` | `out == null` |
| `act('faf:1,k:<k>,v:<v>')`, no callback | 222 ms later, the service has stored `<v>` under `<k>` |

`<k>` and `<v>` are random strings. An error reply at any step fails
the case with that error.

## Pin calls

`basicpintest` makes these calls on the client instance:

| Call | Assertion |
| ---- | --------- |
| `act('role:a,cmd:1,bar:B')` | `JSON.stringify(out) === '{"out":"a1-B"}'` |
| `act('role:b,cmd:2,bar:BB')` | `JSON.stringify(out) === '{"out":"b2-BB"}'` |

## What the assertions require from a transport

* A reply arrives with exactly the properties the action replied, in
  the same order: the transport must not leave properties of its own
  (such as `meta$`) on `out`.
* An empty reply arrives as `null` or `undefined`, not as `{}`.
* A message sent without a callback is delivered within 222 ms.
* `listen` and `client` configurations with `type`, `port` and `pin`
  (a string or an object) are accepted, and each client's messages
  reach the listener on its port.
* The service instance becomes ready once its listeners are up, and the
  client instance once its clients are set up.
* `close()` calls back, on the service and on the client instance,
  within the timeout.

See [What a transport must provide](../explanation/what-a-transport-must-provide.md)
for the mechanics behind each point.
