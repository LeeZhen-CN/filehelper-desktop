const { app, BrowserWindow, Menu, Tray, nativeImage, nativeTheme, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_URL = "https://filehelper.weixin.qq.com/";
const APP_NAME = "FileHelper";
const STATE_FILE = () => path.join(app.getPath("userData"), "window-state.json");

app.setName(APP_NAME);

/* ---------- 窗口状态记忆 ---------- */
function loadWindowState() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE(), "utf-8"));
    if (s && s.width && s.height) return s;
  } catch (_) {}
  return { width: 480, height: 720, x: undefined, y: undefined };
}

function saveWindowState(win) {
  try {
    const b = win.getNormalBounds
      ? win.getNormalBounds()
      : win.getBounds();
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
        { role: "resetZoom", label: "实际大小" },
        { role: "zoomIn", label: "放大" },
        { role: "zoomOut", label: "缩小" },
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

/* ---------- 页面美化 CSS ---------- */
const INJECT_CSS = `
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(128,128,128,.35);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,.55); }
  html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  body { overscroll-behavior: none; }
`;

function bgForTheme() {
  return nativeTheme.shouldUseDarkColors ? "#1e1e1e" : "#ededed";
}

let mainWindow = null;

function createWindow() {
  const state = loadWindowState();
  const win = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 380,
    minHeight: 500,
    title: APP_NAME,
    backgroundColor: bgForTheme(),
    autoHideMenuBar: false,
    show: false,
    webPreferences: {
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

  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(INJECT_CSS).catch(() => {});
  });

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

  win.on("close", () => saveWindowState(win));
  win.on("closed", () => (mainWindow = null));
  return win;
}

/* ---------- 托盘 ---------- */
let tray = null;
function createTray() {
  try {
    const candidates = [
      path.join(__dirname, "build", "icon_1024.png"), // 开发模式
      path.join(process.resourcesPath || "", "app", "build", "icon_1024.png"), // 打包后
    ];
    const iconPath = candidates.find((p) => fs.existsSync(p));
    if (!iconPath) return;
    const image = nativeImage.createFromPath(iconPath).resize({ width: 18, height: 18 });
    tray = new Tray(image);
    tray.setToolTip(APP_NAME);
    tray.on("click", () => {
      if (mainWindow) {
        mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show();
      } else {
        createWindow();
      }
    });
  } catch (_) {}
}

/* ---------- 权限 ---------- */
app.on("web-contents-created", (_e, contents) => {
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
  createTray();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
