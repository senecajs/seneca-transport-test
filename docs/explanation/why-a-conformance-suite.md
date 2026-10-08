# Why a conformance suite

Seneca code sends messages without knowing where the actions that
answer them run. An action can move from the local instance to another
process, behind a transport, and the code that sends the message stays
the same. That only holds if every transport behaves the same way in
the ways that matter to the sender. The standard cases check those
ways, once, for every transport.

## What the cases check

* A message reaches an action on another instance, and its reply comes
  back unchanged.
* An empty reply stays empty.
* A message sent without a callback is still delivered.
* Clients created with pins, given as a string and as an object, reach
  the listeners they are configured for.
* The instances become ready once their listeners and clients are set
  up, and close when asked.

[Messages and assertions](../reference/messages.md) lists every call.

## What they do not check

The cases are a floor, not a complete test of a transport. They do not
check:

* error replies: how an error replied by a remote action reaches the
  caller;
* time limits, retries and reconnection;
* message meta data such as ids, `custom$` data and tracing;
* entities, large messages, or many messages at once;
* whether a listener with a pin refuses other messages;
* security: authentication, encryption, input limits.

Test these in the transport's own suite.

## Why the caller provides the instances

The suite cannot know what a transport needs: options, a broker, other
plugins. Nor should it choose the Seneca version: a transport may be
tested against Seneca 3, Seneca 4, or both. So the test functions take
the instances from the caller, through `settings.seneca` and
`settings.client`, and the package has no dependency or peer
dependency on `seneca`. The devDependencies of the transport's project
decide which Seneca runs the cases.

## Why two instances

The service and the client are separate Seneca instances. With a single
instance, the service's own actions answer: Seneca sends a message to
the most specific matching action, `foo:1` is more specific than a
client without pin (an empty pattern), and `role:a,cmd:1` is more
specific than a client pinned to `role:a,cmd:*`. The calls then succeed
without any message crossing the transport, on Seneca 3 and Seneca 4
alike. That single instance form was the only one in version 1.0. It is
still accepted for compatibility, but the transport is only tested when
`settings.seneca` is a function that makes new instances, or when
`settings.client` is set.

## Why one process

Service and client run in the same process. The fire-and-forget check
reads a value that the service's `faf:1` action stored in a variable of
the test module, so it needs no reply and no extra channel. One process
also keeps the cases quick, with no child processes to start or clean
up. The messages still travel through the transport: a network
transport connects to its own listener even though both ends are in
the same process.

## Why the test runner is pluggable

Transport plugins use different test runners. The test functions use
only `describe`, `it`, `before` and `after` from the script they are
given, so a lab script and the `node:test` module both work, and the
cases appear in the plugin's own test report next to its other tests.
