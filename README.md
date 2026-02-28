# MarkDown-renderer (Nextcloud app)

Show a folder README (README.md / Readme.md / readme.md, etc.) rendered as Markdown at the top of the Files view — similar to GitLab.

## Features
- Renders Markdown in the Files list header
- Supports common README filename variants (case-insensitive)
- Read-only task list checkboxes
- Auto-refresh on save/rename/delete (event-bus)
- Lightweight bundle (highlight.js core + selected languages)

## Compatibility
- Nextcloud 33+
- Files app v4 API

## Installation (dev / custom_apps)
1. Clone into `custom_apps/markdownreadme` (or your app folder name)
2. Enable the app in Nextcloud
3. Build assets:
   ```bash
   npm ci
   npm run build
