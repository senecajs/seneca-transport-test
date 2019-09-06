/* Copyright (c) 2014-2019 Richard Rodger and other contributors, MIT License */

'use strict'

var Assert = require('assert')
var Lab = require('@hapi/lab')
var fafmap = {}

function foo_plugin () {
  this.add('foo:1', function (args, done) { done(null, {dee: '1-' + args.bar}) })
  this.add('foo:2', function (args, done) { done(null, {dee: '2-' + args.bar}) })
  this.add('foo:3', function (args, done) { done(null, {dee: '3-' + args.bar}) })
  this.add('foo:4', function (args, done) { done(null, {dee: '4-' + args.bar}) })
  this.add('foo:5', function (args, done) { done(null, {dee: '5-' + args.bar}) })
  this.add('nores:1', function (args, done) { done() })
  this.add('faf:1', function (args, done) { fafmap[args.k] = args.v; done() })
  this.add('role:a,cmd:1', function (args, done) { this.good({out: 'a1-' + args.bar}) })
  this.add('role:b,cmd:2', function (args, done) { this.good({out: 'b2-' + args.bar}) })
}

/**
 * Register a service listening on 3 ports:
 * - port
 * - port + 1 (default: 10102)
 * - port + 2 (default: 10103)
 */
function foo_service (seneca, type, port) {
  return seneca
    .use(foo_plugin)
    .listen({type: type, port: (port < 0 ? -1 * port : port)})
    .listen({type: type, port: (port ? (port < 0 ? -1 * port : port + 1) : 10102), pin: {role: 'a', cmd: '*'}})
    .listen({type: type, port: (port ? (port < 0 ? -1 * port : port + 2) : 10103), pin: {role: 'b', cmd: '*'}})
}

/**
 * Run 3 calls on foo_plugin for the transport of a given type on a port.
 */
function foo_run (seneca, type, port, done) {
  var pn = (port < 0 ? -1 * port : port)

  return seneca
    .client({type: type, port: pn}) // Client for pn
    .ready(function () {
      this.act('foo:1,bar:A', function (err, out) {
        if (err) return done(err)
        Assert.equal('{"dee":"1-A"}', JSON.stringify(out))

        this.act('foo:1,bar:AA', function (err, out) {
          if (err) return done(err)
          Assert.equal('{"dee":"1-AA"}', JSON.stringify(out))

          this.act('nores:1', function (err, out) {
            if (err) return done(err)
            Assert.equal(null, out)
            // test fire-and-forget
            var k = '' + Math.random()
            var v = '' + Math.random()

            this.act('faf:1,k:"' + k + '",v:"' + v + '"')

            setTimeout(function () {
              Assert.equal(v, fafmap[k])
              done()
            }, 222)
          })
        })
      })
    })
}

/**
* Run 2 calls on foo_plugin for the transport of a given type using pin.
 */
function foo_pinrun (seneca, type, port, done) {
  return seneca
    // pin provided as string
    .client({type: type, port: (port ? (port < 0 ? -1 * port : port + 1) : 10102), pin: 'role: a, cmd:*'})
    // pin provided as object
    .client({type: type, port: (port ? (port < 0 ? -1 * port : port + 2) : 10103), pin: {role: 'b', cmd: '*'}})
    .ready(function () {
      this.act('role:a,cmd:1,bar:B', function (err, out) {
        if (err) return done(err)
        Assert.equal('{"out":"a1-B"}', JSON.stringify(out))

        this.act('role:b,cmd:2,bar:BB', function (err, out) {
          if (err) return done(err)
          Assert.equal('{"out":"b2-BB"}', JSON.stringify(out))
          done()
        })
      })
    })
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

function basictest (settings) {
  var si = settings.seneca
  var script = settings.script || Lab.script()
  var describe = script.describe
  var it = script.it
  var type = settings.type
  var port = settings.port
  var service

  describe('Basic Transport for type ' + type, function () {
    script.before(() => {
      return new Promise((done) => {
        service = foo_service(si, type, port)
        service.ready(function () {
          done()
        })
      })
    })

    it('should execute three consecutive calls', async function () {
      return new Promise((done,fail)=>{
        var client = foo_run(si, type, port, function (err) {
          if (err) {
            return fail(err)
          }
          foo_close_client(client, done)
        })
      })
    })

    script.after(() => {
      return new Promise((done) => {
        foo_close_service(service, done)
      })
    })
  })

  return script
}

function basicpintest (settings) {
  var si = settings.seneca
  var script = settings.script || Lab.script()
  var describe = script.describe
  var it = script.it
  var type = settings.type
  var port = settings.port
  var service

  describe('Basic Transport using pin for type ' + type, function () {
    script.before(() => {
      return new Promise((done) => {
        service = foo_service(si, type, port)
        service.ready(function () {
          done()
        })
      })
    })

    it('should execute two consecutive calls using pin', async function () {
      return new Promise((done,fail)=>{
        var client = foo_pinrun(si, type, port, function (err) {
          if (err) {
            return fail(err)
          }
          foo_close_client(client, done)
        })
      })
    })

    script.after(() => {
      return new Promise((done) => {
        foo_close_service(service, done)
      })
    })
  })

  return script
}

module.exports = {
  basictest: basictest,
  basicpintest: basicpintest
}
