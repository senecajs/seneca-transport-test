# Settings reference

Both [functions](api.md) take one `settings` object.

| Setting | Type | Default | Effect |
| ------- | ---- | ------- | ------ |
| `seneca` | Seneca instance, or function returning one | required | The service side. A function is called without arguments, once for the service and, unless `client` is set, once for the client; it must return a new instance each time. |
| `client` | Seneca instance | see below | The client side. |
| `script` | object | `require('@hapi/lab').script()` | Where the suite is registered: a lab script or the `node:test` module. `@hapi/lab` is loaded only when this setting is not given. |
| `type` | string | none | Transport type, passed as `type` in every `listen` and `client` configuration. Without it Seneca uses its default type, `web`. Also appears in the suite titles. |
| `port` | number | none | Base port of the three listeners and clients, see below. |
| `timeout` | number (milliseconds) | `5555` | Limit for each test case, for the service to become ready, and for the service to close. |

## `seneca` and `client`

The instances must already have the transport plugin loaded (and any
other plugin the transport needs). Each call of a test function loads
the service plugin into the service instance and adds listeners to it,
so give each call its own instance, or a function that makes new ones.

Which instance is used where:

| `seneca` | `client` | Service | Client |
| -------- | -------- | ------- | ------ |
| function | not set | `seneca()` | `seneca()` |
| function | instance | `seneca()` | `client` |
| instance | instance | `seneca` | `client` |
| instance | not set | `seneca` | `seneca` (the same instance; kept for compatibility with version 1.0, see [API reference](api.md#compatibility-with-version-10)) |

## `port`

The service listens three times; the clients connect to the same
numbers.

| `port` | Listener 1 (no pin) | Listener 2 (`role:a,cmd:*`) | Listener 3 (`role:b,cmd:*`) |
| ------ | ------------------- | --------------------------- | --------------------------- |
| not set, or `0` | no `port` key: Seneca core fills in `options.transport.port` (`10101` unless set) | `10102` | `10103` |
| positive `n` | `n` | `n + 1` | `n + 2` |
| negative `-n` | `n` | `n` | `n` |

A negative port is for transports whose listeners share one port, such
as the port of a message broker: the three listeners and all clients
then get the same `port` value, and only their pins differ. See
[Test a transport that needs options or ports](../how-to/test-a-transport-that-needs-options-or-ports.md#test-a-transport-whose-listeners-share-one-port).

## `timeout`

Lab stops a test after 2000 ms by default and node:test never does. The
functions pass `timeout` to each `it` call, so both runners stop a case
that does not finish, and they apply the same limit to the `before` and
`after` hooks themselves. Raise it for slow transports.
