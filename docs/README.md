# @seneca/transport-test documentation

The documentation follows the [Diátaxis](https://diataxis.fr/)
structure: four sections with four different jobs. Start with the
tutorial if you are adding the cases to a transport for the first time;
use the how-to guides for specific tasks; look things up in the
reference; read the explanations to understand what the cases check and
why.

## Tutorials

| Tutorial | What you build |
| -------- | -------------- |
| [Getting started](tutorials/getting-started.md) | The standard cases added to a small transport plugin and run under node:test, with the output explained step by step. |

The programs are in [examples](examples/).

## How-to guides

| Guide | Covers |
| ----- | ------ |
| [Run the cases with node:test](how-to/run-the-cases-with-node-test.md) | `script: require('node:test')`, running a file or one suite, timeouts, a process that does not exit (`--test-force-exit`). |
| [Run the cases with lab](how-to/run-the-cases-with-lab.md) | `Lab.script()` and `exports.lab`, running one case, the default script, timeouts, leak detection. |
| [Test a transport that needs options or ports](how-to/test-a-transport-that-needs-options-or-ports.md) | Plugin options, client options, choosing ports, listeners that share a broker port, starting a broker, type names, configuration keys from core, slow transports. |
| [Diagnose a failing case](how-to/diagnose-a-failing-case.md) | Each failure message, what it means and where to look in the transport; message logs; running one suite. |

## Reference

| Reference | Describes |
| --------- | --------- |
| [API](reference/api.md) | `basictest`, `basicpintest`, their errors, test script requirements, compatibility with version 1.0. |
| [Settings](reference/settings.md) | Every setting with type, default and effect; the port layout. |
| [Messages and assertions](reference/messages.md) | The service plugin's patterns, the listeners, the clients, every call and every assertion. |

## Explanation

| Explanation | Topic |
| ----------- | ----- |
| [Why a conformance suite](explanation/why-a-conformance-suite.md) | What the cases check and do not check; why the caller provides the instances, why two instances, why one process. |
| [What a transport must provide](explanation/what-a-transport-must-provide.md) | The two hook actions, carrying messages and replies, several listeners, fire-and-forget, close hooks. |
| [Seneca 3 and Seneca 4](explanation/seneca-3-and-4.md) | Differences that affect transports and their tests; how seneca-transport fares on each version. |

## Feature index

Every export, setting, suite, message pattern and error of the package,
with the page that documents it.

| Feature | Kind | Documented in |
| ------- | ---- | ------------- |
| `basictest(settings)` | export | [API](reference/api.md#basictestsettings) |
| `basicpintest(settings)` | export | [API](reference/api.md#basicpintestsettings) |
| `settings.seneca` | setting | [Settings](reference/settings.md#seneca-and-client) |
| `settings.client` | setting | [Settings](reference/settings.md#seneca-and-client) |
| `settings.script` | setting | [Settings](reference/settings.md), [Run the cases with node:test](how-to/run-the-cases-with-node-test.md), [Run the cases with lab](how-to/run-the-cases-with-lab.md) |
| `settings.type` | setting | [Settings](reference/settings.md), [Test a transport that needs options or ports](how-to/test-a-transport-that-needs-options-or-ports.md#use-the-right-type-name) |
| `settings.port` | setting | [Settings](reference/settings.md#port) |
| `settings.timeout` | setting | [Settings](reference/settings.md#timeout) |
| Suite `Basic Transport for type <type>`, case `should execute three consecutive calls` | test suite | [API](reference/api.md#basictestsettings), [Basic calls](reference/messages.md#basic-calls) |
| Suite `Basic Transport using pin for type <type>`, case `should execute two consecutive calls using pin` | test suite | [API](reference/api.md#basicpintestsettings), [Pin calls](reference/messages.md#pin-calls) |
| `foo:1`, `foo:2`, `foo:3`, `foo:4`, `foo:5` | service action patterns | [The service plugin](reference/messages.md#the-service-plugin) |
| `nores:1` | service action pattern (empty reply) | [The service plugin](reference/messages.md#the-service-plugin) |
| `faf:1` | service action pattern (fire-and-forget) | [The service plugin](reference/messages.md#the-service-plugin) |
| `role:a,cmd:1`, `role:b,cmd:2` | service action patterns (pins) | [The service plugin](reference/messages.md#the-service-plugin) |
| Listener 1 (no pin), listener 2 (`role:a,cmd:*`), listener 3 (`role:b,cmd:*`) | listen configurations | [Listeners](reference/messages.md#listeners) |
| Client without pin, client with pin `'role: a, cmd:*'`, client with pin `{ role: 'b', cmd: '*' }` | client configurations | [Clients](reference/messages.md#clients) |
| `settings.seneca must be a Seneca instance or a function that returns a new Seneca instance` | error | [Errors](reference/api.md#errors) |
| `service not ready within <timeout>ms` | error | [Errors](reference/api.md#errors), [Diagnose a failing case](how-to/diagnose-a-failing-case.md) |
| `service not closed within <timeout>ms` | error | [Errors](reference/api.md#errors), [Diagnose a failing case](how-to/diagnose-a-failing-case.md) |
| Default timeout 5555 ms | constant | [Settings](reference/settings.md#timeout) |
| Single instance for both sides (version 1.0 call shape) | compatibility | [API](reference/api.md#compatibility-with-version-10) |
| `npm test`, `npm run test-lab`, `npm run test-node`, `npm run coverage` | repository scripts | [README](../README.md#contributing) |

## Other documents

* [Change log](../CHANGES.md)
* [Code of conduct](../CODE_OF_CONDUCT.md)
* [License](../LICENSE)
* [CI patches](../.patches/README.md)
