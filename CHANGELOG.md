# Changelog

All notable changes to Laundry Window are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Made the semantic release the primary footer version while retaining the exact deployed build commit and branch for diagnostics ([#18](https://github.com/roelsroels/laundry-window/pull/18)).
- Documented the semantic-version update step for future releases.

### Fixed

- Cache-bust every first-party CSS and JavaScript asset during GitHub Pages deployment, preventing stale browser files from showing an outdated footer or application interface ([#19](https://github.com/roelsroels/laundry-window/pull/19)).
- Correct the committed static version metadata to identify the production environment and `main` branch instead of showing a development/local fallback on direct static hosts.

## [1.0.0] - 2026-08-24

### Added

- Created the dependency-free, browser-only Laundry Window calculator for translating a cheap electricity window and programme duration into an actionable washing-machine timer value.
- Added isolated, model-specific profiles for ten Dutch-priority washing machines from Samsung, Bosch, Hisense, AEG, Haier, Inventum, Beko and Siemens, including each model’s documented programme durations and timer behaviour ([#8](https://github.com/roelsroels/laundry-window/pull/8), [#11](https://github.com/roelsroels/laundry-window/pull/11)).
- Added support for both timer meanings—start delay and delayed finish—and for whole-hour, half-hour and model-specific increment sequences.
- Added locally remembered machine, preferred-programme, measured-duration and language choices without introducing a backend.
- Added live Dutch day-ahead electricity-price suggestions for today and tomorrow at exact quarter-hour resolution ([#3](https://github.com/roelsroels/laundry-window/pull/3), [#6](https://github.com/roelsroels/laundry-window/pull/6)).
- Added complete English and Dutch interfaces with a Netherlands/United Kingdom language selector ([#4](https://github.com/roelsroels/laundry-window/pull/4), [#5](https://github.com/roelsroels/laundry-window/pull/5)).
- Added a proportional green/orange timeline showing how much of a wash falls inside or outside the cheap-price window ([#5](https://github.com/roelsroels/laundry-window/pull/5)).
- Added model compatibility details, source documentation, desktop/mobile screenshots and a reusable AI prompt for contributing another washing-machine profile ([#10](https://github.com/roelsroels/laundry-window/pull/10)).
- Added the Buy Me a Beer footer button, GitHub repository link and project funding metadata ([#2](https://github.com/roelsroels/laundry-window/pull/2)).
- Added an isolated `html/` public web root, nginx example configuration, automated validation and GitHub Pages deployment ([#1](https://github.com/roelsroels/laundry-window/pull/1)).
- Added a footer build badge identifying the exact deployed commit and branch ([#17](https://github.com/roelsroels/laundry-window/pull/17)).

### Changed

- Switched the Dutch market-price provider from the lagging Utilitarian mirror to EnergyZero’s public API and clarified that displayed prices are raw wholesale prices excluding taxes, supplier fees, markups and other additions.
- Changed automatic suggestions to prioritize a complete fit inside the cheap-price window before considering a cheaper partial fit ([#9](https://github.com/roelsroels/laundry-window/pull/9)).
- Changed market suggestions to choose the earliest fully fitting wash that can be configured immediately; manually entered windows retain their own timing calculation ([#14](https://github.com/roelsroels/laundry-window/pull/14), [#15](https://github.com/roelsroels/laundry-window/pull/15), [#16](https://github.com/roelsroels/laundry-window/pull/16)).
- Set the default edge safety margin to zero while retaining optional 10, 15 and 30-minute margins.

### Fixed

- Corrected cheap-window boundaries so market suggestions use exact 15-minute intervals rather than arbitrary minute offsets ([#4](https://github.com/roelsroels/laundry-window/pull/4)).
- Corrected coverage warnings and timeline colouring when only part of a programme falls inside the cheap window ([#4](https://github.com/roelsroels/laundry-window/pull/4), [#5](https://github.com/roelsroels/laundry-window/pull/5)).
- Corrected immediate-start handling when starting now is the best valid option ([#7](https://github.com/roelsroels/laundry-window/pull/7)).
- Corrected whole-hour timer rounding and removed suggestions that required returning to the washing machine later ([#12](https://github.com/roelsroels/laundry-window/pull/12), [#16](https://github.com/roelsroels/laundry-window/pull/16)).
- Added a clear “no cheap window left today” result instead of recommending an immediate wash after the identified window had expired ([#13](https://github.com/roelsroels/laundry-window/pull/13)).
- Applied scheduling fixes generically across all brands and timer modes rather than special-casing individual Samsung or Bosch profiles ([#14](https://github.com/roelsroels/laundry-window/pull/14)).

[Unreleased]: https://github.com/roelsroels/laundry-window/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/roelsroels/laundry-window/releases/tag/v1.0.0
