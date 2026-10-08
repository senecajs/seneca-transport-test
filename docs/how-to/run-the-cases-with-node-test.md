# Run the cases with node:test

Goal: run the standard cases with the Node.js test runner (`node --test`),
without lab.

## 1. Pass the node:test module as the script

```js
// test/standard.test.js
const Seneca = require('seneca')
const TransportTest = require('@seneca/transport-test')
const MyTransport = require('..')

function make () {
  return Seneca().test().use(MyTransport)
}

TransportTest.basictest({
  seneca: make,
  script: require('node:test'),
  type: 'mytype',
  port: 10201,
})

TransportTest.basicpintest({
  seneca: make,
  script: require('node:test'),
  type: 'mytype',
  port: 10211,
})
```

The test functions use `describe`, `it`, `before` and `after` from the
script, and the `node:test` module provides all four. Lab is loaded
only when `script` is not given, so it does not need to be installed.

## 2. Run the file

```sh
node --test test/standard.test.js
```

Or run every test file: `node --test test/`. Running the file with
plain `node` also works. A complete example is in
[examples/memory-transport-node.test.js](../examples/memory-transport-node.test.js),
and the [tutorial](../tutorials/getting-started.md) shows its output.

## 3. Run one suite

Select suites or cases by name:

```sh
node --test --test-name-pattern="using pin" test/standard.test.js
```

The suite names are `Basic Transport for type <type>` and
`Basic Transport using pin for type <type>`.

## 4. Mind the timeout

node:test has no default time limit. The test functions pass
`{ timeout: settings.timeout }` (default 5555 ms) to each case and apply
the same limit to their `before` and `after` hooks, so a case that never
gets its reply fails with `'test timed out after 5555ms'` instead of
hanging. Raise it with `timeout: 20000` for slow transports (see
[Settings](../reference/settings.md#timeout)).

## 5. If the process does not exit

When every case passes but `node --test` does not exit, something the
transport opened is still open after `close()`: a listening socket or a
connection. node:test waits for it. Interrupting the run then reports
the file as failed with
`'Promise resolution is still pending but the event loop has already resolved'`.

Fix it in the transport: release the resources in a close action, and
on Seneca 4 register that action on `sys:seneca,cmd:close` (see
[Seneca 3 and Seneca 4](../explanation/seneca-3-and-4.md#closing)).

seneca-transport 8.3.0 on seneca 4.0.0-rc5 has this problem: its close
actions are registered on `role:seneca,cmd:close`, which rc5 never
calls. Until you can use a fixed version, let node:test end the process
once the tests are done:

```sh
node --test --test-force-exit test/
```

This repository's own `npm test` does so for that reason.
