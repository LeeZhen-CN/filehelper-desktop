const { app, BrowserWindow, Menu, nativeTheme, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_URL = "https://filehelper.weixin.qq.com/";
const APP_NAME = "FileHelper";
const STATE_FILE = () => path.join(app.getPath("userData"), "window-state.json");

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 720;

app.setName(APP_NAME);

/* ---------- 调试日志：写入 userData/debug.log（打包后无终端可见） ---------- */
function LOG(...args) {
  try {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "debug.log"),
      `${new Date().toISOString()} ${args.join(" ")}\n`
    );
  } catch (_) {}
}

/* ---------- 窗口状态记忆 ---------- */
function loadWindowState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE(), "utf-8"));
    if (s && s.width && s.height) return s;
  } catch (_) {}
  return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, x: undefined, y: undefined };
}

function saveWindowState(win) {
  try {
    const b = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
    fs.writeFileSync(STATE_FILE(), JSON.stringify(b));
  } catch (_) {}
}

/* ---------- 应用菜单（含复制/粘贴等系统快捷键） ---------- */
function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about", label: `关于 ${APP_NAME}` },
              { type: "separator" },
              { role: "hide", label: "隐藏" },
              { role: "hideothers", label: "隐藏其他" },
              { type: "separator" },
              { role: "quit", label: "退出" },
            ],
          },
        ]
      : []),
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { role: "reload", label: "重新加载" },
        { role: "forcereload", label: "强制重新加载" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        {
          label: "重置窗口大小",
          accelerator: "CmdOrCtrl+0",
          click: () => {
            if (mainWindow) {
              mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
              mainWindow.center();
            }
          },
        },
      ],
    },
    {
      label: "窗口",
      submenu: [
        { role: "minimize", label: "最小化" },
        { role: "zoom", label: "缩放" },
        { role: "close", label: "关闭" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------- 页面美化 CSS ----------
 * 核心目标：把微信网页版原本 550px 宽的居中卡片强制铺满整个窗口
 */
const INJECT_CSS = `
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(128,128,128,.35); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,.55); }
  html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  body { overscroll-behavior: none; }

  /* 根容器占满整个窗口，去掉深色边 */
  html, body, #app, .app {
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #fff !important;
  }
  #app, .app {
    display: flex !important;
    flex-direction: column !important;
  }

  /* 聊天面板强制全填充，移除 550px 上限 */
  .chat {
    align-items: stretch !important;
    justify-content: flex-start !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
  }
  .chat-main {
    flex: 1 !important;
    width: 100% !important;
    top: 0 !important;
    justify-content: flex-start !important;
  }
  .chat-panel {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    min-width: auto !important;
    min-height: auto !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }
  .chat-panel__header { flex-shrink: 0 !important; }
  .chat-panel__body { flex: 1 !important; height: auto !important; }
  .chat-panel__input { flex-shrink: 0 !important; }
`;

function bgForTheme() {
  return nativeTheme.shouldUseDarkColors ? "#1e1e1e" : "#ffffff";
}

let mainWindow = null;
const injectedCssKeys = new WeakMap();

/* preload 暴露的退出通道（preload.js 在捕获阶段拦截网页「×」按钮后走此通道）。
 * 微信网页注册了 onbeforeunload（返回"关闭提示"），会拦截正常关窗流程，
 * 导致 app.quit() 卡住——这里用 destroy() 强制销毁窗口绕过它。
 */
ipcMain.on("fh-app-quit", () => {
  LOG("[quit] 收到页面退出请求 (fh-app-quit)，强制销毁窗口");
  forceQuit();
});

function forceQuit() {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      saveWindowState(mainWindow);
      mainWindow.destroy();
    }
  } catch (_) {}
  app.quit();
}

ipcMain.on("fh-preload-loaded", () => {
  LOG("[preload] 已加载，点击拦截已生效");
});

/* 给每个 webContents 注入全填充 CSS，并防止重复累积 */
async function applyPageFill(contents) {
  try {
    if (injectedCssKeys.has(contents)) {
      try { await contents.removeInsertedCSS(injectedCssKeys.get(contents)); } catch (_) {}
    }
    const key = await contents.insertCSS(INJECT_CSS);
    injectedCssKeys.set(contents, key);
  } catch (_) {}
}

function createWindow() {
  const state = loadWindowState();
  const win = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 600,
    minHeight: 500,
    title: APP_NAME,
    backgroundColor: bgForTheme(),
    autoHideMenuBar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow = win;

  // 窗口就绪后再显示，避免白屏闪烁
  win.once("ready-to-show", () => win.show());

  win.loadURL(APP_URL, {
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  });

  // 页面注入统一在 web-contents-created 钩子里处理（含子窗口）

  // 站内链接在窗口内打开，外部链接交给系统浏览器
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://filehelper.weixin.qq.com")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("https://")) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  // 关闭按钮：保存窗口状态后强制销毁窗口，应用随之退出。
  // 网页注册了 onbeforeunload 会拦截默认关窗（弹确认框/直接取消），
  // 这里 preventDefault + destroy() 绕过它，保证红点/⌘W 立即关闭。
  win.on("close", (e) => {
    if (win.isDestroyed()) return;
    e.preventDefault();
    saveWindowState(win);
    win.destroy();
  });
  win.on("closed", () => (mainWindow = null));
  return win;
}

/* ---------- Dock 激活时唤回/重建窗口 ---------- */
function showMainWindow() {
  if (mainWindow) {
    mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
  } else {
    createWindow();
  }
}

/* ---------- 权限 & 全局 CSS 注入 ---------- */
app.on("web-contents-created", (_e, contents) => {
  LOG(`[main] web-contents-created type=${contents.getType()}`);
  // 所有 webContents（含 window.open 弹出的子窗口）：
  // dom-ready 最早就绪，did-finish-load 可能被 Service Worker 拖住，全都要挂
  contents.on("dom-ready", () => {
    LOG("[main] dom-ready");
    applyPageFill(contents).then(() => LOG("[css] applied"));
  });
  // 全填充 CSS 在多个时机注入；「×」按钮拦截已移至 preload.js（每次页面加载自动生效）
  contents.on("did-finish-load", () => applyPageFill(contents));
  contents.on("did-navigate", () => applyPageFill(contents));
  contents.on("did-navigate-in-page", () => applyPageFill(contents));

  contents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ["clipboard-read", "clipboard-sanitized-write", "media"];
    callback(allowed.includes(permission));
  });
});

// 暗色模式切换时同步窗口底色
nativeTheme.on("updated", () => {
  if (mainWindow) mainWindow.setBackgroundColor(bgForTheme());
});

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  // 点击 Dock 图标：窗口已关时重新创建
  app.on("activate", showMainWindow);
});

app.on("window-all-closed", () => {
  // 所有窗口关闭即退出（含 macOS，点 ✕ = 完全退出）
  app.quit();
});

app.on("will-quit", () => {
  LOG("[main] 应用正在退出 (will-quit)");
});
