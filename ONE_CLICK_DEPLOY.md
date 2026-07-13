# 潘多拉数字人网站 - 一键部署指南

## 只需要 2 步，3 分钟搞定！

### 第 1 步：创建仓库（1 分钟）
1. 打开这个链接：https://github.com/new
2. 仓库名填：pandora-digital-human
3. 选 Public（公开）
4. 点 Create repository（创建仓库）

### 第 2 步：推送代码（2 分钟）
创建完仓库后，页面会显示一些命令，找到类似这样的两行：

`
... push an existing repository from the command line
`

在下面复制粘贴这两条命令（把 YOUR_USERNAME 换成你的用户名 baiguoxiang）：

`powershell
git remote add origin https://github.com/baiguoxiang/pandora-digital-human.git
git branch -M main
git push -u origin main
`

## 推送完成后
1. 打开仓库页面：https://github.com/baiguoxiang/pandora-digital-human
2. 点 Settings 标签
3. 左侧菜单找 Pages
4. Source 选 GitHub Actions
5. 点 Save

## 访问网站
等 2-3 分钟后访问：
https://baiguoxiang.github.io/pandora-digital-human
