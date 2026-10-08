# Diagnose a failing case

Goal: find out from a failing standard case what your transport does
wrong.

## 1. Read the failure

Each failure below was reproduced while writing this page. The
messages are those of node:test; lab prints the same errors under
`Failed tests:`, and hook failures under `Test script errors:`.

| Failure | Meaning | Look at |
| ------- | ------- | ------- |
| `AssertionError [ERR_ASSERTION]: '{"dee":"1-A"}' == '{"dee":"1-A","extra":true}'` | The reply has properties that the action did not reply. | How the client side builds `out` before calling `reply`: remove what the transport added (for example `meta$`). The core helper `internalize_reply` does this. |
| `AssertionError [ERR_ASSERTION]: null == {}` | The empty reply of `nores:1` arrived as an object. | Empty replies: `externalize_reply` marks them with `meta.empty`, and the client side must reply with no result for them (`internalize_reply` does). |
| `AssertionError [ERR_ASSERTION]: '0.9909580927087301' == undefined` (the number is random) | The fire-and-forget message `faf:1` did not reach the service within 222 ms. | `send` must deliver messages that have no callback, and promptly. |
| An error, for example `Error: broken transport: refused` | A call was replied with an error, by the transport or by the remote side. | The error itself, and the `act/ERR` line in the log. |
| `'test timed out after 5555ms'` (lab: `Timed out (5555ms) - <case name>`) | A reply never arrived, the client instance never became ready, or it did not close. Seneca's own action timeout (22222 ms) is longer than the case's. | `send` must call `reply` exactly once for every message; the client hook must reply; the client's close actions must continue the chain. |
| `seneca-transport-test: service not ready within 5555ms` | The service instance did not become ready. | The listen hook must call `reply` once the listener is up. |
| `seneca-transport-test: service not closed within 5555ms` | Closing the service did not finish. | A close action must call `this.prior(msg, reply)` after releasing its resources. |
| Log: `No matching action pattern found for { type: '<type>', ... role: 'transport', hook: 'listen' }`, then `=== SENECA FATAL ERROR ===`; the case times out | No action answers the listen hook for this type. | The factory loads the plugin (`.use(...)`), and `type` is the type in the plugin's hook patterns. |
| Log: `EADDRINUSE` and `=== SENECA FATAL ERROR ===` | A port of the suite is in use. | [Choose the ports](test-a-transport-that-needs-options-or-ports.md#choose-the-ports). |
| `TypeError: Cannot read properties of undefined (reading 'headers')` in the log, with `type: 'http'` | seneca-transport 8.3.0 on Seneca 4 has no options for the `http` type. | Use `type: 'web'`, or seneca-transport 8.4.0. |
| node:test reports the results but does not exit | Something is still open after `close()`. | [If the process does not exit](run-the-cases-with-node-test.md#5-if-the-process-does-not-exit). |

The table of every call and assertion is in
[Messages and assertions](../reference/messages.md).

## 2. Watch the messages

Make the instances print their log, including every message in and
out, with `test('print')`:

```js
function make () {
  return Seneca().test('print').use(MyTransport)
}
```

Each line starts with the elapsed milliseconds and two characters of
the instance id, which tell the service's lines from the client's.
`act/IN` and `act/OUT` lines show each message and its reply; `act/ERR`
lines show errors. Plain `test()` logs at level `warn`, so only
warnings and errors are printed. The log format is described in the
[Seneca logging reference](https://github.com/senecajs/seneca/blob/master/docs/reference/logging.md).

## 3. Run one suite at a time

```sh
node --test --test-name-pattern="using pin" test/standard.test.js
npx lab -v -g "using pin" test/standard.test.js
```

## 4. Give the case more time while you debug

Time spent at a breakpoint counts against the case's limit. Raise
`timeout` (for example `timeout: 600000`) while you step through the
transport.
