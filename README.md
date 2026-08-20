# 微信传输助手 · WeChat File Helper (Desktop)

<p align="center">
  <img src="build/icon_1024.png" width="128" alt="icon" />
</p>

<p align="center">
  <b>把微信「文件传输助手网页版」装进一个真正的桌面客户端。</b><br/>
  A native-feeling desktop client wrapping the WeChat File Transfer Helper web app.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%28Apple%20Silicon%29-green" />
  <img src="https://img.shields.io/badge/Electron-43-9feaf9" />
  <img src="https://img.shields.io/badge/license-MIT-orange" />
</p>

---

## ✨ 功能 / Features

- 🚀 **独立窗口** — 不再占用浏览器标签页，启动即用，支持固定在 Dock
- 📱 **手机 ⇄ 电脑互传** — 扫码登录后即可在手机微信和桌面之间传文件、文字、图片
- 🎨 **跟随系统深浅色** — 窗口底色自动适配明暗模式
- 🪟 **窗口状态记忆** — 记住上次窗口位置和大小
- 🧵 **细滚动条 + 抗锯齿渲染** — 注入 CSS 美化页面细节
- 📋 **系统级快捷键** — `⌘C / ⌘V / ⌘A / ⌘R` 等原生菜单快捷键
- 🖥 **菜单栏托盘图标** — 点击托盘快速唤起 / 隐藏窗口
- 🔗 **外链托管** — 站外链接自动用系统默认浏览器打开
- 🔒 **最小权限** — 沙箱模式，禁用 Node 集成，仅放开剪贴板等必要权限

## 📦 安装 / Install

### 直接下载（macOS Apple Silicon）

见 [Releases](../../releases)。下载 `.app` 后拖入「应用程序」文件夹即可。

> 首次打开若提示「无法验证开发者」：系统设置 → 隐私与安全性 → 仍要打开。

### 从源码构建 / Build from source

```bash
git clone https://github.com/LeeZhen-CN/wechat-filehelper-desktop.git
cd wechat-filehelper-desktop
npm install

# 开发模式运行
npm start

# 打包为 macOS .app（Apple Silicon）
npm run package
```

产物位于 `dist/微信传输助手-darwin-arm64/`。

其他平台（Intel Mac / Windows / Linux）：

```bash
npx electron-packager . '微信传输助手' --platform=<darwin|win32|linux> --arch=<x64|arm64> --icon=build/icon.icns --out=dist --overwrite
```

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
└── package.json
```

## ⚠️ 免责声明 / Disclaimer

本项目为**非官方**个人开源项目，仅对微信官方网页版文件传输助手（`filehelper.weixin.qq.com`）做客户端封装，不修改、不拦截、不上传任何用户数据。"微信 / WeChat" 名称与商标归腾讯所有。本项目与腾讯无任何关联，请遵守微信相关使用条款。

This is an **unofficial** open-source project. It is a thin desktop wrapper around the official WeChat web file transfer page and does not touch user data. WeChat is a trademark of Tencent.

## 📄 License

[MIT](LICENSE)
