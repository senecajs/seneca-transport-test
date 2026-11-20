/* Copyright (c) 2014-2026 Richard Rodger and other contributors, MIT License */
'use strict'

// The repository's own test, under node:test: the same cases as
// test/lab.test.js, with the node:test module as the script.
// Run with: node --test test/node.test.js

const script = require('node:test')

// The package itself (@seneca/transport-test).
const Shared = require('..')
const Support = require('./support')

// web: one instance for the service, one for the client
Shared.basictest({ seneca: Support.make, script, type: 'web', port: 10621 })
Shared.basicpintest({ seneca: Support.make, script, type: 'web', port: 10631 })

// web, with the version 1.0 call shape: a single instance for both sides
// (the local actions answer; kept for compatibility)
Shared.basictest({ seneca: Support.make(), script, type: 'web', port: 10641 })
Shared.basicpintest({ seneca: Support.make(), script, type: 'web', port: 10651 })

// tcp
Shared.basictest({ seneca: Support.make, script, type: 'tcp', port: 10721 })
Shared.basicpintest({ seneca: Support.make, script, type: 'tcp', port: 10731 })

// Settings validation and teardown, with a stand-in script that records the
// hooks and the case body instead of running them.
const Assert = require('node:assert')

function record () {
  const hooks = {}
  return {
    hooks,
    describe: (name, fn) => fn(),
    it: (name, opts, fn) => (hooks.case = fn),
    before: (fn) => (hooks.before = fn),
    after: (fn) => (hooks.after = fn)
  }
}

script.test('rejects settings that are not Seneca instances', () => {
  for (const seneca of [undefined, {}, [], 'seneca']) {
    Assert.throws(
      () => Shared.basictest({ seneca, script: record() }),
      /settings\.seneca must be a Seneca instance/
    )
  }

  Assert.throws(
    () => Shared.basictest({ seneca: Support.make, client: {}, script: record() }),
    /settings\.client must be a Seneca instance/
  )
})

script.test('rejects a settings.seneca function that returns no instance', async () => {
  const fake = record()
  Shared.basictest({ seneca: () => ({}), script: fake })

  await Assert.rejects(
    async () => fake.hooks.before(),
    /settings\.seneca function must return a new Seneca instance/
  )
})

script.test('closes the client of a case that did not finish', async () => {
  let closed = 0

  // A client whose ready callback never fires, as with a broken transport.
  const client = {
    act () {},
    use () { return this },
    client () { return this },
    ready () {},
    close (fin) {
      closed++
      fin()
    }
  }

  const fake = record()
  Shared.basictest({ seneca: Support.make, client, script: fake, type: 'web', port: 10661 })

  await fake.hooks.before()
  fake.hooks.case() // never settles
  await fake.hooks.after()

  Assert.equal(closed, 1)
})
