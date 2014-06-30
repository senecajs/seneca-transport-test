/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var assert = require('assert')


function foo_plugin() {
  this.add( 'foo:1', function(args,done){done(null,{dee:'1-'+args.bar})} )
  this.add( 'foo:2', function(args,done){done(null,{dee:'2-'+args.bar})} )
  this.add( 'foo:3', function(args,done){done(null,{dee:'3-'+args.bar})} )
  this.add( 'foo:4', function(args,done){done(null,{dee:'4-'+args.bar})} )
  this.add( 'foo:5', function(args,done){done(null,{dee:'5-'+args.bar})} )
}


function foo_service( seneca, type, port ) {
  return seneca.use( foo_plugin ).listen({type:type,port:port})
}


function foo_run( seneca, done, type, port ) {
  return seneca
    .client({type:type,port:port})
    .ready( function() {

      this.act('foo:1,bar:A',function(err,out){
        if(err) return done(err);
              
        assert.equal( '{"dee":"1-A"}', JSON.stringify(out) )

        this.act('foo:1,bar:AA',function(err,out){
          if(err) return done(err);
              
          assert.equal( '{"dee":"1-AA"}', JSON.stringify(out) )
          done()
        })
      })
    })
}


function foo_close( client, service, fin ) {
  client.close( function(err){
    if(err) return fin(err);

    service.close( function(err){
      return fin(err);
    })
  })
}


function foo_test( require, fin, type, port ) {
  var service = foo_service(
    require('seneca')({log:'silent'}).use('..'), 
    type, port)

  service.ready( function(){
    var client  = foo_run(
      require('seneca')({log:'silent'}).use('..'), 
      done, type, port)

    function done(err) {
      if(err) return fin(err);
      foo_close( client, service, fin )
    }
  })
}




module.exports = {
  foo_test: foo_test
}
