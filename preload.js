// preload:
// 1) 暴露可靠的 IPC 退出通道（不依赖 window.close()）
// 2) 直接在捕获阶段拦截网页右上角「×」(icon__loginout / title=关闭)，
//    截停网页自己的登出逻辑，改走 IPC 通知主进程退出应用。
//    preload 与页面共享 DOM，无需 executeJavaScript（后者在本应用环境下会挂起）。
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("filehelper", {
  quit: () => ipcRenderer.send("fh-app-quit"),
});

function isCloseButton(target) {
  return target && target.closest
    ? target.closest('.icon__loginout, [title="关闭"], [class*="loginout"]')
    : null;
}

function intercept(e) {
  if (isCloseButton(e.target)) {
    e.stopPropagation();
    e.preventDefault();
    ipcRenderer.send("fh-app-quit");
  }
}

document.addEventListener("click", intercept, true);
document.addEventListener("pointerdown", intercept, true);

// 通知主进程：preload 已在本页面生效
ipcRenderer.send("fh-preload-loaded");
