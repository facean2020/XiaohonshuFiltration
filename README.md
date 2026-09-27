# Xiaohongshu Filtration

A macOS Safari Web Extension that filters comments on Xiaohongshu.

## Features

- Keyword-based comment filtering
- Optional fuzzy matching through a configurable model provider
- Debug mode for inspecting matched comments
- Runtime sleep mode: scanning stops when all filters are disabled
- Safari toolbar and settings icons use the same filter artwork

## Requirements

- macOS
- Xcode with macOS app and Safari Web Extension support
- A Safari version that supports Manifest V3 extensions

## Build and Run

1. Open `XiaohonshuFiltration.xcodeproj` in Xcode.
2. Select the `XiaohonshuFiltration (macOS)` scheme.
3. Build and run the app.
4. Enable the extension in Safari Settings under Extensions.
5. Configure keyword or fuzzy matching rules from the extension popup or settings page.

## Notes

The extension only scans Xiaohongshu pages under `xiaohongshu.com`. When both keyword and fuzzy matching are disabled, the content scanner is stopped to avoid unnecessary DOM observation and filtering work.

## License

This project does not currently declare a software license. Add a license before distributing it publicly.
