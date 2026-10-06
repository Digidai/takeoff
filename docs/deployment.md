# Takeoff 发布与验收

网站：https://takeoff.genedai.me

公开源码：https://github.com/Digidai/takeoff

## 发布结构

网站部署为 Cloudflare Worker `genedai-takeoff` 的 Static Assets，使用
`takeoff.genedai.me` Custom Domain。仓库保存原创代码、研究记录、全部照片与
独立授权清单。参考视频、原音轨、早期截帧和本地导出产物未纳入公开仓库。

环境音由 `public/ambient.js` 合成，默认关闭，在用户操作后启动。视频工程使用
同一算法生成 504 秒 WAV；渲染依赖在 `video/package-lock.json` 中锁定。
公开视频工程的 HyperFrames 版本从 0.8.134 更新为 0.8.135，并完成重新检查。

## 原版实景网站检查

- `npm run check`：120 城市与研究目录一致，120 张照片 SHA-256 和字节数一致，
  29,130,981 字节；每张照片都有作者、来源和许可记录；脚本语法与环境音有效。
- 真实 Chromium 交互检查：42 项通过，覆盖全量照片解码、搜索、六洲筛选、
  漫游、随机、拖动、快速切换、沉浸模式、减少动态效果和署名页。
- 响应式视口：1440×900、1054×720，以及 14 个手机与平板尺寸，320×568 到
  1366×1024。触屏模拟 94 项检查通过，360 次城市标题边界检查通过；包含
  touchStart/touchMove/touchEnd 遮板操作、44px 触控按钮和横竖屏分区。
- 刘海屏安全区与软键盘较小可见视口使用 Chromium 模拟检查，尚未在实体
  iOS/Android 设备上验收。
- 环境音浏览器检查：9 项通过，实际输出电平正常；静音、暂停、恢复、快速切换
  与打开目录均按预期改变播放状态。
- `video/npm run check`：HyperFrames 0.8.135 的 lint、runtime、layout、motion
  检查通过；9 个时间采样点无布局问题，31/31 文本对比度检查通过。

## 原版实景网站正式验收 · 2026-10-06

`https://takeoff.genedai.me` 已部署到 Cloudflare，HTTPS 返回正常。
GitHub 的公开仓库与 `main` 分支已推送，GitHub Actions 数据和构建检查通过。

- 正式域名的 120 张照片逐项下载，字节数与 SHA-256 全部匹配源文件；
  共 29,130,981 字节。HTML、脚本、样式、署名页等 11 个文件也逐字节一致。
- 生产浏览器完成 42 项交互检查和全部照片解码，未出现 JavaScript 运行错误。
- 生产触屏模拟完成 94 项检查，覆盖 14 种手机与平板尺寸，以及 360 次城市
  标题边界检查。安全区、键盘缩小后的城市搜索和触屏遮板操作均通过。
- 正式网站环境音完成 9 项浏览器检查；启用后测得音频输出，静音、暂停、
  恢复和快速切换符合预期。
- HTML 未被追加 Cloudflare Analytics 或 JavaScript Detections 脚本；
  `no-transform` 生效。未知路径返回 404。

上述移动端检查使用 Chromium 触屏模拟，尚未在实体 iOS/Android 设备上验收。
本地完整记录保存在忽略的 `output/` 目录，公开仓库保留可复用的检查脚本。

## 发布复核方法

`npm run build` 在 `dist/version.json` 写入 Git commit 与目录校验值。
生产版本应与公开 GitHub 的 `main` 提交一致，并核验 HTTPS 返回、全部照片哈希、
署名页、404 页面、正式域名上的搜索与漫游，以及声音开关行为。

GitHub Actions 只运行数据与构建检查。Cloudflare 发布通过 `npm run deploy`
执行；仓库不保存账户令牌，也没有依赖未配置密钥的自动发布步骤。

站点响应采用 `Cache-Control: no-transform`，保留原始照片字节，并避免域名级
Web Analytics 与 JavaScript Detections 向 HTML 注入脚本。该行为来自
[Cloudflare Web Analytics 文档](https://developers.cloudflare.com/web-analytics/faq/)
及 [JavaScript Detections 文档](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/)。

## 深色插画版 · 2026-10-06

本版按用户提供的布局截图排列：城市名与坐标在机窗上方，单个机窗居中，
城市信息与操作在下方。背景改为深色，停留时间、环境音、进度与沉浸模式
默认收在“靠窗偏好”中。手机保持单窗布局。

- 120 座城市分别使用内置 imagegen 生成独立插画；全部为 1024×1536。
  网站 WebP 共 54,621,876 字节。提示词、原始输出校验值和网站文件校验值
  保存在研究记录中；图片之间的 SHA-256 均不同。
- `npm run check` 与静态构建通过：120 张插画、120 张保留的研究照片、
  字体许可和校验值、城市数据与脚本语法均有效。
- 全局浏览器交互 42 项通过，全部 120 张插画解码成功。
- 移动端 Chromium 触屏模拟 151 项通过：14 种视口，360 次城市标题边界
  检查，真实 CDP touch 手势、安全区、键盘缩小后的搜索和隐藏设置操作。
- UI／UX 补充检查 25 项通过，涵盖设置焦点、停留时间、快速切换、暂停时
  遮板恢复、图片失败后恢复与重试、沉浸模式和减少动态效果。
  400 个文字对比度样本均大于 4.5，最低约 7.01。
- 环境音 11 项浏览器检查通过；开启偏好保持暂停，播放后有可测输出，
  打开设置继续播放，暂停与静音按预期停止声音。

移动端结果来自浏览器模拟，尚未在实体 iOS／Android 设备上验收。
上述为本地验收。发布阶段单独核对公开 Git commit、GitHub Actions、Cloudflare
部署、正式域名版本、全部 120 张插画字节，以及生产浏览器交互；完整发布
记录保存在本地忽略的 `output/` 目录。`version.json` 同时包含插画数量与清单
SHA-256，便于对照正式环境。
