![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] plugin

# @seneca/transport-test

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

To install, simply use npm. Remember you will need to install [Seneca.js][] if you haven't already.

```sh
npm install seneca-transport-test
```

## Quick Example

```js
var TransportTest = require('seneca-transport-test')
TransportTest.run(seneca)
```

## More Examples

See [test/](test/) for usage examples.

## Motivation

Standard test suite for Seneca transport plugins. All transport plugins should pass these tests.

## Support

If you're using this module and need help, you can:

- Post a [github issue][]
- Tweet to [@senecajs][]

## API

See [source](https://github.com/senecajs/seneca-transport-test) for available test suites.

## Contributing

The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

### Running tests

```sh
npm run test
```

## Background

Used by all official Seneca transport plugins to verify compliance.

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coverage-badge]][coverage-url]
[![Code Climate][codeclimate-badge]][codeclimate-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter][gitter-badge]][gitter-url]
[npm-badge]: https://img.shields.io/npm/v/seneca-transport-test.svg
[npm-url]: https://npmjs.com/package/seneca-transport-test
[travis-badge]: https://travis-ci.org/senecajs/seneca-transport-test.svg
[travis-url]: https://travis-ci.org/senecajs/seneca-transport-test
[codeclimate-badge]: https://codeclimate.com/github/rjrodger/seneca-transport-test/badges/gpa.svg
[codeclimate-url]: https://codeclimate.com/github/rjrodger/seneca-transport-test
[coverage-badge]: https://coveralls.io/repos/rjrodger/seneca-transport-test/badge.svg?branch=master&service=github
[coverage-url]: https://coveralls.io/github/rjrodger/seneca-transport-test?branch=master
[david-badge]: https://david-dm.org/rjrodger/seneca-transport-test.svg
[david-url]: https://david-dm.org/rjrodger/seneca-transport-test
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
