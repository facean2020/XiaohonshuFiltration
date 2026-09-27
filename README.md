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

---

# 小红书评论过滤

这是一个 macOS Safari Web Extension，用于过滤小红书评论。

## 功能

- 根据关键词过滤评论
- 通过可配置的模型服务进行可选的模糊匹配
- 提供调试模式，用于查看命中的评论
- 休眠机制：所有过滤功能关闭后，扫描器会自动停止
- Safari 工具栏和设置页面使用统一的过滤器图标

## 环境要求

- macOS
- 支持 macOS App 和 Safari Web Extension 的 Xcode
- 支持 Manifest V3 扩展的 Safari

## 构建和运行

1. 使用 Xcode 打开 `XiaohonshuFiltration.xcodeproj`。
2. 选择 `XiaohonshuFiltration (macOS)` scheme。
3. 构建并运行 App。
4. 在 Safari 的“设置”或“设置 > 扩展”中启用本扩展。
5. 在扩展弹窗或设置页面中配置关键词和模糊匹配规则。

## 说明

扩展只会扫描 `xiaohongshu.com` 下的小红书页面。当关键词过滤和模糊匹配都关闭时，内容扫描器会停止运行，从而避免不必要的 DOM 监听和过滤计算。

## 许可证

本项目目前尚未声明软件许可证。如需公开分发，请先补充合适的许可证。
