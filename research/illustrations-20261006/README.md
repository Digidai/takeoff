# 120 城市插画 · 2026-10-06

对应 [120 城市研究目录](../global-cities-20261006/README.md)，每座城市分别使用
OpenAI 内置 imagegen 生成一张纵向旅行插画。提示词描述该城市的代表地标与
环境，统一采用手绘水粉风格，供深色机窗网页使用。

- [完整提示词](prompts.json)：按城市列出每次实际使用的生成提示词。
- [逐城生成记录](receipts/)：保存输出标识、提示词校验值、原始 PNG 校验值、
  网站 WebP 校验值、尺寸与字节数。
- [网站插画](../../public/assets/illustrations/)：全部独立生成的 WebP 文件。
- [发布清单](../../public/illustrations.json)：网站可使用的完整素材清单。

原始 PNG 保存在本地 `output/imagegen/originals/`，不加入 Git；工具默认保存
的原件也保留。WebP 使用质量 90 的格式压缩，保留原始尺寸与构图。机窗在
网页中按比例裁切展示。地标组合、光线与视角为艺术化表现。

生成使用内置 imagegen 工具；`scripts/store-illustration.py` 只保存文件与进行
格式压缩，需要 Pillow。完成逐城生成后运行 `scripts/compile-illustrations.py`
生成 JSON 与浏览器元数据，再运行 `npm run check` 核验完整性。

研究照片仍保留原始作者与独立许可；[第三方声明](../../THIRD_PARTY_NOTICES.md)
将其与生成插画区分。字体遵循各自的 OFL 许可。
