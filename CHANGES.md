## 1.1.0 2026-10-08

* The package is published as `@seneca/transport-test` (version 1.0.0
  was published as `seneca-transport-test`).
* Seneca 4 support: tested against seneca 4.0.0-rc5 and the unreleased
  4.0.0, with seneca-transport 8.3.0 and the unreleased 8.4.0. Seneca 3
  instances are still accepted (tested with 3.38). Node.js 24 and 22.
* The service and the client can be separate Seneca instances: pass a
  function that returns a new instance as `settings.seneca` (it is
  called once for each side), or pass the client instance as
  `settings.client`. With the 1.0 call shape, one instance for both
  sides, the service's local actions answer and no message crosses the
  transport, on Seneca 3 and 4 alike; that shape still works, for
  compatibility.
* The service actions `role:a,cmd:1` and `role:b,cmd:2` reply with
  `reply(null, out)` instead of `this.good(out)`, which Seneca 4
  removed.
* A failed assertion now fails its case at once, with the assertion
  error. Seneca catches errors thrown inside `act` callbacks and only
  logs them, so such cases used to fail later as a timeout. A failed
  fire-and-forget check is no longer an uncaught exception.
* The client instance is closed when a case fails too, and by the
  `after` hook when a case times out before its callback runs, so that a
  broken transport does not keep the process alive.
* `settings.seneca`, `settings.client` and the instances that a
  `settings.seneca` function returns must have the Seneca `act`, `use`
  and `close` methods; anything else fails with a settings error instead
  of a later `TypeError`.
* New setting `timeout` (default 5555 ms): the limit for each case, and
  for the service to become ready and to close. It replaces lab's
  default of 2000 ms per case. A service that does not become ready or
  does not close fails with `seneca-transport-test: service not ready
  within <timeout>ms` or `... not closed within <timeout>ms` instead of
  hanging the run.
* `@hapi/lab` is loaded only when `settings.script` is not given, so the
  cases run under node:test (`script: require('node:test')`) without lab
  installed.
* `ready` is used in its callback form (the promise form can wait
  forever on an idle seneca 4.0.0-rc5 instance).
* `port: 0` is treated like no port (the first listener used to listen
  on port 0, which no client could reach).
* `settings.seneca` is checked: a missing or invalid value throws an
  error that says what is expected.
* Repository: a real self test, `test/lab.test.js` (lab 26) and
  `test/node.test.js` (node:test), running both cases against
  seneca-transport over web and tcp (`npm test` used to run no test).
  The tcp cases that seneca-transport 8.3.0 cannot pass on Seneca 4 are
  reported as skipped, with the reason. devDependencies `seneca@^4.0.0-rc5`
  and `seneca-transport@^8.3.0` added, unused `acorn` removed; `.npmrc`
  sets `legacy-peer-deps` while published plugins exclude the Seneca 4
  prerelease from their peer range. The lockfile was regenerated against
  the public registry. Travis CI configuration and the coveralls script
  removed; a GitHub Actions workflow is provided in
  `.patches/0001-ci-add-build-workflow.patch`.
* Documentation reorganized following the Diátaxis structure (see
  `docs/`); the package now includes `docs/` and `CHANGES.md`.

## 1.0.0

* `basictest` and `basicpintest` for lab, published as
  `seneca-transport-test`.
