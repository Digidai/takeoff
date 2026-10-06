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

## 本地检查

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
