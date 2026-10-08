# API reference

`@seneca/transport-test` exports two functions. Each one registers one
test suite on a test script and returns the script. Both take the same
[settings](settings.md) object.

```js
const TransportTest = require('@seneca/transport-test')
```

The functions do not load Seneca: the caller provides the instances,
through `settings.seneca` and `settings.client`. The package therefore
has no dependency or peer dependency on `seneca`.

## `basictest(settings)`

Registers the suite `Basic Transport for type <type>`:

| Hook or test | What it does |
| ------------ | ------------ |
| `before` | Takes the service instance (see [Settings](settings.md#seneca-and-client)), loads the [service plugin](messages.md#the-service-plugin) into it and starts the three [listeners](messages.md#listeners). Waits for the instance to be ready (callback form of `ready`); fails after `settings.timeout` ms. |
| `it('should execute three consecutive calls')` | Takes the client instance, adds a client without pin for the first listener, waits for ready, then makes the [basic calls](messages.md#basic-calls): two `foo:1` calls, one `nores:1` call and one fire-and-forget `faf:1` call. Closes the client instance with `close(callback)`, also when a call failed. The case fails after `settings.timeout` ms. |
| `after` | Closes the client of a case that timed out before it could close it (a separate client instance only), then the service instance, each with `close(callback)`; fails after `settings.timeout` ms. |

Returns `settings.script`, or the lab script the function created when
`settings.script` was not given.

## `basicpintest(settings)`

Registers the suite `Basic Transport using pin for type <type>`:

| Hook or test | What it does |
| ------------ | ------------ |
| `before` | As for `basictest`. |
| `it('should execute two consecutive calls using pin')` | Takes the client instance and adds two clients with pins: `'role: a, cmd:*'` (a string) for the second listener and `{ role: 'b', cmd: '*' }` (an object) for the third. Waits for ready, then makes the [pin calls](messages.md#pin-calls). Closes the client instance, also when a call failed. The case fails after `settings.timeout` ms. |
| `after` | As for `basictest`. |

Returns the script.

## Errors

The functions raise these errors. Every message starts with
`seneca-transport-test: `.

| Message | Cause | Raised by |
| ------- | ----- | --------- |
| `settings.seneca must be a Seneca instance or a function that returns a new Seneca instance` | `settings.seneca` is missing, or is neither a function nor an object with the `act`, `use` and `close` methods. | The function call itself (thrown). |
| `settings.client must be a Seneca instance` | `settings.client` is given but lacks the `act`, `use` or `close` methods. | The function call itself (thrown). |
| `the settings.seneca function must return a new Seneca instance` | The `settings.seneca` function returned something without those methods. | The `before` hook (service) or the case (client). |
| `service not ready within <timeout>ms` | The service instance did not become ready: a listen hook did not reply. | The `before` hook. |
| `client not closed within <timeout>ms` | A case timed out, and closing its client in the `after` hook did not call back. | The `after` hook. |
| `service not closed within <timeout>ms` | `close()` did not call back: a close action did not continue the chain. | The `after` hook. |

An error replied to a call, or a failed assertion, fails the case with
that error. Assertions are checked inside the reply callbacks and
passed to the case, so they are reported at once rather than as a
timeout. See [Diagnose a failing case](../how-to/diagnose-a-failing-case.md).

## Test script requirements

`settings.script` must provide `describe(title, fn)`;
`it(title, options, fn)`, where `options.timeout` is a limit in
milliseconds and `fn` returns a promise; and `before(fn)` and
`after(fn)`, where `fn` returns a promise. A lab script
(`require('@hapi/lab').script()`) and the `node:test` module both do.

## Compatibility with version 1.0

The 1.0 call shape, `{ seneca: instance, script, type, port }`, is
accepted: the single instance is used for both the service and the
client. The service's actions are then local to the client instance
and more specific than the client patterns (`foo:1` against the empty
pattern of the client without pin, `role:a,cmd:1` against
`role:a,cmd:*`), so the calls are answered locally and no message
travels over the transport. Pass a
function as `settings.seneca`, or an instance as `settings.client`, to
test the transport itself.
