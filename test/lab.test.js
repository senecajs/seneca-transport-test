/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// The repository's own test, under lab: every exported case runs against
// seneca-transport over web and tcp. Run with: npm test

const Lab = require('@hapi/lab')

// The package itself (@seneca/transport-test).
const Shared = require('..')
const Support = require('./support')

const lab = (exports.lab = Lab.script())

// web: one instance for the service, one for the client
Shared.basictest({ seneca: Support.make, script: lab, type: 'web', port: 10601 })
Shared.basicpintest({ seneca: Support.make, script: lab, type: 'web', port: 10611 })

// tcp: a case the installed seneca-transport cannot pass on the installed
// seneca is reported as skipped, with the reason (see test/support.js)
for (const [name, port] of [['basictest', 10701], ['basicpintest', 10711]]) {
  const reason = Support.tcp_skip(name)

  if (reason) {
    lab.it(name + ' over tcp skipped: ' + reason, { skip: true }, () => {})
  } else {
    Shared[name]({ seneca: Support.make, script: lab, type: 'tcp', port })
  }
}
