# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.1.0](https://github.com/plexinc/papr/compare/v2.0.3...v2.1.0) (2021-09-02)


### Features

* Model.findOneAndDelete ([#75](https://github.com/plexinc/papr/issues/75)) ([c555246](https://github.com/plexinc/papr/commit/c55524668343e196fec65241cb778a1a4694c06a))
* Support IDs with strings or numbers ([#74](https://github.com/plexinc/papr/issues/74)) ([3e793cb](https://github.com/plexinc/papr/commit/3e793cbd40ad3539fda39b5436a1df7665e84f41))


### Bug Fixes

* Fix insert and projection types ([#72](https://github.com/plexinc/papr/issues/72)) ([344abab](https://github.com/plexinc/papr/commit/344abab587b4850351c535b8282184871a6afb9c))

### [2.0.3](https://github.com/plexinc/papr/compare/v2.0.2...v2.0.3) (2021-08-25)


### Bug Fixes

* Require mongodb >=v4.1.1 ([125d928](https://github.com/plexinc/papr/commit/125d928a2bf9175134a6ba672bdd98fb74854fea))
* Support custom dates in insert operations ([afe201a](https://github.com/plexinc/papr/commit/afe201ac9705f0acc46077dbeb73191b151766a6))

### [2.0.2](https://github.com/plexinc/papr/compare/v2.0.1...v2.0.2) (2021-07-21)


### Bug Fixes

* Filter defaults in bulkWrite to avoid conflicts ([#42](https://github.com/plexinc/papr/issues/42)) ([28d3fb4](https://github.com/plexinc/papr/commit/28d3fb489f65ecd97ffb63189421d67635cbec0e))

### [2.0.1](https://github.com/plexinc/papr/compare/v2.0.0...v2.0.1) (2021-07-20)


### Bug Fixes

* Apply defaults in bulkWrite updateOne operations ([#41](https://github.com/plexinc/papr/issues/41)) ([ee84388](https://github.com/plexinc/papr/commit/ee8438888cc3e57a90efe7fb00cfe82d441edd0e))

## [2.0.0](https://github.com/plexinc/papr/compare/v1.0.1...v2.0.0) (2021-07-15)


### ⚠ BREAKING CHANGES

* Requires peer dependency mongodb v4.*
* TypeScript types have changed - now using the embedded types from mongodb package.

### Features

* Use mongodb v4.* ([#36](https://github.com/plexinc/papr/issues/36)) ([74a5586](https://github.com/plexinc/papr/commit/74a55863b9229edfc2118b3a2b27fda13f4f43c5))


### Bug Fixes

* Customize benchmark db name via CLI arg ([#32](https://github.com/plexinc/papr/issues/32)) ([a159933](https://github.com/plexinc/papr/commit/a1599337a2909ba985b586816db4805d8768c7bc))
* Customize mongo URL in benchmark tool ([#19](https://github.com/plexinc/papr/issues/19)) ([2cfac08](https://github.com/plexinc/papr/commit/2cfac08a0e304eaf9b3ed027b70281e11086710a))

### [1.0.1](https://github.com/plexinc/papr/compare/v1.0.0...v1.0.1) (2021-06-04)


### Bug Fixes

* Use returnDocument instead of returnOriginal ([#7](https://github.com/plexinc/papr/issues/7)) ([bbbb651](https://github.com/plexinc/papr/commit/bbbb6519b98b64ff20b066955e4c613b24d37792))

## 1.0.0 (2021-05-10)


### Features

* Initial public commit ([740b1ef](https://github.com/plexinc/papr/commit/740b1efb5fd63db9e7d5bd50366fc78f4d458f3d))
