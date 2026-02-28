# MarkDown-renderer (Nextcloud app)

Render a folder README (`README.md`, `Readme.md`, `readme.md`, etc.) directly at the top of the Nextcloud Files view — similar to GitLab.

---

## Features

* Renders Markdown inside the Files list header
* Supports common README filename variants (case-insensitive)
* Read-only task list checkboxes
* Auto-refresh on save, rename, or delete (Nextcloud event bus)
* Lightweight bundle using highlight.js core and selected languages
* UI styling aligned with Nextcloud design

---

## Compatibility

* Nextcloud 33+
* Files app v4 API

---

## Installation (custom_apps)

Clone into your Nextcloud `custom_apps` directory:

```bash
git clone https://github.com/Konstiu/MarkDown-renderer.git markdownreadme
```

Enable the app in Nextcloud (Settings → Apps), then build assets:

```bash
npm ci
npm run build
```

---

## Development

```bash
npm run watch
```

---

## License

This project is licensed under the AGPL-3.0 License.

---
