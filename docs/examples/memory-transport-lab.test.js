/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// The standard transport tests applied to the memory transport, with lab
// as the runner. Run it with:
//
//   npx lab -v docs/examples/memory-transport-lab.test.js

const Lab = require('@hapi/lab')
const Seneca = require('seneca')

// In your own plugin: require('@seneca/transport-test')
const TransportTest = require('../..')

const MemoryTransport = require('./memory-transport')

const lab = (exports.lab = Lab.script())

// Called once for the service instance and once for the client instance.
function make () {
  return Seneca().test().use(MemoryTransport)
}

TransportTest.basictest({ seneca: make, script: lab, type: 'memory', port: 10821 })
TransportTest.basicpintest({ seneca: make, script: lab, type: 'memory', port: 10831 })
