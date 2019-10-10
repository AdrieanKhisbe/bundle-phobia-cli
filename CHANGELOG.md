Change Log
==========

All notable changes to *bundle-phobia-cli* will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
*Nothing So Far*

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

[unreleased]: https://github.com/AdrieanKhisbe/bundle-phobia-cli/compare/v0.14.0...master
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
