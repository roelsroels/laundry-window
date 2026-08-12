# Laundry Window

[![Validate static site](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml/badge.svg)](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml)

A tiny, dependency-free planner for supported **Samsung and Bosch washing machines**. Choose the model, enter a cheap electricity-price window and select a washing programme; Laundry Window calculates the whole-hour value to select with that machine's finish-timer button.

The calculator runs entirely in the browser. It has no analytics, cookies, server-side code, build step, or package manager. On request, it downloads the latest Dutch day-ahead market-price feed to suggest the cheapest available schedule. The footer loads the optional Buy Me a Coffee button and its Bree Serif font from third-party CDNs. All publicly served files live under [`html/`](html/); repository documentation, tests, screenshots, and deployment configuration stay outside the web root.

> [!NOTE]
> The price buttons call EnergyZero’s public API with the requested calendar date; programme, duration, and other planning values are never sent. As with any web request, the price provider receives ordinary connection metadata such as the visitor's IP address. The footer support button separately loads JavaScript from `cdnjs.buymeacoffee.com`, loads a font from Google Fonts, and links to `buymeacoffee.com/roels`.

## Screenshots

![Laundry Window desktop calculator](screenshots/laundry-window-desktop.png)

<p align="center">
  <img src="screenshots/laundry-window-mobile.png" width="390" alt="Laundry Window mobile calculator">
</p>

## What it handles

- A locally remembered machine selector with separate programme preferences and measured-time overrides per model
- Immediate Start now recommendations plus each machine's real finish-timer range: **Samsung 3–19 hours** and **Bosch 1–24 hours**, in whole-hour increments
- Windows that cross midnight
- All eleven dial programmes listed in Samsung's manual
- Documented Bosch WAE284A7NL/12 baseline/test settings, including temperature-specific Cotton choices
- Quick wash selections from 15–60 minutes
- A configurable safety margin around the cheap-price window
- Prewash for the Samsung profile, which Samsung documents as adding approximately 18 minutes
- Per-programme measured-time overrides, stored only in the current browser
- A preferred programme per machine, initially **Dark garments** on Samsung and **Cotton 40 °C** on Bosch, stored only in the current browser
- Complete English and Dutch interfaces, with the language stored only in the current browser
- Separate optional suggestions for today and tomorrow, once tomorrow’s prices are published
- A closest-fit suggestion when no setting keeps the complete wash inside the window
- A proportional timeline: green inside the cheap window and orange outside it

## Live market-price suggestions

The **Suggest today** and **Suggest tomorrow** buttons download Dutch prices from [EnergyZero’s public API](https://external.docs.api.staging.energyzero.nl/docs/api/rest/public/public-api/). Its `base` stream supplies the raw market price in `€/kWh` at 15-minute resolution, without VAT or other additions. Laundry Window converts that stream to `€/MWh` internally and offers tomorrow as soon as both its prices and a valid washer setting are available.

EnergyZero states that next-day electricity prices normally appear around **15:00**. The previous Utilitarian mirror sometimes lagged after the underlying market had already published; it has been removed from the application.

Laundry Window evaluates the real duration of the selected programme against immediate Start now and every whole-hour finish-timer choice supported by the selected machine. It first limits the choice to cycles that fit completely inside the displayed low-price band and selected safety margin, then recommends the one with the lowest duration-weighted average market price. Only when no complete fit exists does it fall back to the candidate with the greatest overlap, using price as the tie-breaker. For today, it also shows the latest safe-start time that keeps the full cycle and selected safety margin inside the low-price band.

The green period remains separate from that machine-constrained recommendation. It is the longest contiguous low-price band for the chosen day, aligned to exact 15-minute intervals; its cutoff is `max(€5/MWh, the day’s minimum + €10/MWh)`. The start/end fields contain this actual band—not the proposed wash itself. If the best still-selectable wash extends beyond it, the timeline shows that portion in orange and reports the percentage that remains inside. This prevents a late request from making an already-missed cheap period look 100% reachable.

Refreshing “now” reruns the same day’s market optimisation so the washer setting cannot silently become stale.

The displayed figure is the **raw wholesale market price** (Dutch: **kale beursprijs**), converted to cents per kWh. It excludes every addition, including energy tax, VAT, network or supplier fees, supplier markups, and other contract costs. Fixed additions do not change which interval is cheapest, but users should still treat the result as a planning suggestion rather than an exact retail-price quote. The external feed is best-effort; manual entry remains available if it is late or unavailable.

## Compatibility

| Profile | Status | Washing machines |
| --- | --- | --- |
| Samsung | **Physically verified** | `WF702Y4BKWQ/EN` |
| Samsung | **Covered by the same official manual and programme table** | `WF702Y4BK**`, `WF702B4BK**`, `WF700Y4BK**`, `WF700B4BK**`, `WF602Y4BK**`, `WF602B4BK**`, `WF600Y4BK**`, `WF600B4BK**` |
| Bosch | **Exact model profile** | `WAE284A7NL/12` (`Maxx 7 VarioPerfect`) |

The `**` characters represent regional or finish suffixes. The exact machine photographed and used while building the calculator is `WF702Y4BKWQ/EN`; the sibling families are documented by Samsung in the same manual but have not all been physically tested here.

The Bosch profile uses its own **Klaar in / Ready in** range of 1–24 hours and only includes settings for which the WAE284A7/Maxx 7 programme table documents a duration. Bosch notes that the displayed duration can change while the wash is optimised. Programmes without a published single baseline are therefore not assigned invented times; enter the duration shown on the machine in the measured-time field when needed.

Other models are **not assumed compatible** unless listed above. The profiles are isolated in `html/app.js`, so another verified machine can be added without reusing durations or timer rules from an unrelated model.

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

The Pages workflow uploads only the `html/` directory, preserving the same public-file boundary as the nginx configuration.

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
│   ├── app.js               # Programme data and Delay End calculation
│   └── market-prices.js     # Browser-only market-price optimiser
├── nginx/                   # Example nginx vhost
├── docs/SOURCES.md          # Appliance documentation and caveats
├── screenshots/             # Real desktop and mobile captures
└── tests/smoke.mjs          # Dependency-free repository checks
```

## License

MIT
