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

// seneca-transport before 8.4.0 has two tcp problems on Seneca 4:
// - On seneca 4.0.0-rc, tcp listeners do not bind: core copies the web path
//   /act into every listen configuration, and the tcp listener treats any
//   path as a UNIX socket path.
// - The close hook of a tcp client without pin does not finish: it is
//   registered on role:seneca,cmd:close, which has no builtin action on
//   Seneca 4, so the catch-all client action becomes its prior and the close
//   message is sent to the transport, where nothing answers it
//   (action_timeout after 22 seconds). seneca 4.0.0-rc5 never calls hooks on
//   that pattern, so this shows on 4.0.0.
// Returns the reason to skip the tcp case `name`, or null to run it.
function tcp_skip (name) {
  if (4 !== seneca_major || !transport_before_8_4) return null

  const installed =
    ' (seneca-transport ' + transport_version + ', seneca ' + seneca_version + ')'

  if (/^4\.0\.0-rc/.test(seneca_version)) {
    return 'tcp listeners do not bind' + installed
  }

  if ('basictest' === name) {
    return 'the tcp client without pin does not close' + installed
  }

  return null
}

module.exports = {
  make,
  seneca_version,
  transport_version,
  tcp_skip,
}
