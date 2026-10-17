# Security policy

## Supported version

Laundry Window is a small static website. Security fixes are applied to the current production version on the `main` branch and the live GitHub Pages deployment. Older tags are historical snapshots and do not receive separate patches.

## Reporting a vulnerability

Please use GitHub’s **Report a vulnerability** option in the repository’s Security tab so details remain private while a fix is prepared. Include:

- the affected page, file or workflow;
- a concise reproduction;
- the security impact;
- a suggested mitigation, if known.

Do not include secrets, personal data or exploit details in a public issue. Ordinary bugs without a security impact can use the [bug report form](https://github.com/roelsroels/laundry-window/issues/new?template=bug_report.yml).

You should normally receive an acknowledgement within seven days. Confirmed issues will be assessed, fixed on a private branch where appropriate, and disclosed after a production deployment is available.

## Scope and privacy

The production site has no backend, account system, analytics or cookies. Browser preferences stay in local storage. Its only programmatic network request is the user-triggered Dutch price lookup described in the README; the support link opens a separate website only when selected.
