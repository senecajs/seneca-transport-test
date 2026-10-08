# Run the cases with lab

Goal: run the standard cases with [lab](https://hapi.dev/module/lab/)
(`@hapi/lab`), as part of a lab test suite.

## 1. Create a script and pass it

```js
// test/standard.test.js
const Lab = require('@hapi/lab')
const Seneca = require('seneca')
const TransportTest = require('@seneca/transport-test')
const MyTransport = require('..')

const lab = (exports.lab = Lab.script())

function make () {
  return Seneca().test().use(MyTransport)
}

TransportTest.basictest({ seneca: make, script: lab, type: 'mytype', port: 10201 })
TransportTest.basicpintest({ seneca: make, script: lab, type: 'mytype', port: 10211 })
```

Export the script as `lab`: the `lab` command runs the script exported
under that name. Your own lab tests can share the same script.

## 2. Run it

```sh
npx lab -v test/standard.test.js
```

A complete example is in
[examples/memory-transport-lab.test.js](../examples/memory-transport-lab.test.js).
Its output (Node.js 24, seneca 4.0.0-rc5):

```
Basic Transport for type memory
  ✔ 1) should execute three consecutive calls (478 ms)
Basic Transport using pin for type memory
  ✔ 2) should execute two consecutive calls using pin (259 ms)


2 tests complete
Test duration: 1266 ms
Leaks: No issues
```

Use the `lab` command, not plain `node`: a lab script started with
`node` runs, but the process exits with code 0 even when tests fail.

## 3. Run one case

```sh
npx lab -v -g "using pin" test/standard.test.js
```

`-g` runs only the cases whose full name matches the pattern.

## 4. Use the default script for a single suite

Without `script`, a test function creates a lab script and returns it:

```js
exports.lab = TransportTest.basictest({ seneca: make, type: 'mytype', port: 10201 })
```

Each call makes its own script, and lab runs only the one exported as
`lab`, so this form suits one suite per file. In this form
`@hapi/lab` must be installed in your project.

## 5. Timeouts and leak detection

Lab stops a case after 2000 ms by default. The test functions pass
their own limit, `settings.timeout` (default 5555 ms), to each case, and
a case over the limit fails with `Timed out (5555ms) - <case name>`.

Lab's global leak detection reported no issues with seneca 4 and
seneca-transport on Node.js 24. If it reports leaked globals created by
your transport or its dependencies, add `-l` to turn the check off.
