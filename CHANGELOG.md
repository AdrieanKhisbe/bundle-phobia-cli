Change Log
==========

All notable changes to *bundle-phobia-cli* will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
*Nothing So Far*

## [0.15.0] - 2025-10-28

Covered in PR [#68]
### Added
- Ignore @types packages (cf Do not exit with error for type packages [#48])
### Changed
- Unified entrypoint
- Update CI (github actions replacing travis)
- Error resiliency (one error don't stop eveything anymore)
- Dependency bumps
- CI for node twenties (20, 22, 24)

## [0.14.12] - 2020-12-08
Covered in PR [#40] and [#41]
### Fixed
- make install work again :white_check_mark:
- running end-to-end for all node versions :traffic_light:
### Changed
- basic end to end test for the install command :shield:
- npm install logs are now forwarded to the terminal :pager:
## [0.14.11] - 2020-12-06
Covered in PR [#37], [#38] and [#39]
### Fixed
- Fix issue with calling `npm` on windows ([#37]). (regression was introduced by [#33] in [0.14.9])
- Restore coverage ([#39])

## [0.14.10] - 2020-10-22
Covered in PR [#36]
### Fixed
- Address [#35] issue, and support resolving for packages with dot in it.
### Changed
- Update dependencies within minor range

## [0.14.9] - 2020-09-12
Covered in PR [#33] ([#31] included)
### Changed
- Drop `shelljs` to use built in `child_process.execFile`
- Update dependencies while keeping node 8 support

## [0.14.8] - 2020-07-24
### Fixed
- npmignored was misconfigured, replaced with `files` configuration in `package.json`

## [0.14.7] - 2020-07-24
Covered in PR [#30]: :wind_face: Refreshed dependencies & Better tests :test_tube:

## [0.14.6] - 2020-03-18
Covered in PR [#26]
### Fixed
- Restored global predicate on install

## [0.14.5] - 2020-03-16
Covered in PR [#24]
### Fixed
- Restored config reading from package.json

## [0.14.4] - 2020-03-14
### Changed
- Updated package-lock

## [0.14.3] - 2020-03-14
Covered in PR [#22]
### Changed
- Updated dependencies, Fixing one CVE

## [0.14.2] - 2020-02-20
Covered in PR [#20]
### Changed
- Updated dependencies

## [0.14.1] - 2019-10-14
### Changed
- Major refactor from chained promises to async/await
- Change lint configuration and bump to eslint@6
- Replace bluebird by vanilla promises (and util `p-map`)

## [0.14.0] - 2019-10-10
### Changed
- Upgraded all dependencies (except eslint)
- Extract yargs config from package.json thanks to @romellem in #16

## [0.13.0] - 2019-04-04
### Changed
- Drop support of node 6

## [0.12.1] - 2019-04-04
### Fixed
- Support of latest npm (the one shippped with node 11)

## [0.12.0] - 2019-03-14
### Added
- Support for Scoped packages, thanks to @marcins
- MIT licence

## [0.11.0] - 2018-11-11
### Added
- Add a `--package` option to read package list from a package.json file

## [0.10.2] - 2018-11-08
### Fixed
- Improve output of non available versions

## [0.10.1] - 2018-11-07
### Added
- Add a `--self` option to fetch bundle-phobia size

## [0.10.0] - 2018-11-06
### Added
- global predicates for `bundle-phobia-install`

## [0.9.1] - 2018-11-05
### Added
- `bundle-phobia-install` configuration through `package.json`

## [0.9.0] - 2018-11-04
### Added
- New `bundle-phobia-install` command for conditional installs

## [0.8.1] - 2018-11-02
### Fixed
- Logging is now performed on stdout

## [0.8.0] - 2018-11-02
### Added
- Support for a list of packages to query

### Changed
- Various refactors

## [0.7.0] - 2018-11-01
### Added
- Support for version range specifier

## [0.6.4] - 2018-11-01
### Changed
- Upgrade all dependencies

## [0.6.3] - 2018-11-01
### Changed
- replace `yarn` by vanilla `npm`
- Change supported node version

## [0.6.2] - 2018-11-01
### Added
- update-notifier set up to have notification of new releases

## [0.6.1] - 2018-11-01
### Changed
- New Header in request made to service. PR #6

## Older changes have to be documented
[#48]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/48
[#68]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/68
[#30]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/30
[#16]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/16
[#6]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/6
[#41]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/41
[#40]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/40
[#39]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/39
[#38]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/38
[#37]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/37
[#36]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/36
[#35]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/issues/35
[#33]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/33
[#31]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/31
[#26]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/26
[#24]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/24
[#22]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/22
[#20]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/pull/20

[unreleased]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.15.0...master
[0.15.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.12...v0.15.0
[0.14.12]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.11...v0.14.12
[0.14.11]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.10...v0.14.11
[0.14.10]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.9...v0.14.10
[0.14.9]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.8...v.0.14.9
[0.14.8]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.7...v.0.14.8
[0.14.7]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.6...v.0.14.7
[0.14.6]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.5...v0.14.6
[0.14.5]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.4...v0.14.5
[0.14.4]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.3...v0.14.4
[0.14.3]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.2...v0.14.3
[0.14.2]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.12.1...v0.13.0
[0.12.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.10.2...v0.11.0
[0.10.2]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.6.4...v0.7.0
[0.6.4]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.6.0...v0.6.1
