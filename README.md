# FileHelper · 桌面端

<p align="center">
  <img src="build/icon_1024.png" width="128" alt="icon" />
</p>

<p align="center">
  <b>一个轻量桌面客户端，封装 <code>filehelper.weixin.qq.com</code> 网页版文件传输。</b><br/>
  A lightweight desktop wrapper for the filehelper.weixin.qq.com web app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%28Apple%20Silicon%29-lightgrey" />
  <img src="https://img.shields.io/badge/Electron-43-9feaf9" />
  <img src="https://img.shields.io/badge/license-MIT-orange" />
</p>

---

## ✨ 功能 / Features

- 🚀 **独立窗口** — 不再占用浏览器标签页，启动即用，支持固定在 Dock
- 📱 **手机 ⇄ 电脑互传** — 扫码登录后即可在手机与桌面之间传文件、文字、图片
- 🎨 **跟随系统深浅色** — 窗口底色自动适配明暗模式
- 🪟 **窗口状态记忆** — 记住上次窗口位置和大小
- 🧵 **细滚动条 + 抗锯齿渲染** — 注入 CSS 美化页面细节
- 📋 **系统级快捷键** — `⌘C / ⌘V / ⌘A / ⌘R` 等原生菜单快捷键
- 🖥 **菜单栏托盘图标** — 点击托盘快速唤起 / 隐藏窗口
- 🔗 **外链托管** — 站外链接自动用系统默认浏览器打开
- 🔒 **最小权限** — 沙箱模式，禁用 Node 集成，仅放开剪贴板等必要权限

## 📸 预览 / Preview

首次启动后扫码登录，即可在手机与本机之间互传文件、文字和图片：

<p align="center">
  <img src="docs/screenshot.png" width="360" alt="FileHelper 桌面端截图" />
</p>

## 📦 安装 / Install

### 方式一：从源码构建 / Build from source

```bash
git clone git@github.com:LeeZhen-CN/filehelper-desktop.git
cd filehelper-desktop
npm install

# 开发模式运行
npm start

# 打包为 macOS .app（Apple Silicon）
npm run package
```

产物位于 `dist/FileHelper-darwin-arm64/`。

其他平台（Intel Mac / Windows / Linux）：

```bash
npx electron-packager . FileHelper --platform=<darwin|win32|linux> --arch=<x64|arm64> --icon=build/icon.icns --out=dist --overwrite
```

> 首次打开若提示「无法验证开发者」：系统设置 → 隐私与安全性 → 仍要打开。

## 🛠 技术栈 / Tech Stack

| 组件 | 说明 |
|---|---|
| Electron 43 | 壳与主进程（`main.js`，约 200 行，零运行时依赖） |
| electron-packager | 打包 |
| Pillow + iconutil | 生成应用图标（`make_icon.py`） |

## 📁 项目结构 / Structure

```
├── main.js          # Electron 主进程（窗口、菜单、托盘、CSS 注入）
├── make_icon.py     # 图标生成脚本（Pillow）
├── build/           # 图标资源（icon.icns / icon_1024.png）
├── docs/            # README 截图等文档资源
└── package.json
```

## ⚠️ 免责声明 / Disclaimer

本项目为**非官方**个人开源项目，仅对腾讯官方网页版文件传输服务（`filehelper.weixin.qq.com`）做最小化的客户端封装：

- **不修改、不拦截、不上传任何用户数据** — 本项目无后端、无遥测、无数据收集。
- **不与腾讯存在任何关联** — 本项目由个人独立开发，未获得腾讯授权或背书。
- **不拥有相关商标** — 「微信」「WeChat」「文件传输助手」及其相关标识均为腾讯科技（深圳）有限公司的注册商标，本项目仅以事实性方式提及源服务地址。
- **使用风险自担** — 第三方封装客户端可能触发上游服务的账号风控、登录限制或服务条款变更，使用者应自行评估并承担相应风险。
- **不提供任何保证** — 本项目按「现状」提供，作者不对因使用本项目导致的任何直接或间接损失负责。

如本项目侵犯了您的合法权益，请通过 GitHub Issues 联系作者，将第一时间处理。

---

This is an **unofficial** personal open-source project. It is a thin desktop wrapper around the public web service at `filehelper.weixin.qq.com` and does not touch user data. The author is not affiliated with, endorsed by, or sponsored by Tencent. All trademarks referenced belong to their respective owners. Use at your own risk.

## 📄 License

[MIT](LICENSE)
