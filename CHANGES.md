# Changes

## 2.0.0 2026-11-20

First release under the name `@seneca/transport-test`. Version 1.1.0
was prepared in the repository but never published; its changes are
part of this release.

* Seneca 4: the peer dependency is `seneca` `^4.0.0`. Seneca 3 users
  stay on `seneca-transport-test@1`. Tested against seneca 4.0.0 with
  @seneca/transport 9.0.0, over web and tcp.
* Renamed from `seneca-transport-test` to `@seneca/transport-test`.
* Node.js 24 or later (`engines.node` `>=24`).
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
* `ready` is used in its callback form.
* `port: 0` is treated like no port (the first listener used to listen
  on port 0, which no client could reach).
* `settings.seneca` is checked: a missing or invalid value throws an
  error that says what is expected.
* Repository: a real self test, `test/lab.test.js` (lab 26) and
  `test/node.test.js` (node:test), running both cases against
  @seneca/transport over web and tcp, loaded by its full name
  (`npm test` used to run no test). Development dependencies `seneca`
  `^4.0.0` and `@seneca/transport` `^9.0.0` added, unused `acorn`
  removed. No `package-lock.json` or `.npmrc` is committed. Travis CI
  configuration, the coveralls script and the `repo-tag` and
  `repo-publish` scripts removed.
* Documentation reorganized following the Diátaxis structure (see
  `docs/`); the package now includes `docs/` and `CHANGES.md`.

## 1.0.0

* `basictest` and `basicpintest` for lab, published as
  `seneca-transport-test`.
