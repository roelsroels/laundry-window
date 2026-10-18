# Contributing to Laundry Window

Thanks for helping make Laundry Window more useful and more trustworthy. Small fixes, translations, accessibility improvements, documentation updates and carefully sourced washing-machine profiles are welcome.

## Before opening a change

1. Search the [existing issues](https://github.com/roelsroels/laundry-window/issues) to avoid duplicate work.
2. Open a bug report for a defect or a machine-profile request when programme data still needs to be researched.
3. Keep the public website inside `html/`. Documentation, tests, screenshots and deployment configuration belong outside that directory.
4. Do not add runtime libraries, trackers, cookies or backend services without first discussing the privacy and maintenance trade-offs in an issue.

## Local checks

The website itself needs only a browser and a static web server. Before submitting a pull request, run:

```sh
node --check html/theme.js
node --check html/machines.js
node --check html/market-prices.js
node --check html/i18n.js
node --check html/app.js
node --test tests/smoke.mjs
npx --yes html-validate@11.16.2 html/index.html
git diff --check
```

The pull request checks additionally run CodeQL, link validation and a Lighthouse accessibility audit.

The link workflow checks user-facing Markdown and HTML. Official Hisense, AEG and Beko source domains are excluded because they reject or break automated HTTP clients; their URLs remain documented for manual review. Changelog comparison URLs are also excluded because a release pull request necessarily references its tag before that tag can safely be created. Runtime API URLs are covered by application tests because their bare endpoints require request parameters and cannot be validated as ordinary links.

## Adding a washing machine

Use the detailed [machine-profile checklist and reusable AI prompt](README.md#add-another-washing-machine). Every profile needs an exact model identifier, manufacturer-backed programme/reference durations, documented timer semantics and source notes in [`docs/SOURCES.md`](docs/SOURCES.md). Never infer timing data from a visually similar model.

## Documentation and badges

- Update the README compatibility table and profile count when a model is added or removed.
- Update screenshots when the visible interface changes materially.
- Record user-visible changes under `Unreleased` in [`CHANGELOG.md`](CHANGELOG.md).
- Keep workflow badges aligned with real workflow filenames and keep capability badges aligned with tested repository facts. Avoid vanity counters that do not describe project health or supported behaviour.

## Pull requests

Create a focused branch, make a clear commit and open a pull request against `main`. Complete the pull request checklist and wait for all required checks to pass. Maintainers may ask for stronger source evidence when machine behaviour varies by region, programme option or firmware.
