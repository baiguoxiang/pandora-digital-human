# 潘多拉数字人网站 - 部署指南

## 方案一：Cloudflare Pages（推荐 ⭐）
### 优点：免费、全球CDN、自动HTTPS、无需服务器
### 步骤：
1. 注册 Cloudflare：https://dash.cloudflare.com/sign-up
2. 进入 Pages → Create a project → Connect to Git
3. 选择你的 GitHub 仓库
4. 框架选择：Static sites
5. 构建命令：无（静态文件）
6. 输出目录：. （根目录）
7. 点击 Deploy！

### 部署后你会获得一个免费域名：
https://pandora-xxxx.pages.dev

---

## 方案二：Vercel（也很简单）
### 步骤：
1. 注册：https://vercel.com/signup
2. Import 你的 GitHub 仓库
3. 自动检测为静态站点
4. 一键 Deploy！

### 获得域名：
https://pandora-xxxx.vercel.app

---

## 方案三：GitHub Pages（最简单）
### 步骤：
1. 在你的 GitHub 仓库 Settings → Pages
2. Source 选择 main branch
3. 点击 Save
4. 等待 2-3 分钟

### 获得域名：
https://yourusername.github.io/pandora-digital-human/

---

## 部署前必做（3件事）：

### 1. 替换域名
运行脚本：
powershell
cd "D:\Backup\Documents\数字人\codes\matesx"
.\replace-domain.ps1 你的域名.com
例如：
.\replace-domain.ps1 pandora-xxxx.pages.dev

### 2. 替换微信 AppID（如果需要微信登录）
编辑 js2/l.js，找到这两行：
appid: isWechat ? 'wx0fd8b196dfde694e' : 'wx943ccebf2cd24432'

替换为你自己的微信开放平台 AppID

### 3. 替换 ICP 备案信息（可选）
编辑 login.html，找到底部：
"沪ICP备2024084340号-1"
