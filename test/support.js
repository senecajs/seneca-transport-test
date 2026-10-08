/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// Shared by the repository's own tests (test/lab.test.js, test/node.test.js).

const Seneca = require('seneca')

const seneca_version = require('seneca/package.json').version
const transport_version = require('seneca-transport/package.json').version

// A new Seneca instance with the transport under test. The harness calls
// this once for the service side and once for the client side.
function make () {
  return Seneca().test().use('seneca-transport')
}

const [seneca_major] = seneca_version.split('.').map(Number)
const [transport_major, transport_minor] = transport_version
  .split('.')
  .map(Number)

const transport_before_8_4 =
  transport_major < 8 || (8 === transport_major && transport_minor < 4)

// seneca-transport before 8.4.0 cannot run the tcp cases on seneca
// 4.0.0-rc: core copies the web path /act into every listen
// configuration, and the tcp listener treats any path as a UNIX socket
// path, so tcp listeners do not bind. (On seneca 4.0.0 a tcp client
// without pin also forwarded its close message to the service until the
// core fix in senecajs/seneca#953, so that case is not skipped there.)
// Returns the reason to skip the tcp case `name`, or null to run it.
function tcp_skip (name) {
  if (4 !== seneca_major || !transport_before_8_4) return null

  const installed =
    ' (seneca-transport ' + transport_version + ', seneca ' + seneca_version + ')'

  if (/^4\.0\.0-rc/.test(seneca_version)) {
    return 'tcp listeners do not bind' + installed
  }

  return null
}

module.exports = {
  make,
  seneca_version,
  transport_version,
  tcp_skip,
}
