# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.

## [Unreleased]

### Planned

- Improved table rendering
- Further Markdown compatibility improvements

## [1.0.2] - 2026-04-27

### Added

- Support for hidden README filename variants such as `.README.md`, `.Readme.md`, and `.readme`
- Support for Markdown task lists (`- [ ]` / `- [x]`) in the README header renderer

### Changed

- Render task list items with custom read-only checkbox markers to avoid oversized theme-driven native checkbox inputs
- Improved task list spacing so checkbox list rows are compact and aligned with surrounding Markdown content
- Made task marker colors theme-aware with safe CSS fallbacks for custom/older themes

## [1.0.1] - 2026-03-06

### Added

- Expanded app metadata in `appinfo/info.xml`
- Added richer long description for the App Store page
- Added documentation links for users, admins, and developers
- Added repository, website, and issue tracker metadata
- Added support for a dedicated small screenshot thumbnail in app metadata

### Changed

- Improved App Store presentation and metadata completeness
- Clarified current feature scope and planned Markdown improvements

## [1.0.0] - 2026-03-05

### Added

- Initial public release of Markdown README Viewer
- Inline rendering of `README.md` files inside the Nextcloud Files app
- Support for multiple README filename variants
- Support for core Markdown rendering such as headings, lists, links, emphasis, and code blocks
- Automatic refresh when README content changes
