/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// A memory transport: a small transport plugin that passes the standard
// transport tests. It moves messages between Seneca instances in the same
// process through a JSON round trip. It stands in for your own transport in
// docs/tutorials/getting-started.md and is not meant for real use.
//
// It needs Seneca 4: it uses the transport helpers of Seneca 4 core. (On
// Seneca 3, seneca-transport is loaded by default and replaces the
// transport/utils export with helpers of its own.)

// Listeners by port: each listen call takes a port (a number) and receives
// the messages that clients send to that port.
const listeners = {}

module.exports = function memory (options) {
  const seneca = this

  // Helpers from Seneca core: externalize/internalize messages and replies.
  const utils = seneca.export('transport/utils')

  // listen: the message is the listen configuration (type, port, pin, ...).
  seneca.add('role:transport,hook:listen,type:memory', function (config, reply) {
    const port = config.port

    listeners[port] = function receive (data, respond) {
      const msg = utils.internalize_msg(seneca, data)
      seneca.act(msg, function (err, out, meta) {
        respond(utils.externalize_reply(seneca, err, out, meta))
      })
    }

    // Seneca 4 closes an instance through sys:seneca,cmd:close. Release the
    // listener, then continue the chain.
    seneca.add('sys:seneca,cmd:close', function (msg, reply) {
      delete listeners[port]
      this.prior(msg, reply)
    })

    reply(null, { type: 'memory', port })
  })

  // client: reply with an object that has a send function.
  seneca.add('role:transport,hook:client,type:memory', function (config, reply) {
    const port = config.port

    reply(null, {
      send: function (msg, reply, meta) {
        const receive = listeners[port]

        if (null == receive) {
          return reply(new Error('memory transport: nothing listens on port ' + port))
        }

        const data = roundtrip(utils.externalize_msg(seneca, msg, meta))

        receive(data, function (replydata) {
          const res = utils.internalize_reply(seneca, roundtrip(replydata))
          reply(res.err, res.out, res.meta)
        })
      },
    })
  })

  // What a real transport does on the wire: encode, send, decode.
  function roundtrip (obj) {
    return utils.parseJSON(utils.stringifyJSON(obj))
  }
}
