# Laundry Window

[![Validate static site](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml/badge.svg)](https://github.com/roelsroels/laundry-window/actions/workflows/validate.yml)

A tiny, dependency-free planner for the **Samsung WF702Y4BKWQ/EN** washing machine. Enter a cheap electricity-price window and a washing programme; Laundry Window calculates the whole-hour value to select with the machine's **Delay End / Uitgesteld einde** button.

The site runs entirely in the browser. It has no analytics, cookies, server-side code, build step, package manager, or network dependency.

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

Other Samsung models and other brands are **not currently assumed compatible**. The programme data is deliberately kept together in `app.js`, making a future brand/model selector straightforward once another machine's manual has been verified.

## Run locally

Open `index.html` directly, or start any static file server in the repository directory. For example:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy with nginx

Copy the repository to `/var/www/laundry-window`, then install the example vhost:

```sh
sudo cp nginx/laundry-window.conf.example /etc/nginx/sites-available/laundry-window
sudo ln -s /etc/nginx/sites-available/laundry-window /etc/nginx/sites-enabled/laundry-window
sudo nginx -t
sudo systemctl reload nginx
```

Change `server_name` and `root` in the vhost when your hostname or directory differs. For a local-only hostname, point `laundry-window.local` at the server in your local DNS or hosts file.

## GitHub Pages

Because the site is completely static, it can also be served directly with GitHub Pages: open **Settings → Pages**, choose **Deploy from a branch**, and select `main` with the repository root.

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
├── index.html               # Website structure
├── styles.css               # Responsive design
├── app.js                   # Programme data and calculation
├── nginx/                   # Example nginx vhost
├── docs/SOURCES.md          # Appliance documentation and caveats
├── screenshots/             # Real desktop and mobile captures
└── tests/smoke.mjs          # Dependency-free repository checks
```

## License

MIT
