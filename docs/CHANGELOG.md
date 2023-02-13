# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [10.0.0](https://github.com/plexinc/papr/compare/v9.2.1...v10.0.0) (2023-02-13)


### ⚠ BREAKING CHANGES

* `mongodb` v5 is required as a peer dependency.
* `Filter` and `UpdateFilter` types are now using the strict counterpart types from mongodb v5.

### Features

* Add mongodb v5 support with strict filter types ([#422](https://github.com/plexinc/papr/issues/422)) ([547a794](https://github.com/plexinc/papr/commit/547a794dc4256e5a97f3bf13a08b4de659fd411d))


### Bug Fixes

* Util getIds accepts readonly structures ([#381](https://github.com/plexinc/papr/issues/381)) ([940d519](https://github.com/plexinc/papr/commit/940d519c9b05af42efa1b3a8c7373753abc3bc47))

### [9.2.1](https://github.com/plexinc/papr/compare/v9.2.0...v9.2.1) (2022-11-01)


### Bug Fixes

* Upgrade mongodb to v4.11.0 ([#343](https://github.com/plexinc/papr/issues/343)) ([f7db8b7](https://github.com/plexinc/papr/commit/f7db8b70b1fcf294890319d374151dbb67e2af44))

## [9.2.0](https://github.com/plexinc/papr/compare/v9.1.0...v9.2.0) (2022-10-24)


### Features

* `null` type ([#337](https://github.com/plexinc/papr/issues/337)) ([e78f1ca](https://github.com/plexinc/papr/commit/e78f1ca9e4aeaa61a176201ef38ba50bf98a1dc4))

## [9.1.0](https://github.com/plexinc/papr/compare/v9.0.0...v9.1.0) (2022-09-27)


### Features

* `decimal` type ([#326](https://github.com/plexinc/papr/issues/326)) ([13443bc](https://github.com/plexinc/papr/commit/13443bc196c369720d5605f26fb513e9b8e27e2e))

## [9.0.0](https://github.com/plexinc/papr/compare/v8.2.0...v9.0.0) (2022-09-26)


### ⚠ BREAKING CHANGES

* Schemas no longer have a default `__v` property
defined. Users who have migrated from Mongoose or are otherwise taking
advantage of this property will have to manually add it to their schema
definitions.
* This changes the produced JSON schema for required
`oneOf` types to correctly include it in the resulting `required`
properties array.

### Features

* Support `constant` type ([#312](https://github.com/plexinc/papr/issues/312)) ([e676703](https://github.com/plexinc/papr/commit/e67670399dad5dfbbe7b30ea688f5c7912ba7a8b))


### Bug Fixes

* Correct `oneOf` required option ([a24054f](https://github.com/plexinc/papr/commit/a24054fbfaeb0f1ad58470080db6cc77bae23533))


* Remove default schema `__v` version property ([86bca4f](https://github.com/plexinc/papr/commit/86bca4f4b45fa06cc3be9536bd0f0b51e27228e0))

## [8.2.0](https://github.com/plexinc/papr/compare/v8.1.0...v8.2.0) (2022-09-08)


### Features

* Add `Model.exists(filter)` query helper ([47ee728](https://github.com/plexinc/papr/commit/47ee728c0d8ce36943aa211e98d81f00aa2fe62c))

## [8.1.0](https://github.com/plexinc/papr/compare/v8.0.0...v8.1.0) (2022-09-07)


### Features

* Allow user definition of `_id` property type ([#311](https://github.com/plexinc/papr/issues/311)) ([056928e](https://github.com/plexinc/papr/commit/056928e955a34aa466d547dd99d1cb75f59ece9d))

## [8.0.0](https://github.com/plexinc/papr/compare/v7.3.1...v8.0.0) (2022-09-06)


### ⚠ BREAKING CHANGES

* Changes the return type for `schema` and the generic
arguments for `model` and various utils

### Features

* Add timestamp option to set property names ([115c805](https://github.com/plexinc/papr/commit/115c805d902176aec11c4b3cb8af2d09fe27b913))

### [7.3.1](https://github.com/plexinc/papr/compare/v7.3.0...v7.3.1) (2022-09-01)


### Bug Fixes

* Upgrade mongodb to v4.9.1 ([#304](https://github.com/plexinc/papr/issues/304)) ([cc2e975](https://github.com/plexinc/papr/commit/cc2e97562bb9bd502b1851debdc58727f7a1d398))
* Upgrade typescript to v4.8.2 ([#300](https://github.com/plexinc/papr/issues/300)) ([fd3ee59](https://github.com/plexinc/papr/commit/fd3ee591b281adcabc8d5207244283063592b19f))

## [7.3.0](https://github.com/plexinc/papr/compare/v7.2.2...v7.3.0) (2022-08-23)


### Features

* `tuple` type ([#284](https://github.com/plexinc/papr/issues/284)) ([0531447](https://github.com/plexinc/papr/commit/0531447af494e60ff0ecfeeffc29c169a359c7b6))

### [7.2.2](https://github.com/plexinc/papr/compare/v7.2.1...v7.2.2) (2022-08-22)


### Bug Fixes

* Upgrade mongodb to v4.9.0 ([#292](https://github.com/plexinc/papr/issues/292)) ([64de742](https://github.com/plexinc/papr/commit/64de742dfbc07e16611de4e3f05128fd92c6ff31))

### [7.2.1](https://github.com/plexinc/papr/compare/v7.2.0...v7.2.1) (2022-08-03)


### Bug Fixes

* Correct TimestampSchema ternary in DocumentForInsert ([#277](https://github.com/plexinc/papr/issues/277)) ([7e8d750](https://github.com/plexinc/papr/commit/7e8d7504aeee51e6ad0c27a9df7a8597fdb63f74))

## [7.2.0](https://github.com/plexinc/papr/compare/v7.1.0...v7.2.0) (2022-08-02)


### Features

* `oneOf` type ([#275](https://github.com/plexinc/papr/issues/275)) ([2d55250](https://github.com/plexinc/papr/commit/2d55250a99f0629f051fe7d768080046d30d5866))
* `unknown` type ([#276](https://github.com/plexinc/papr/issues/276)) ([716712a](https://github.com/plexinc/papr/commit/716712a0241761a8b3008ef52f090aa9532e9b9f))


### Bug Fixes

* Use Record for objectGeneric type ([#274](https://github.com/plexinc/papr/issues/274)) ([59f3664](https://github.com/plexinc/papr/commit/59f3664389a4ead84cae185ab4526a3f04f580da))

## [7.1.0](https://github.com/plexinc/papr/compare/v7.0.1...v7.1.0) (2022-07-28)


### Features

* Support for mongodb v4.8.1 ([#262](https://github.com/plexinc/papr/issues/262)) ([0b86f01](https://github.com/plexinc/papr/commit/0b86f01954cd6a9370ae7fd3924b6e862cf94473))

### [7.0.1](https://github.com/plexinc/papr/compare/v7.0.0...v7.0.1) (2022-07-05)


### Bug Fixes

* Customisable Hook context type ([#258](https://github.com/plexinc/papr/issues/258)) ([26d4628](https://github.com/plexinc/papr/commit/26d4628ef1fef0ca9266d4a4c6d21c3fc53313e7))

## [7.0.0](https://github.com/plexinc/papr/compare/v6.0.0...v7.0.0) (2022-07-05)


### ⚠ BREAKING CHANGES

* The hook parameters have been merged into a single object parameter.

### Features

* Send result to the after hook parameters ([#242](https://github.com/plexinc/papr/issues/242)) ([cef1536](https://github.com/plexinc/papr/commit/cef1536ba7eff4c2e6b52a2106eb88b9bff2149f))


### Bug Fixes

* Update sed command for macOS ([#234](https://github.com/plexinc/papr/issues/234)) ([0b6c476](https://github.com/plexinc/papr/commit/0b6c47620e670ac00ae42681b7f9f74c478e8112))

## [6.0.0](https://github.com/plexinc/papr/compare/v5.0.0...v6.0.0) (2022-06-15)


### ⚠ BREAKING CHANGES

* Arrays will no longer default to type (T | undefined)[]

### Features

* Make array members non-optional by default ([#231](https://github.com/plexinc/papr/issues/231)) ([2c52719](https://github.com/plexinc/papr/commit/2c52719f0025c85760c3d5a82660cdb5cf2c8c5b))

## [5.0.0](https://github.com/plexinc/papr/compare/v4.0.0...v5.0.0) (2022-06-02)


### ⚠ BREAKING CHANGES

* Removed undocumented support for a custom model generic type in
the `model()` function.

* Remove custom model type support ([#219](https://github.com/plexinc/papr/issues/219)) ([8675ffa](https://github.com/plexinc/papr/commit/8675ffa0cfcf247c85f41ed2254b497ae3cd1ff1))

## [4.0.0](https://github.com/plexinc/papr/compare/v3.0.1...v4.0.0) (2022-05-30)


### ⚠ BREAKING CHANGES

* `bulkWrite` operations types updated to handle defaults
for attributes.

Required changes: The defaults model type needs to be passed to any usage
of the `BulkWriteOperation` type.

### Features

* Better `bulkWrite` types for insert operations ([#211](https://github.com/plexinc/papr/issues/211)) ([8ae6182](https://github.com/plexinc/papr/commit/8ae6182d871fc6daec346884b3ed5bb2333d4964))

### [3.0.1](https://github.com/plexinc/papr/compare/v3.0.0...v3.0.1) (2022-05-26)


### Bug Fixes

* Allow explicit optional types on schemas ([#207](https://github.com/plexinc/papr/issues/207)) ([716dbb4](https://github.com/plexinc/papr/commit/716dbb404092162aa438eeb05dfa2afa393b735f))

## [3.0.0](https://github.com/plexinc/papr/compare/v2.3.0...v3.0.0) (2022-04-13)


### ⚠ BREAKING CHANGES

* `schema()` generic types have changed.

### Bug Fixes

* bump minimist from 1.2.5 to 1.2.6 ([#180](https://github.com/plexinc/papr/issues/180)) ([b9d5cea](https://github.com/plexinc/papr/commit/b9d5cea0713b286352790703e27365528fe02dd2))
* bump prismjs from 1.25.0 to 1.27.0 ([7c0d1d2](https://github.com/plexinc/papr/commit/7c0d1d212e3a63979ece1ced78f4d4999f7c95ca))
* Improve defaults type at schema declaration ([#178](https://github.com/plexinc/papr/issues/178)) ([efa5d92](https://github.com/plexinc/papr/commit/efa5d92b1ed47a4145b5bac7e27c1793ca029954))

## [2.3.0](https://github.com/plexinc/papr/compare/v2.2.0...v2.3.0) (2022-03-03)


### Features

* Support nested fields in projection ([#155](https://github.com/plexinc/papr/issues/155)) ([6ed7ba1](https://github.com/plexinc/papr/commit/6ed7ba12cc0216d1156d155f7a6eb0985b34bc0b))


### Bug Fixes

* bump node-fetch from 2.6.1 to 2.6.7 ([cb25d05](https://github.com/plexinc/papr/commit/cb25d05bdceb0d51ebee42ef87da868c67f40c26))
* bump shelljs from 0.8.4 to 0.8.5 ([#149](https://github.com/plexinc/papr/issues/149)) ([2ee4a30](https://github.com/plexinc/papr/commit/2ee4a30e6d99cad06339a1b290d29d25e8114a13))
* bump trim-off-newlines from 1.0.1 to 1.0.3 ([#152](https://github.com/plexinc/papr/issues/152)) ([6ed3ccd](https://github.com/plexinc/papr/commit/6ed3ccd1923d06a53e7210441f0e4f68e9e77782))

## [2.2.0](https://github.com/plexinc/papr/compare/v2.1.1...v2.2.0) (2021-12-02)


### Features

* Use mongodb v4.2.1 ([#141](https://github.com/plexinc/papr/issues/141)) ([a17e53f](https://github.com/plexinc/papr/commit/a17e53fcab7d0c307c11bce99728da625a484e68))


### Bug Fixes

* Support enum type with array of const values ([#133](https://github.com/plexinc/papr/issues/133)) ([f39003f](https://github.com/plexinc/papr/commit/f39003f29538826821554405ec656740dd2ab621))

### [2.1.1](https://github.com/plexinc/papr/compare/v2.1.0...v2.1.1) (2021-11-08)


### Bug Fixes

* bump normalize-url from 4.5.0 to 4.5.1 ([ebd58c2](https://github.com/plexinc/papr/commit/ebd58c20eda7c38bcf510ecbbb1d22fa7763e4db))
* bump path-parse from 1.0.6 to 1.0.7 ([e85b312](https://github.com/plexinc/papr/commit/e85b312f377e4736d39252378d2aeb60c2e08c1a))
* bump prismjs from 1.23.0 to 1.25.0 ([682db15](https://github.com/plexinc/papr/commit/682db15b9c254cf2306597c9c1bcca3a84449846))
* bump tmpl from 1.0.4 to 1.0.5 ([5907415](https://github.com/plexinc/papr/commit/5907415468d11d78a3a9e671a52a46fe8c7fb102))
* bump ws from 7.4.5 to 7.5.5 ([4962e37](https://github.com/plexinc/papr/commit/4962e3732e10e703d3b85f8c615b3ebcfc8e614c))
* ESM build with file extensions ([#122](https://github.com/plexinc/papr/issues/122)) ([b81a6de](https://github.com/plexinc/papr/commit/b81a6de3c67a779fef4ffa77ff26efc69d8e4c4d))

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
