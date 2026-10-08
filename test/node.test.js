/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// The repository's own test, under node:test: the same cases as
// test/lab.test.js, with the node:test module as the script.
// Run with: node --test --test-force-exit test/node.test.js
// (--test-force-exit is needed with seneca-transport 8.3.0 on seneca
// 4.0.0-rc5, where the transport's close hooks do not run and the
// listeners stay open; see docs/how-to/run-the-cases-with-node-test.md)

const script = require('node:test')

// The package itself (@seneca/transport-test).
const Shared = require('..')
const Support = require('./support')

// web: one instance for the service, one for the client
Shared.basictest({ seneca: Support.make, script, type: 'web', port: 10621 })
Shared.basicpintest({ seneca: Support.make, script, type: 'web', port: 10631 })

// web, with the version 1.0 call shape: a single instance for both sides
// (the local actions answer; kept for compatibility)
Shared.basictest({ seneca: Support.make(), script, type: 'web', port: 10641 })
Shared.basicpintest({ seneca: Support.make(), script, type: 'web', port: 10651 })

// tcp: a case the installed seneca-transport cannot pass on the installed
// seneca is reported as skipped, with the reason (see test/support.js)
for (const [name, port] of [['basictest', 10721], ['basicpintest', 10731]]) {
  const reason = Support.tcp_skip(name)

  if (reason) {
    script.it(name + ' over tcp', { skip: reason }, () => {})
  } else {
    Shared[name]({ seneca: Support.make, script, type: 'tcp', port })
  }
}
