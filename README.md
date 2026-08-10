# Laundry Window

[![Validate static site](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml/badge.svg)](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml)

A tiny, dependency-free planner for the **Samsung WF702Y4BKWQ/EN** washing machine. Enter a cheap electricity-price window and a washing programme; Laundry Window calculates the whole-hour value to select with the machine's **Delay End / Uitgesteld einde** button.

The site runs entirely in the browser. It has no analytics, cookies, server-side code, build step, package manager, or network dependency. All publicly served files live under [`html/`](html/); repository documentation, tests, screenshots, and deployment configuration stay outside the web root.

## Screenshots

![Laundry Window desktop calculator](screenshots/laundry-window-desktop.png)

<p align="center">
  <img src="screenshots/laundry-window-mobile.png" width="390" alt="Laundry Window mobile calculator">
</p>

## What it handles

- The machine's real Delay End range: **3–19 hours in whole-hour increments**
- Windows that cross midnight
- All eleven dial programmes listed in Samsung's manual
- Quick wash selections from 15–60 minutes
- A configurable safety margin around the cheap-price window
- Prewash, which Samsung documents as adding approximately 18 minutes
- Per-programme measured-time overrides, stored only in the current browser
- A closest-fit suggestion when no setting keeps the complete wash inside the window

## Compatibility

| Status | Samsung washing machines |
| --- | --- |
| **Physically verified** | `WF702Y4BKWQ/EN` |
| **Covered by the same official manual and programme table** | `WF702Y4BK**`, `WF702B4BK**`, `WF700Y4BK**`, `WF700B4BK**`, `WF602Y4BK**`, `WF602B4BK**`, `WF600Y4BK**`, `WF600B4BK**` |

The `**` characters represent regional or finish suffixes. The exact machine photographed and used while building the calculator is `WF702Y4BKWQ/EN`; the sibling families are documented by Samsung in the same manual but have not all been physically tested here.

Other Samsung models and other brands are **not currently assumed compatible**. The programme data is deliberately kept together in `html/app.js`, making a future brand/model selector straightforward once another machine's manual has been verified.

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

The nginx-oriented `html/` layout is intentionally not a GitHub Pages branch root. If Pages support is added later, deploy the contents of `html/` with a Pages workflow rather than exposing or copying repository-only files into the web root.

## Programme times

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

## Repository layout

```text
.
├── html/                    # Complete and only public web root
│   ├── index.html           # Website structure
│   ├── styles.css           # Responsive design
│   └── app.js               # Programme data and calculation
├── nginx/                   # Example nginx vhost
├── docs/SOURCES.md          # Appliance documentation and caveats
├── screenshots/             # Real desktop and mobile captures
└── tests/smoke.mjs          # Dependency-free repository checks
```

## License

MIT
