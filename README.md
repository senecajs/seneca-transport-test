![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] plugin

# @seneca/transport-test

The standard test cases for Seneca transport plugins. Add them to the
test suite of your transport to check that messages, replies, pins and
fire-and-forget calls travel correctly between a service instance and a
client instance. The cases run under lab or node:test, with Seneca 4
(tested against 4.0.0-rc5 and the unreleased 4.0.0) and Seneca 3, on
Node.js 24 and 22.

[![npm version][npm-badge]][npm-url]

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
npm install --save-dev @seneca/transport-test
```

Version 1.0.0 was published as `seneca-transport-test`; from the next
version the package is `@seneca/transport-test`.

The test functions receive Seneca instances from your test, so the
package has no dependency on `seneca`: install `seneca` and your
transport plugin yourself.

## Quick Example

```js
// test/standard.test.js, run with: node --test
const Seneca = require('seneca')
const TransportTest = require('@seneca/transport-test')
const MyTransport = require('..')

// Called once for the service instance and once for the client instance.
function make () {
  return Seneca().test().use(MyTransport)
}

TransportTest.basictest({
  seneca: make,
  script: require('node:test'),
  type: 'mytype',
  port: 10101,
})

TransportTest.basicpintest({
  seneca: make,
  script: require('node:test'),
  type: 'mytype',
  port: 10111,
})
```

Each function registers one test suite: a service instance listens on
three ports (`port`, `port + 1` and `port + 2`), a client instance sends
messages to it through your transport, and the replies are checked.

## More Examples

* [Getting started](docs/tutorials/getting-started.md): the cases added
  to a small transport plugin, with the complete program and its output.
* [Run the cases with node:test](docs/how-to/run-the-cases-with-node-test.md)
  and [Run the cases with lab](docs/how-to/run-the-cases-with-lab.md).
* [Test a transport that needs options or ports](docs/how-to/test-a-transport-that-needs-options-or-ports.md).
* [Diagnose a failing case](docs/how-to/diagnose-a-failing-case.md).
* The example programs are in [docs/examples](docs/examples/); the
  repository's own tests in [test](test/) run the cases against
  seneca-transport.

## Motivation

Every Seneca transport has to do the same things: carry a message to a
listener, bring the reply back, respect pins, and deliver messages that
have no callback. A shared suite checks these once and in the same way
for every transport, so that a plugin which passes it behaves like the
others. See [Why a conformance suite](docs/explanation/why-a-conformance-suite.md).

## Support

* [GitHub issues](https://github.com/senecajs/seneca-transport-test/issues)
* The [Seneca documentation](https://senecajs.org/) and the
  [Seneca 4 documentation](https://github.com/senecajs/seneca/tree/master/docs)
* Commercial support from [Voxgig](https://www.voxgig.com)

## API

| Function | Suite | Reference |
| -------- | ----- | --------- |
| `basictest(settings)` | `Basic Transport for type <type>`: a client without pin makes two calls, one call with an empty reply and one fire-and-forget call. | [API](docs/reference/api.md#basictestsettings) |
| `basicpintest(settings)` | `Basic Transport using pin for type <type>`: two clients with pins (string form and object form) make one call each. | [API](docs/reference/api.md#basicpintestsettings) |

| Setting | Meaning | Reference |
| ------- | ------- | --------- |
| `seneca` | Service instance, or a function that returns a new instance for each side. | [Settings](docs/reference/settings.md#seneca-and-client) |
| `client` | Client instance. | [Settings](docs/reference/settings.md#seneca-and-client) |
| `script` | A lab script or the `node:test` module. | [Settings](docs/reference/settings.md) |
| `type` | Transport type for `listen` and `client`. | [Settings](docs/reference/settings.md) |
| `port` | Base port of the three listeners. | [Settings](docs/reference/settings.md#port) |
| `timeout` | Limit per case and for ready and close; default 5555 ms. | [Settings](docs/reference/settings.md#timeout) |

The messages the cases send and the assertions they make are listed in
[Messages and assertions](docs/reference/messages.md). The complete
index is in [docs/README.md](docs/README.md).

## Contributing

The [Senecajs org][] encourages open participation. If you feel you can
help in any way, be it with documentation, examples, extra testing, or
new features please get in touch.

### Running the tests

The repository's own tests run every case against `seneca-transport`
under lab and under node:test:

```sh
npm install
npm test
```

`npm run test-lab` and `npm run test-node` run one runner each, and
`npm run coverage` writes a lab coverage report to `coverage.html`.
Use Node.js 24 (Node.js 22 is also tested). The devDependency is the
Seneca 4 prerelease, `seneca@^4.0.0-rc5`; `.npmrc` sets
`legacy-peer-deps` while published plugins exclude the prerelease from
their peer range. To test against another Seneca build, run
`npm install --no-save <tarball, or seneca@version>` and `npm test`,
then `npm install` to restore the devDependency.

With seneca-transport 8.3.0 (the published version) some tcp cases
cannot pass on Seneca 4: both on 4.0.0-rc5, the basic case on 4.0.0.
The tests skip them and give the reason in the report; all cases run
with Seneca 3, and with seneca-transport 8.4.0. See
[Seneca 3 and Seneca 4](docs/explanation/seneca-3-and-4.md#seneca-transport-on-each-version).

CI: the GitHub Actions workflow is provided as a patch in
[.patches](.patches/README.md); apply it with `git am .patches/*.patch`.

## Background

The cases date from 2014 and are shared by Seneca transport plugins;
the tests of [seneca-transport](https://github.com/senecajs/seneca-transport)
depend on `seneca-transport-test@^1.0.0`. Version 1.0.0 was published
as `seneca-transport-test`; from the next version the package is
`@seneca/transport-test`. Version 1.1.0 adds Seneca 4 and node:test
support, and tests the transport with separate service and client
instances.

| Version | Seneca | Node.js | Test runners |
| ------- | ------ | ------- | ------------ |
| 1.1.0 | 3.x (tested: 3.38), 4.0.0-rc5, 4.0.0 | tested on 24 and 22 | lab 26, node:test, or any script with `describe`, `it`, `before` and `after` |
| 1.0.0 | 3.x | 8, 10, 11 (Travis CI) | lab |

Changes: [CHANGES.md](CHANGES.md). License: [MIT][].

[npm-badge]: https://img.shields.io/npm/v/@seneca/transport-test.svg
[npm-url]: https://npmjs.com/package/@seneca/transport-test
[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
