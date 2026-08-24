# Laundry Window

[![Validate static site](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml/badge.svg)](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml)

A tiny, dependency-free planner with **ten model-specific washing-machine profiles**. Choose the exact model, enter a cheap electricity-price window and select a programme; Laundry Window calculates the value to select on that machine’s start- or finish-timer control.

The calculator runs entirely in the browser. It has no analytics, cookies, server-side code, build step, or package manager. On request, it downloads the latest Dutch day-ahead market-price feed to suggest the smartest timer value that can be selected immediately. The footer loads the optional Buy Me a Coffee button and its Bree Serif font from third-party CDNs. All publicly served files live under [`html/`](html/); repository documentation, tests, screenshots, and deployment configuration stay outside the web root.

> [!NOTE]
> The price buttons call EnergyZero’s public API with the requested calendar date; programme, duration, and other planning values are never sent. As with any web request, the price provider receives ordinary connection metadata such as the visitor's IP address. The footer support button separately loads JavaScript from `cdnjs.buymeacoffee.com`, loads a font from Google Fonts, and links to `buymeacoffee.com/roels`.

## Screenshots

![Laundry Window desktop calculator](screenshots/laundry-window-desktop.png)

<p align="center">
  <img src="screenshots/laundry-window-mobile.png" width="390" alt="Laundry Window mobile calculator">
</p>

## What it handles

- A locally remembered machine selector with separate programme preferences and measured-time overrides per model
- Immediate Start now recommendations plus each machine’s documented timer type, range and increments
- Both timer meanings: **ends in / Ready in** and **starts in / Delay Start**
- Whole-hour, half-hour and model-specific mixed increment sequences
- Windows that cross midnight
- Ten isolated profiles covering Samsung, Bosch, Hisense, AEG, Haier, Inventum, Beko and Siemens
- Only model-specific, manufacturer-documented programme/reference durations; no guessed cross-model times
- A configurable safety margin around the cheap-price window, defaulting to no margin
- One actionable timer value to select immediately—never an instruction to return to the machine later
- Prewash for the Samsung profile, which Samsung documents as adding approximately 18 minutes
- Per-programme measured-time overrides, stored only in the current browser
- A preferred programme per machine, stored only in the current browser
- Complete English and Dutch interfaces, with the language stored only in the current browser
- Separate optional suggestions for today and tomorrow, once tomorrow’s prices are published
- A closest-fit suggestion when no setting keeps the complete wash inside the window
- A proportional timeline: green inside the cheap window and orange outside it

## Live market-price suggestions

The **Suggest today** and **Suggest tomorrow** buttons download Dutch prices from [EnergyZero’s public API](https://external.docs.api.staging.energyzero.nl/docs/api/rest/public/public-api/). Its `base` stream supplies the raw market price in `€/kWh` at 15-minute resolution, without VAT or other additions. Laundry Window converts that stream to `€/MWh` internally and offers tomorrow as soon as both its prices and a valid washer setting are available.

EnergyZero states that next-day electricity prices normally appear around **15:00**. The previous Utilitarian mirror sometimes lagged after the underlying market had already published; it has been removed from the application.

Laundry Window evaluates the selected programme duration against immediate Start now and every timer value supported by the selected machine **at the current planning time**. For an end timer it subtracts the cycle duration from the selected completion offset; for a start timer it adds the delay before the cycle begins. Values that would imply the wash had already started are rejected.

For automatic market suggestions, the optimiser considers **only values that can be selected right now**. Among those, a complete cycle inside the displayed low-price band and safety margin always wins, with the earliest such wash start preferred. It never asks the user to wait before programming the machine. When no current value fits completely, the value with the greatest overlap wins, followed by earliest start and average price. This priority is shared by every machine profile and applies to both start- and finish-timer controls. A manually entered cheap-energy window keeps the normal calculator behaviour, including its centred complete-fit suggestion. For today, the app also shows the latest safe-start time that keeps the full cycle and selected safety margin inside the low-price band. The safety margin defaults to **0 minutes**; 10-, 15-, and 30-minute margins remain available under **Fine-tune**.

If today’s identified low-price band has already ended, the app does not turn a zero-overlap fallback into a **Start now** recommendation. It presents a no-timer state instead and offers to calculate tomorrow’s schedule.

The green period remains separate from that machine-constrained recommendation. It is the longest contiguous low-price band for the chosen day, aligned to exact 15-minute intervals; its cutoff is `max(€5/MWh, the day’s minimum + €10/MWh)`. The start/end fields contain this actual band—not the proposed wash itself. If the best still-selectable wash extends beyond it, the timeline shows that portion in orange and reports the percentage that remains inside. This prevents a late request from making an already-missed cheap period look 100% reachable.

Refreshing “now” reruns the same day’s market optimisation so the washer setting cannot silently become stale.

The displayed figure is the **raw wholesale market price** (Dutch: **kale beursprijs**), converted to cents per kWh. It excludes every addition, including energy tax, VAT, network or supplier fees, supplier markups, and other contract costs. Fixed additions do not change which interval is cheapest, but users should still treat the result as a planning suggestion rather than an exact retail-price quote. The external feed is best-effort; manual entry remains available if it is late or unavailable.

## Compatibility

| Profile | Timer meaning | Documented range | Default programme |
| --- | --- | --- | --- |
| Samsung `WF702Y4BKWQ/EN` and same-manual Y4BK/B4BK families | Ends in | 3–19h, hourly | Dark garments · 78 min |
| Bosch `WAE284A7NL/12` | Ends in | 1–24h, hourly | Cotton 40 °C · 150 min |
| Hisense `WF3S8043BW3/BLX` | Ends in | 1–24h, hourly | Power Wash · 49 min |
| AEG `LF628600` | **Starts in** | 0:30–1:30 by 30 min, then 2–20h hourly | 20 min. – 3 kg |
| Samsung `WW11DG5B25AB` | Ends in | 1–24h, hourly | Super Speed · 39 min |
| Haier `HW80-BP14929A-S` | Ends in | 0:30–24h, every 30 min | Quick · 15 min |
| Inventum `VWM8010W` / `VWM8030B` | **Starts in** | 1–24h, hourly | Mix · 80 min |
| Beko `BM3WFT31041W` | Ends in | 1–24h, hourly | Xpress 30 °C · 28 min |
| Bosch `WAN2827DNL` | Ends in | 1–24h, hourly | Super quick · 30 min |
| Siemens `WG44J2A9NL` | Ends in | 1–24h, hourly | Extra quick · 30 min |

The `**` characters represent regional or finish suffixes. The exact machine photographed and used while building the calculator is `WF702Y4BKWQ/EN`; the sibling families are documented by Samsung in the same manual but have not all been physically tested here.

### Why this is Netherlands-first

There is no stable, public, model-level “top ten sold in Europe” dataset: model codes, retailers and availability differ by country, and many sales rankings are proprietary. This catalogue is therefore an **NL priority catalogue**, not a claim about audited national sales totals.

The expansion was prioritised from bol.com’s public **Top 10 best-selling washing machines** snapshot on **13 August 2026**, then constrained by evidence quality. Current models from Consumentenbond’s Dutch test coverage were used where a ranked item was a duplicate, a poorly documented marketplace model or lacked an exact official NL programme source. Consumentenbond explains that its selection considers expected sales while ensuring coverage of major brands and common capacities. The result deliberately favours exact timer semantics and manufacturer-backed durations over pretending that a retailer snapshot is an official market-share table.

Profiles are not automatically kept “popular” forever. The selection date is recorded in [`docs/SOURCES.md`](docs/SOURCES.md); future updates can replace or add models without changing existing profile IDs or users’ browser preferences.

Only manufacturer-published fixed, test or reference durations are included. Where a programme is adaptive, the interface describes the duration as indicative and offers a per-programme measured-time override. A short model profile with two trustworthy durations is preferable to a complete-looking profile filled with guesses.

Other models are **not assumed compatible** unless listed above. The profiles are isolated in [`html/machines.js`](html/machines.js), so another verified machine can be added without reusing durations or timer rules from an unrelated model.

## Add another washing machine

A new brand, series, or exact model should get its own profile. Do not copy programme durations or finish-timer behaviour from a machine that merely looks similar: both can differ between regional variants.

### Information to collect

1. Photograph the complete identification label inside the door, around the hatch, or on the rear of the machine. The important field may be called **model code**, **E-Nr.**, **product number**, **PNC**, **service number**, or something similar. Make sure the brand and full suffix are readable. A serial number is normally unnecessary and may be covered before sharing the photo.
2. Photograph the full control panel so every programme, option, and timer button is visible. A close-up of the finish-timer button and display is useful as well.
3. If possible, photograph the displayed duration after selecting each programme with its normal/default options. Record the temperature or other setting whenever it changes the duration.
4. Share the official manual or product page if you have it. Otherwise, the exact identifier from the first photo should be used to find the manufacturer's documentation.
5. Confirm how the timer works: does its number mean **starts in**, **ends in**, **Delay End**, **Ready in**, or something else? Also record its minimum, maximum, and increment, such as 1–24 hours in whole-hour steps.

Published durations should come from the official manual or another model-specific manufacturer source whenever possible. A time observed on the display is useful supporting evidence but can vary with options, load sensing, water temperature, or programme optimisation. If no trustworthy single baseline exists, leave that programme out rather than inventing one; users can still enter a measured duration in the interface.

### Implementation checklist

- Add one entry to [`html/machines.js`](html/machines.js) with a unique stable `id`, brand, exact model, English and Dutch labels, timer mode (`start` or `end`), range and supported choices/step, prewash addition if documented, default programme, groups, and model-specific programme durations in minutes.
- Keep interface-wide English/Dutch copy in [`html/i18n.js`](html/i18n.js); model, programme, manual and reference text lives alongside its profile in `machines.js` so evidence cannot become detached from the applicable model.
- Add the exact sources, page or table references, timer semantics, duration caveats, and the distinction between physically verified and manual-only compatibility to [`docs/SOURCES.md`](docs/SOURCES.md).
- Update the compatibility table and add a baseline-duration table to this README. Claim series-wide compatibility only when the manufacturer places those models under the same applicable manual or programme table.
- Extend [`tests/smoke.mjs`](tests/smoke.mjs) to lock in the new model identifier, timer range, default programme, programme IDs and durations, translations, and any special calculation behaviour.
- Run `node --check html/machines.js`, `node --check html/app.js`, `node --check html/i18n.js`, `node --test tests/smoke.mjs`, and `git diff --check`. Test the selector, remembered preference, measured-time override, immediate start, and earliest/latest timer values in both languages. For a start-delay profile, confirm that the selected value moves the start forward; for an end-timer profile, confirm that it sets the completion offset. Update the README screenshots if the visible interface changed materially.

### Copyable request prompt

Attach the identification-label and control-panel photos, then use this self-contained request. Replace the bracketed preferred programme if you already know it:

> Work on the Laundry Window project at <https://github.com/roelsroels/laundry-window> (live site: <https://roelsroels.github.io/laundry-window/>). Laundry Window is a browser-only static calculator that combines a washing machine’s programme duration and start- or finish-timer controls with a cheap electricity-price window. Inspect the repository and its existing profiles in `html/machines.js` before changing anything, then add my washing machine as a separate, model-specific profile. The attached photos show its identification label/E-number and complete control panel. Read the exact model identifier from the label, then find the official manufacturer manual or programme table. Verify the programme names, default durations, whether the timer means **starts in** or **ends in**, its minimum/maximum range, its exact selectable increments, and any documented prewash addition. Do not reuse times from another model and do not invent durations that are not supported by a trustworthy source. If the evidence covers a wider series, list the exact compatible model patterns and explain why; otherwise support only this exact model. My most-used programme is **[programme name]**; make that the initial preferred programme if it can be verified. Add complete English and Dutch text, source notes and caveats, compatibility and duration tables in the README, and regression tests. Preserve browser-only storage and keep all public website code under `html/`. Run the repository checks and show me any assumptions or programmes that could not be verified before publishing. Prepare the change on a branch and, if I authorize publishing, commit it, push it, open and merge a pull request, deploy GitHub Pages, and verify the live site.

## Run locally

Open `html/index.html` directly, or serve only the `html/` web root. For example:

```sh
python3 -m http.server 8080 --directory html
```

Then open `http://localhost:8080`.

## Deploy with nginx

Clone or copy the repository to `/var/www/laundry-window`, then install the example vhost:

```sh
sudo cp nginx/laundry-window.conf.example /etc/nginx/sites-available/laundry-window
sudo ln -s /etc/nginx/sites-available/laundry-window /etc/nginx/sites-enabled/laundry-window
sudo nginx -t
sudo systemctl reload nginx
```

The vhost uses `/var/www/laundry-window/html` as its document root, so files such as the README, tests, source notes, screenshots, Git metadata, and nginx configuration are not web-accessible. Change `server_name` and `root` when your hostname or clone directory differs. For a local-only hostname, point `laundry-window.local` at the server in your local DNS or hosts file.

> [!IMPORTANT]
> The repository itself is public on GitHub. Moving the site into `html/` creates a clean nginx serving boundary; it does not make repository files private.

## GitHub Pages

The public site is automatically deployed from `html/` to:

**https://roelsroels.github.io/laundry-window/**

The Pages workflow uploads only the `html/` directory, preserving the same public-file boundary as the nginx configuration. Before uploading, it stamps the exact short Git commit and branch into `html/version.js` and cache-busts that file; the running version is therefore always visible in the site footer. A local checkout shows the safe `development · local` fallback instead.

## Samsung programme times

| Programme | Baseline |
| --- | ---: |
| Cotton | 133 min |
| Synthetics | 105 min |
| Jeans | 77 min |
| Bedding | 100 min |
| Dark garments | 78 min |
| Daily wash | 66 min |
| Eco drum clean | 104 min |
| Baby care | 142 min |
| Outdoor care | 72 min |
| Hand wash | 30 min |
| Wool | 38 min |

Samsung notes that actual cycle time can vary with water pressure and temperature, load, fabric, and selected options. See [the source notes](docs/SOURCES.md) for the exact manual references.

## Bosch WAE284A7NL/12 baseline settings

| Programme setting | Baseline |
| --- | ---: |
| Cotton 20 °C | 150 min |
| Cotton 30 °C | 150 min |
| Cotton 40 °C | 150 min |
| Cotton 60 °C | 165 min |
| Cotton 90 °C | 165 min |
| Easy-care 40 °C | 105 min |
| Quick/Mix 40 °C | 75 min |
| Delicates/Silk 30 °C | 45 min |
| Wool 30 °C | 45 min |
| Super quick 15′ | 15 min |

These are documented baseline/test settings rather than a promise that every load will take exactly that long. Bosch explicitly notes that programme duration can change during the cycle as the wash is optimised.

## Repository layout

```text
.
├── html/                    # Complete and only public web root
│   ├── index.html           # Website structure
│   ├── styles.css           # Responsive design
│   ├── i18n.js              # English/Dutch interface text and preference
│   ├── machines.js          # Isolated, bilingual machine/programme catalogue
│   ├── app.js               # UI state and start/end-timer calculation
│   └── market-prices.js     # Browser-only market-price optimiser
├── nginx/                   # Example nginx vhost
├── docs/SOURCES.md          # Appliance documentation and caveats
├── screenshots/             # Real desktop and mobile captures
└── tests/smoke.mjs          # Dependency-free repository checks
```

## License

MIT
