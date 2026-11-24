/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// Shared by the repository's own tests (test/lab.test.js, test/node.test.js).

const Seneca = require('seneca')

// A new Seneca instance with the transport under test. The tests call
// this once for the service side and once for the client side.
function make () {
  return Seneca().test().use('@seneca/transport')
}

module.exports = {
  make
}
