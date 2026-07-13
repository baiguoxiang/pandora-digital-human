# 潘多拉数字人网站 - 部署说明

## 项目概述
本项目是从 matesx.com 克隆并定制的品牌站点，已将所有 "MatesX" 品牌标识替换为 "潘多拉"。

## 文件清单
\\\
codes/matesx/
├── home.html              # 首页（入口）
├── weCB.html              # 微信小程序跳转页
├── login.html             # 登录页
├── invite.html            # 邀请页
├── app_login.html         # APP登录页
├── common/
│   └── icon512.jpg        # 网站图标（需替换为潘多拉logo）
├── css/
│   ├── xs-styles.css      # 全局样式
│   ├── home.css           # 首页样式
│   ├── gallery.css        # 画廊样式
│   ├── discovery.css      # 发现页样式
│   ├── my.css             # 个人中心样式
│   └── material-icons.css # 图标字体
├── js/
│   ├── xs-components.js   # 组件库
│   ├── home.js            # 首页逻辑
│   └── page/
│       └── discovery.js   # 发现页逻辑
├── js2/
│   ├── l.js               # 登录/授权逻辑
│   └── weCB.js            # 小程序相关逻辑
├── js_common/
│   └── xs-components.js   # 组件库副本
└── html_setting/
    ├── background.html    # 背景设置
    ├── personalWeb.html   # 个人主页
    ├── systemSetting.html # 系统设置
    ├── privacy.html       # 隐私政策
    ├── contact.html       # 联系我们
    └── app.html           # APP相关
\\\

## 部署前必须修改的配置

### 1. 域名替换（重要！）
所有 \matesx.com\ 已被替换为 \pandora-temp.pages.dev\，你需要在服务器上修改为实际域名：

`ash
# 使用 sed 或编辑器批量替换（示例）
sed -i 's/潘多拉\.com/your-domain.com/g' *.html js2/*.js
`

涉及的文件：
- \js2/l.js\ - 登录授权接口
- \js2/weCB.js\ - 小程序跳转
- 所有 HTML 文件中的 API 地址

### 2. 微信开放平台配置
网站使用微信 OAuth 登录，需要修改 \js2/l.js\ 中的 appid：
\\\javascript
appid: isWechat ? 'wx0fd8b196dfde694e' : 'wx943ccebf2cd24432'
\\\
替换为你自己的微信开放平台 appid。

### 3. Logo 替换
将 \common/icon512.jpg\ 替换为你的潘多拉品牌 logo。

### 4. 备案信息
底部 ICP 备案号需要更新为你的备案信息（在 \home.html\ 和 \login.html\ 中）。

## 后端服务
本前端项目需要以下后端 API 支持：
- \/api/auth/wechat/login\ - 微信登录
- \/api/auth/wechat/login_mp\ - 小程序登录
- \/api/auth/auto_login\ - JWT 自动登录

请确保后端服务部署完成且 CORS 配置正确。

## 快速启动（开发环境）
`ash
# 使用 nginx 或任何静态服务器
cd codes/matesx
python3 -m http.server 8080
# 或
npx serve .
`

访问 \http://localhost:8080/home.html\ 即可预览。

## 注意事项
1. voice-manager/index.html 在原站为 404（动态页面），需单独实现
2. 部分 JS 代码经过混淆，修改时需谨慎
3. 微信登录功能需要有效的微信开放平台账号
