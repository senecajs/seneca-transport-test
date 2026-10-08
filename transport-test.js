/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */

'use strict'

var Assert = require('assert')

// Default limit, in milliseconds, for each test case and for the service to
// become ready or to close. Lab uses 2000 by default; node:test has no limit.
var DEFAULT_TIMEOUT = 5555

// Results of fire-and-forget calls, written by the service side action faf:1
// and read by the client side. Service and client run in the same process.
var fafmap = {}

// The service plugin. Loaded into the service instance by foo_service.
function foo_plugin () {
  this.add('foo:1', function (msg, reply) { reply(null, {dee: '1-' + msg.bar}) })
  this.add('foo:2', function (msg, reply) { reply(null, {dee: '2-' + msg.bar}) })
  this.add('foo:3', function (msg, reply) { reply(null, {dee: '3-' + msg.bar}) })
  this.add('foo:4', function (msg, reply) { reply(null, {dee: '4-' + msg.bar}) })
  this.add('foo:5', function (msg, reply) { reply(null, {dee: '5-' + msg.bar}) })
  this.add('nores:1', function (msg, reply) { reply() })
  this.add('faf:1', function (msg, reply) { fafmap[msg.k] = msg.v; reply() })
  this.add('role:a,cmd:1', function (msg, reply) { reply(null, {out: 'a1-' + msg.bar}) })
  this.add('role:b,cmd:2', function (msg, reply) { reply(null, {out: 'b2-' + msg.bar}) })
}

/**
 * Port of listener number n (0, 1 or 2) for the port setting:
 * - no port: the transport default for the first listener, 10102 and 10103
 *   for the other two
 * - a positive port: port, port + 1, port + 2
 * - a negative port: the absolute value for all three listeners (for
 *   transports that do not bind a network port per listener)
 */
function listen_port (port, n) {
  if (!port) return 0 === n ? undefined : 10101 + n
  if (port < 0) return -1 * port
  return port + n
}

// Configuration object for listen and client; undefined keys are left out.
function config (type, port, pin) {
  var out = {}
  if (null != type) out.type = type
  if (null != port) out.port = port
  if (null != pin) out.pin = pin
  return out
}

/**
 * Register a service listening on 3 ports:
 * - port: all actions of the foo plugin
 * - port + 1 (default: 10102): role:a,cmd:*
 * - port + 2 (default: 10103): role:b,cmd:*
 */
function foo_service (seneca, type, port) {
  return seneca
    .use(foo_plugin)
    .listen(config(type, listen_port(port, 0)))
    .listen(config(type, listen_port(port, 1), {role: 'a', cmd: '*'}))
    .listen(config(type, listen_port(port, 2), {role: 'b', cmd: '*'}))
}

/**
 * Send msg and check the reply: compared as JSON with expected, or empty
 * when expected is null. An error reply or a failed assertion goes to done,
 * which ends the case; otherwise next is called. (Seneca catches errors
 * thrown inside act callbacks and only logs them, so a thrown assertion
 * would leave the case waiting until it timed out.)
 */
function call (seneca, msg, expected, done, next) {
  seneca.act(msg, function (err, out) {
    if (err) return done(err)

    try {
      if (null == expected) {
        Assert.equal(null, out)
      } else {
        Assert.equal(expected, JSON.stringify(out))
      }
    } catch (e) {
      return done(e)
    }

    next()
  })
}

/**
 * Run 3 calls on foo_plugin for the transport of a given type on a port,
 * then a fire-and-forget call.
 */
function foo_run (seneca, type, port, done) {
  // Client for all actions: catches every message without a local action.
  seneca.client(config(type, listen_port(port, 0)))

  seneca.ready(function () {
    call(seneca, 'foo:1,bar:A', '{"dee":"1-A"}', done, function () {
      call(seneca, 'foo:1,bar:AA', '{"dee":"1-AA"}', done, function () {
        call(seneca, 'nores:1', null, done, function () {
          // test fire-and-forget
          var k = '' + Math.random()
          var v = '' + Math.random()

          seneca.act('faf:1,k:"' + k + '",v:"' + v + '"')

          setTimeout(function () {
            try {
              Assert.equal(v, fafmap[k])
            } catch (e) {
              return done(e)
            }
            done()
          }, 222)
        })
      })
    })
  })

  return seneca
}

/**
 * Run 2 calls on foo_plugin for the transport of a given type using pin.
 */
function foo_pinrun (seneca, type, port, done) {
  seneca
    // pin provided as string
    .client(config(type, listen_port(port, 1), 'role: a, cmd:*'))
    // pin provided as object
    .client(config(type, listen_port(port, 2), {role: 'b', cmd: '*'}))

  seneca.ready(function () {
    call(seneca, 'role:a,cmd:1,bar:B', '{"out":"a1-B"}', done, function () {
      call(seneca, 'role:b,cmd:2,bar:BB', '{"out":"b2-BB"}', done, done)
    })
  })

  return seneca
}

/**
 * Closes the communication (client)
 */
function foo_close_client (client, fin) {
  client.close(function (err) {
    if (err) return fin(err)
    fin()
  })
}

/**
 * Closes the communication (service)
 */
function foo_close_service (service, fin) {
  service.close(function (err) {
    if (err) return fin(err)
    fin()
  })
}

// Promise that resolves when the instance is ready (callback form, which
// also works on seneca 4.0.0-rc5), or rejects after timeout milliseconds.
function wait_ready (seneca, timeout, what) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () {
      reject(new Error('seneca-transport-test: ' + what +
        ' not ready within ' + timeout + 'ms'))
    }, timeout)

    seneca.ready(function (err) {
      clearTimeout(timer)
      if (err) return reject(err)
      resolve()
    })
  })
}

// Promise that resolves when the instance has closed, or rejects after
// timeout milliseconds.
function wait_close (seneca, timeout, what) {
  return new Promise(function (resolve, reject) {
    if (null == seneca) return resolve()

    var timer = setTimeout(function () {
      reject(new Error('seneca-transport-test: ' + what +
        ' not closed within ' + timeout + 'ms'))
    }, timeout)

    foo_close_service(seneca, function (err) {
      clearTimeout(timer)
      if (err) return reject(err)
      resolve()
    })
  })
}

// Whether x has the Seneca instance methods the cases use.
function is_seneca (x) {
  return null != x &&
    'function' === typeof x.act &&
    'function' === typeof x.use &&
    'function' === typeof x.close
}

// Resolve the settings shared by all test functions.
function make_context (settings) {
  settings = settings || {}

  var seneca = settings.seneca

  // A factory makes a separate instance for the service and for the client.
  var factory = 'function' === typeof seneca && !is_seneca(seneca)

  if (!factory && !is_seneca(seneca)) {
    throw new Error('seneca-transport-test: settings.seneca must be a Seneca ' +
      'instance or a function that returns a new Seneca instance')
  }

  if (null != settings.client && !is_seneca(settings.client)) {
    throw new Error('seneca-transport-test: settings.client must be a Seneca ' +
      'instance')
  }

  // A new instance from the factory.
  function make () {
    var instance = seneca()
    if (!is_seneca(instance)) {
      throw new Error('seneca-transport-test: the settings.seneca function ' +
        'must return a new Seneca instance')
    }
    return instance
  }

  var script = settings.script

  if (null == script) {
    // Lab is only loaded when no script is given.
    script = require('@hapi/lab').script()
  }

  var timeout = null == settings.timeout ? DEFAULT_TIMEOUT : settings.timeout

  return {
    script: script,
    type: settings.type,
    port: settings.port,
    timeout: timeout,

    // Instance for the service side.
    service: function () {
      return factory ? make() : seneca
    },

    // Instance for the client side: settings.client, or a new instance from
    // the factory. Without either the service instance is used, in which
    // case the local actions answer and no message travels over the
    // transport (kept for compatibility).
    client: function () {
      if (null != settings.client) return settings.client
      return factory ? make() : seneca
    }
  }
}

// Holds the client instance of the running case until it is closed. A case
// that times out never reaches its callback, so the after hook closes the
// client then, so that its sockets and timers do not keep the process alive.
function make_client_holder () {
  var open = null
  return {
    hold: function (instance) {
      open = instance
      return instance
    },
    take: function () {
      var instance = open
      open = null
      return instance
    }
  }
}

// Body of a case: run(client, done) on the case's client, then close the
// client, also on failure, so that the process can exit.
function run_case (ctx, holder, run) {
  return new Promise(function (done, fail) {
    var client = holder.hold(ctx.client())

    run(client, function (err) {
      var open = holder.take()

      // Already closed by the after hook (the case timed out).
      if (null == open) return err ? fail(err) : done()

      foo_close_client(open, function (close_err) {
        if (err) return fail(err)
        if (close_err) return fail(close_err)
        done()
      })
    })
  })
}

// After hook of a case group: close a client left open by a case that timed
// out, then the service.
function close_all (ctx, holder, service) {
  var client = holder.take()
  var first = client === service ? null : client

  return wait_close(first, ctx.timeout, 'client').then(function () {
    return wait_close(service, ctx.timeout, 'service')
  })
}

function basictest (settings) {
  var ctx = make_context(settings)
  var script = ctx.script
  var describe = script.describe
  var it = script.it
  var type = ctx.type
  var port = ctx.port
  var service
  var holder = make_client_holder()

  describe('Basic Transport for type ' + type, function () {
    script.before(function () {
      service = foo_service(ctx.service(), type, port)
      return wait_ready(service, ctx.timeout, 'service')
    })

    it('should execute three consecutive calls', {timeout: ctx.timeout}, function () {
      return run_case(ctx, holder, function (client, done) {
        foo_run(client, type, port, done)
      })
    })

    script.after(function () {
      return close_all(ctx, holder, service)
    })
  })

  return script
}

function basicpintest (settings) {
  var ctx = make_context(settings)
  var script = ctx.script
  var describe = script.describe
  var it = script.it
  var type = ctx.type
  var port = ctx.port
  var service
  var holder = make_client_holder()

  describe('Basic Transport using pin for type ' + type, function () {
    script.before(function () {
      service = foo_service(ctx.service(), type, port)
      return wait_ready(service, ctx.timeout, 'service')
    })

    it('should execute two consecutive calls using pin', {timeout: ctx.timeout}, function () {
      return run_case(ctx, holder, function (client, done) {
        foo_pinrun(client, type, port, done)
      })
    })

    script.after(function () {
      return close_all(ctx, holder, service)
    })
  })

  return script
}

module.exports = {
  basictest: basictest,
  basicpintest: basicpintest
}
