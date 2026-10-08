/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// The standard transport tests applied to the memory transport, with
// node:test as the runner. Run it with either of:
//
//   node docs/examples/memory-transport-node.test.js
//   node --test docs/examples/memory-transport-node.test.js

const Seneca = require('seneca')

// In your own plugin: require('@seneca/transport-test')
const TransportTest = require('../..')

const MemoryTransport = require('./memory-transport')

// Called once for the service instance and once for the client instance.
function make () {
  return Seneca().test().use(MemoryTransport)
}

TransportTest.basictest({
  seneca: make,
  script: require('node:test'),
  type: 'memory',
  port: 10801,
})

TransportTest.basicpintest({
  seneca: make,
  script: require('node:test'),
  type: 'memory',
  port: 10811,
})
