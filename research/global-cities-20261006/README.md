# 全球城市研究与扩展交付

研究日期：2026-10-06（Asia/Shanghai）。对象：Takeoff 互动机窗网站与全球版视频。

本轮将原五城互动原型扩展为 **120 座城市、六大洲、75 个国家／地区标签**。每座城市都有中英文名称、地区、代表地标、城市参考坐标、本地实景照片、原始文件链接、作者、许可证和资料来源。它是用于视觉漫游的精选城市库，不是全球全部城市、城市人口排名、实时航班或旅游安全建议。

## 研究结论如何改变产品

原体验的核心是克制的黑色画面、一扇发光机窗，以及向上关闭的遮板。把 120 个按钮放到首页会破坏这种体验，因此首页保持机窗，城市库通过“探索世界”打开。城市目录支持中文、英文、国家／地区和地标搜索，按六大洲筛选，或将搜索结果直接组成漫游路线。

全球路线轮流从各洲取一城，前六站即覆盖六个区域；每座城市出现一次，再进入下一个循环。区域路线只遍历当前区域，搜索后可以漫游搜索结果；随机飞行优先避开刚看过的五站。网站每站 5 秒，完整路线 10 分钟；视频每站 4.2 秒，120 站共 504 秒（8 分 24 秒）。此节描述本项目的实现选择，不是外部研究的既定最佳做法。

## 覆盖与选城原则

选择兼顾视觉辨识度、区域广度、城市景观差异、可追溯资料与可获得的实景照片。包含超大城市、历史古城、港口、山地城市和较少出现在通用旅行模板中的目的地。亚洲与欧洲占 55%，其余四洲占 45%；这仍是策划配额，不代表人口、市场份额或旅行热度。

| 区域 | 城市数 | 国家／地区标签数 | 代表城市 |
| --- | ---: | ---: | --- |
| 亚洲 | 36 | 24 | 上海、东京、北京、香港、台北、首尔 |
| 欧洲 | 30 | 21 | 巴黎、伦敦、罗马、威尼斯、佛罗伦萨、米兰 |
| 非洲 | 16 | 12 | 开罗、亚历山大、马拉喀什、卡萨布兰卡、突尼斯、阿尔及尔 |
| 北美洲 | 16 | 6 | 纽约、旧金山、洛杉矶、芝加哥、华盛顿、波士顿 |
| 南美洲 | 14 | 8 | 里约热内卢、布宜诺斯艾利斯、圣保罗、巴西利亚、萨尔瓦多、利马 |
| 大洋洲 | 8 | 4 | 悉尼、墨尔本、布里斯班、珀斯、奥克兰、惠灵顿 |

“国家／地区”是网站显示标签，不能当作主权国家计数；例如中国与中国台湾采用不同的显示标签，香港归入中国。伊斯坦布尔、巴库等跨区域目的地按产品导航需要归入一个区域，避免同一城市重复。本轮不把南极科考站加入城市路线。

## 证据和核验方法

1. `city-seeds.tsv` 保存 120 城的策划清单、对应城市条目与地标条目，共核对 238 个去重条目。通过 Wikipedia PageImages、GeoData 与 Wikidata P625 获取资料与城市参考坐标；保留原始 API 回包，不将坐标解释为飞机、机场或相机位置。
2. 地标图片优先于泛城市图片；文章首图为旗帜、地图、徽标、拼图或没有可用 Commons 许可记录时，转为有明确照片元数据的候选。只纳入记录显示 CC BY、CC BY-SA、CC0 或公有领域的照片，不纳入 NC/ND。
3. 图片搜索只是候选获取工具。逐张核对后替换施工中的芝加哥云门、阿布扎比装饰瓷砖局部、台北缺少 101 主体的城市首图和达喀尔纪念碑离开中心的远景；芝加哥改用可明确辨认的威利斯大厦与城市天际线。候选脚本已改成仅写候选清单，不能覆盖人工确认的选择。
4. 舷窗为 168×238 的照片显示区，宽幅照片默认等比中心裁切。上海和首尔靠左保留主体，佛罗伦萨和芝加哥靠右保留穹顶与大厦，台北靠上保留塔尖，雅加达选择明确包含国家纪念塔的城市全景。照片文件像素未改写，裁切发生在网页/SVG 的显示层；不使用 AI 合成地标代替实景。
5. 代表地标额外核对官方机构：香港旅游发展局的维多利亚港，埃菲尔铁塔官网位置，SANParks 的桌山，Sydney Opera House 的官方建筑资料，NPS 的自由女神像，以及 UNESCO 的瓦尔帕莱索历史城区。官方核对是代表性抽查，不声称 120 城全部经过官方旅游局审查。

| 官方来源 | 本轮用途 |
| --- | --- |
| [香港旅游发展局：维多利亚港](https://www.discoverhongkong.com/eng/place-to-go/travel.guide-victoria-harbour.html) | 核对港湾与城市景观关系 |
| [埃菲尔铁塔：位置](https://www.toureiffel.paris/en/access-map) | 核对巴黎代表地标位置 |
| [SANParks：桌山](https://www.sanparks.org/parks/table-mountain/what-to-do/attractions/table-mountain) | 核对开普敦自然景观选择 |
| [Sydney Opera House：About us](https://www.sydneyoperahouse.com/about-us) | 核对悉尼歌剧院与 Bennelong Point |
| [NPS：Statue of Liberty](https://www.nps.gov/stli/index.htm) | 核对纽约代表地标 |
| [UNESCO：瓦尔帕莱索历史城区](https://whc.unesco.org/en/list/959/) | 将泛城区照片准确描述为历史城区，避免误标为单一地标 |

## 照片、署名与边界

所有 120 张图片都存放在 `public/assets/cities/`，运行网站不依赖远端图片或 API。每个文件记录原始页面、下载地址、作者、许可证、原图与缩略图尺寸、下载字节数、SHA256 和采集日期。许可证分布：

- CC BY 2.0：11 张。
- CC BY 2.5：3 张。
- CC BY 3.0：1 张。
- CC BY 4.0：5 张。
- CC BY-SA 2.0：5 张。
- CC BY-SA 2.5：2 张。
- CC BY-SA 3.0：27 张。
- CC BY-SA 3.0 de：1 张。
- CC BY-SA 3.0 nz：1 张。
- CC BY-SA 3.0 pl：1 张。
- CC BY-SA 4.0：52 张。
- CC0：6 张。
- Public domain：5 张。

照片文件共 29,130,981 字节。许可来自各文件元数据；完整说明仍以原始文件页面为准。网站每城详情与 [`credits.html`](../../public/credits.html) 均提供可见署名和许可链接；视频逐城显示作者与许可，并随片提供完整署名文件。遵循 [Commons 的站外使用说明](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia)，不将 Commons 当作照片版权所有者。

照片拍摄时间可能早于本轮采集日期；城市资料、照片下载与浏览器测试都不是实时城市状态证明。本轮不提供交通、门票、签证、安保或开放时间结论。图片通常从地面或建筑视角拍摄，机窗只是视觉呈现，并不声称图片是实际航拍。公开版本仅包含下列独立来源的 Commons 照片、原创机窗代码、程序纹理与环境音。参考视频、原片音轨与旧五城截帧不纳入公开源码或部署。

## 文件导航与可重复更新

- [完整机器可读目录](site-catalog.json)：网站最终数据，含所有来源、署名、坐标与显示裁切参数。
- [策划清单](city-seeds.tsv)、[人工选图](photo-overrides.json)、[显示参数与官方资料](presentation.json)。
- [原始资料](catalog.json)、[完整呈现目录](site-catalog.json)、[自动获取问题](issues.json)。API 回包可通过研究脚本重新采集，`raw/` 是本地缓存。`issues.json` 无未解决项只表示该获取流程通过，不等于无任何研究局限。
- [全量照片署名页](../../public/credits.html)、[照片许可清单](../../THIRD_PARTY_NOTICES.md)、[项目与部署说明](../../README.md)、[全球视频工程](../../video/)。
- 维护流程：先改种子清单和人工图片选择，执行 `python3 scripts/research-cities.py`、`python3 scripts/compile-cities.py`，再做全量图片和浏览器复核。搜索候选不得直接自动发布。当前编译器明确校验 120 城；进一步增加时应同步更新数量契约、文案和视频时长。

## 120 城完整来源表

坐标保留四位小数只是显示格式，不表示位置精度。照片文件链接包含完整许可证与作者细节。

### 亚洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 上海 / Shanghai | 中国 | 外滩 | N  31.2325°    E  121.4692° | [城市](https://en.wikipedia.org/wiki/Shanghai) · [地标](https://en.wikipedia.org/wiki/The_Bund) · [照片](https://commons.wikimedia.org/wiki/File:The_Bund_2.jpg) | 钉钉 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 东京 / Tokyo | 日本 | 东京塔 | N  35.6897°    E  139.6922° | [城市](https://en.wikipedia.org/wiki/Tokyo) · [地标](https://en.wikipedia.org/wiki/Tokyo_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Tokyo_Tower_2023.jpg) | Akonnchiroll · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 北京 / Beijing | 中国 | 天坛 | N  39.9067°    E  116.3975° | [城市](https://en.wikipedia.org/wiki/Beijing) · [地标](https://en.wikipedia.org/wiki/Temple_of_Heaven) · [照片](https://commons.wikimedia.org/wiki/File:Temple_of_Heaven_20160323_01.jpg) | Shujianyang · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 香港 / Hong Kong | 中国 | 维多利亚港 | N  22.3000°    E  114.2000° | [城市](https://en.wikipedia.org/wiki/Hong_Kong) · [地标](https://en.wikipedia.org/wiki/Victoria_Harbour) · [照片](https://commons.wikimedia.org/wiki/File:Victoria_Harbour_skyline,_Hong_Kong_(2008).jpg) | ImMrDrake · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| 台北 / Taipei | 中国台湾 | 台北101 | N  25.0375°    E  121.5625° | [城市](https://en.wikipedia.org/wiki/Taipei) · [地标](https://en.wikipedia.org/wiki/Taipei_101) · [照片](https://commons.wikimedia.org/wiki/File:Taipei_101_from_Xiangshan_20260927_(cropped).jpg) | Sinsyuan · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 首尔 / Seoul | 韩国 | 南山首尔塔 | N  37.5600°    E  126.9900° | [城市](https://en.wikipedia.org/wiki/Seoul) · [地标](https://en.wikipedia.org/wiki/Namsan_Seoul_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Namsan_Tower_sunset,_Seoul.jpg) | Rtflakfizer · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 釜山 / Busan | 韩国 | 广安大桥 | N  35.1800°    E  129.0750° | [城市](https://en.wikipedia.org/wiki/Busan) · [地标](https://en.wikipedia.org/wiki/Gwangan_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Gwangan_Bridge1.jpg) | Glabb · [Public domain](https://commons.wikimedia.org/wiki/Commons:Public_domain) |
| 京都 / Kyoto | 日本 | 金阁寺 | N  35.0116°    E  135.7681° | [城市](https://en.wikipedia.org/wiki/Kyoto) · [地标](https://en.wikipedia.org/wiki/Kinkaku-ji) · [照片](https://commons.wikimedia.org/wiki/File:Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg) | Nacaru · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 大阪 / Osaka | 日本 | 大阪城 | N  34.6939°    E  135.5022° | [城市](https://en.wikipedia.org/wiki/Osaka) · [地标](https://en.wikipedia.org/wiki/Osaka_Castle) · [照片](https://commons.wikimedia.org/wiki/File:Osaka_Castle_03bs3200.jpg) | 663highland · [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) |
| 新加坡 / Singapore | 新加坡 | 滨海湾金沙 | N  1.2833°    E  103.8333° | [城市](https://en.wikipedia.org/wiki/Singapore) · [地标](https://en.wikipedia.org/wiki/Marina_Bay_Sands) · [照片](https://commons.wikimedia.org/wiki/File:Marina_Bay_Sands_(I).jpg) | Supanut Arunoprayote · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| 曼谷 / Bangkok | 泰国 | 郑王庙 | N  13.7525°    E  100.4942° | [城市](https://en.wikipedia.org/wiki/Bangkok) · [地标](https://en.wikipedia.org/wiki/Wat_Arun) · [照片](https://commons.wikimedia.org/wiki/File:%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%98%E0%B8%B2%E0%B8%99%E0%B8%97%E0%B8%A3%E0%B8%87%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%A7%E0%B8%B1%E0%B8%94%E0%B8%AD%E0%B8%A3%E0%B8%B8%E0%B8%932.jpg) | Mastertongapollo · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 清迈 / Chiang Mai | 泰国 | 契迪龙寺 | N  18.7953°    E  98.9986° | [城市](https://en.wikipedia.org/wiki/Chiang_Mai) · [地标](https://en.wikipedia.org/wiki/Wat_Chedi_Luang) · [照片](https://commons.wikimedia.org/wiki/File:%E0%B9%80%E0%B8%88%E0%B8%94%E0%B8%B5%E0%B8%A2%E0%B9%8C%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B8%87.jpg) | Kingkidton · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 河内 / Hanoi | 越南 | 还剑湖 | N  21.0000°    E  105.8500° | [城市](https://en.wikipedia.org/wiki/Hanoi) · [地标](https://en.wikipedia.org/wiki/Ho%C3%A0n_Ki%E1%BA%BFm_Lake) · [照片](https://commons.wikimedia.org/wiki/File:Thap_Rua.jpg) | Cyril Doussin from London, United Kingdom · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| 胡志明市 / Ho Chi Minh City | 越南 | 西贡圣母大教堂 | N  10.7756°    E  106.7019° | [城市](https://en.wikipedia.org/wiki/Ho_Chi_Minh_City) · [地标](https://en.wikipedia.org/wiki/Notre-Dame_Cathedral_Basilica_of_Saigon) · [照片](https://commons.wikimedia.org/wiki/File:Bas%C3%ADlica_de_Nuestra_Se%C3%B1ora,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_03.JPG) | Diego Delso · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 吉隆坡 / Kuala Lumpur | 马来西亚 | 双子塔 | N  3.1478°    E  101.6953° | [城市](https://en.wikipedia.org/wiki/Kuala_Lumpur) · [地标](https://en.wikipedia.org/wiki/Petronas_Towers) · [照片](https://commons.wikimedia.org/wiki/File:The_Twins_SE_Asia_2019_(49171985716)_(cropped)_2.jpg) | James Kerwin from Tbilisi · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 雅加达 / Jakarta | 印度尼西亚 | 国家纪念碑 | S  6.1800°    E  106.8300° | [城市](https://en.wikipedia.org/wiki/Jakarta) · [地标](https://en.wikipedia.org/wiki/National_Monument_%28Indonesia%29) · [照片](https://commons.wikimedia.org/wiki/File:Jakarta_Panorama.jpg) | Gunawan Kartapranata · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 日惹 / Yogyakarta | 印度尼西亚 | 水宫 | S  7.8014°    E  110.3644° | [城市](https://en.wikipedia.org/wiki/Yogyakarta) · [地标](https://en.wikipedia.org/wiki/Taman_Sari_%28Yogyakarta%29) · [照片](https://commons.wikimedia.org/wiki/File:Tower_in_Taman_Sari,_2014-05-19.jpg) | Crisco 1492 · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 马尼拉 / Manila | 菲律宾 | 圣奥古斯丁教堂 | N  14.5958°    E  120.9772° | [城市](https://en.wikipedia.org/wiki/Manila) · [地标](https://en.wikipedia.org/wiki/San_Agustin_Church_%28Manila%29) · [照片](https://commons.wikimedia.org/wiki/File:San_Agustin_Church,_Intramuros,_Manila_City.jpg) | Johngaje92 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 德里 / Delhi | 印度 | 印度门 | N  28.6100°    E  77.2300° | [城市](https://en.wikipedia.org/wiki/Delhi) · [地标](https://en.wikipedia.org/wiki/India_Gate) · [照片](https://commons.wikimedia.org/wiki/File:India_Gate_front.jpg) | AKS.9955 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 阿格拉 / Agra | 印度 | 泰姬陵 | N  27.1800°    E  78.0200° | [城市](https://en.wikipedia.org/wiki/Agra) · [地标](https://en.wikipedia.org/wiki/Taj_Mahal) · [照片](https://commons.wikimedia.org/wiki/File:Taj_Mahal_(Edited).jpeg) | Yann; edited by Jim Carter · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 斋浦尔 / Jaipur | 印度 | 风之宫 | N  26.9150°    E  75.8200° | [城市](https://en.wikipedia.org/wiki/Jaipur) · [地标](https://en.wikipedia.org/wiki/Hawa_Mahal) · [照片](https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg) | Chainwit. · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 孟买 / Mumbai | 印度 | 印度之门 | N  19.0761°    E  72.8775° | [城市](https://en.wikipedia.org/wiki/Mumbai) · [地标](https://en.wikipedia.org/wiki/Gateway_of_India) · [照片](https://commons.wikimedia.org/wiki/File:Gateway_of_India_Mumbai_india.jpg) | Ramkumar TD · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 加德满都 / Kathmandu | 尼泊尔 | 博达哈大佛塔 | N  27.7100°    E  85.3200° | [城市](https://en.wikipedia.org/wiki/Kathmandu) · [地标](https://en.wikipedia.org/wiki/Boudha_Stupa) · [照片](https://commons.wikimedia.org/wiki/File:Boudhanath_stupa_,_Kathmandu,_Nepal.jpg) | Sumitbhatt222 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 科伦坡 / Colombo | 斯里兰卡 | 莲花塔 | N  6.9344°    E  79.8428° | [城市](https://en.wikipedia.org/wiki/Colombo) · [地标](https://en.wikipedia.org/wiki/Lotus_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Blue_lotus_tower.jpg) | Mohamed Rilwan1210 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 伊斯兰堡 / Islamabad | 巴基斯坦 | 费萨尔清真寺 | N  33.6931°    E  73.0639° | [城市](https://en.wikipedia.org/wiki/Islamabad) · [地标](https://en.wikipedia.org/wiki/Faisal_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Ali_Mujtaba_WLM2017_FAISAL_MOSQUE_019.jpg) | Ali Mujtaba · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 廷布 / Thimphu | 不丹 | 扎西曲宗 | N  27.4722°    E  89.6361° | [城市](https://en.wikipedia.org/wiki/Thimphu) · [地标](https://en.wikipedia.org/wiki/Tashichho_Dzong) · [照片](https://commons.wikimedia.org/wiki/File:Tashichho_Dzong,_Bhutan_02.jpg) | Bernard Gagnon · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 迪拜 / Dubai | 阿拉伯联合酋长国 | 哈利法塔 | N  25.2047°    E  55.2708° | [城市](https://en.wikipedia.org/wiki/Dubai) · [地标](https://en.wikipedia.org/wiki/Burj_Khalifa) · [照片](https://commons.wikimedia.org/wiki/File:Burj_Khalifa_(worlds_tallest_building)_and_the_Dubai_skyline_(25781049892).jpg) | imran shahabuddin · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 阿布扎比 / Abu Dhabi | 阿拉伯联合酋长国 | 谢赫扎耶德大清真寺 | N  24.4667°    E  54.3667° | [城市](https://en.wikipedia.org/wiki/Abu_Dhabi) · [地标](https://en.wikipedia.org/wiki/Sheikh_Zayed_Grand_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Sheikh_Zayed_Mosque_Silhouette.jpg) | PotatoWitch · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 多哈 / Doha | 卡塔尔 | 伊斯兰艺术博物馆 | N  25.2867°    E  51.5333° | [城市](https://en.wikipedia.org/wiki/Doha) · [地标](https://en.wikipedia.org/wiki/Museum_of_Islamic_Art%2C_Doha) · [照片](https://commons.wikimedia.org/wiki/File:IslamicArtMuseumDohaSkyline.jpg) | Mohamod Fasil · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 马斯喀特 / Muscat | 阿曼 | 苏丹卡布斯大清真寺 | N  23.5889°    E  58.4083° | [城市](https://en.wikipedia.org/wiki/Muscat) · [地标](https://en.wikipedia.org/wiki/Sultan_Qaboos_Grand_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:%D9%88%D8%A7%D8%AC%D9%87%D8%A9_%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9.jpg) | Meshal humaid Ali Almoqbali · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 利雅得 / Riyadh | 沙特阿拉伯 | 王国中心 | N  24.6333°    E  46.7167° | [城市](https://en.wikipedia.org/wiki/Riyadh) · [地标](https://en.wikipedia.org/wiki/Kingdom_Centre) · [照片](https://commons.wikimedia.org/wiki/File:Kingdom_Centre_Riyadh_2024.jpeg) | Hamza A. Durrani · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 安曼 / Amman | 约旦 | 安曼城堡山 | N  31.9497°    E  35.9328° | [城市](https://en.wikipedia.org/wiki/Amman) · [地标](https://en.wikipedia.org/wiki/Amman_Citadel) · [照片](https://commons.wikimedia.org/wiki/File:Amman_Citadel.jpg) | David Bjorgen · [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) |
| 贝鲁特 / Beirut | 黎巴嫩 | 穆罕默德阿明清真寺 | N  33.8981°    E  35.5058° | [城市](https://en.wikipedia.org/wiki/Beirut) · [地标](https://en.wikipedia.org/wiki/Mohammad_Al-Amin_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Mohammad_Al-Amin_Mosque_during_2019_Lebanese_revolution.jpg) | NicolasGaron · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 巴库 / Baku | 阿塞拜疆 | 火焰塔 | N  40.3756°    E  49.8325° | [城市](https://en.wikipedia.org/wiki/Baku) · [地标](https://en.wikipedia.org/wiki/Flame_Towers) · [照片](https://commons.wikimedia.org/wiki/File:Flame_Towers.jpg) | Saidaa444 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 阿拉木图 / Almaty | 哈萨克斯坦 | 升天大教堂 | N  43.2333°    E  76.9500° | [城市](https://en.wikipedia.org/wiki/Almaty) · [地标](https://en.wikipedia.org/wiki/Ascension_Cathedral%2C_Almaty) · [照片](https://commons.wikimedia.org/wiki/File:Zenkov_cathedral.jpg) | Petar Milošević · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 塔什干 / Tashkent | 乌兹别克斯坦 | 楚苏巴扎 | N  41.3111°    E  69.2797° | [城市](https://en.wikipedia.org/wiki/Tashkent) · [地标](https://en.wikipedia.org/wiki/Chorsu_Bazaar) · [照片](https://commons.wikimedia.org/wiki/File:Chorsu_Market_general_view.jpg) | Theklan · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

### 欧洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 巴黎 / Paris | 法国 | 埃菲尔铁塔 | N  48.8567°    E  2.3522° | [城市](https://en.wikipedia.org/wiki/Paris) · [地标](https://en.wikipedia.org/wiki/Eiffel_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons_(cropped).jpg) | Benh LIEU SONG · [Public domain](https://commons.wikimedia.org/wiki/Commons:Public_domain) |
| 伦敦 / London | 英国 | 伦敦塔桥 | N  51.5072°    W  0.1275° | [城市](https://en.wikipedia.org/wiki/London) · [地标](https://en.wikipedia.org/wiki/Tower_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg) | Fuzzypiggy · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 罗马 / Rome | 意大利 | 斗兽场 | N  41.8933°    E  12.4828° | [城市](https://en.wikipedia.org/wiki/Rome) · [地标](https://en.wikipedia.org/wiki/Colosseum) · [照片](https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg) | FeaturedPics · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 威尼斯 / Venice | 意大利 | 里亚托桥 | N  45.4375°    E  12.3358° | [城市](https://en.wikipedia.org/wiki/Venice) · [地标](https://en.wikipedia.org/wiki/Rialto_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Rialto_2025_4.jpg) | kallerna · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 佛罗伦萨 / Florence | 意大利 | 圣母百花大教堂 | N  43.7714°    E  11.2542° | [城市](https://en.wikipedia.org/wiki/Florence) · [地标](https://en.wikipedia.org/wiki/Florence_Cathedral) · [照片](https://commons.wikimedia.org/wiki/File:Cattedrale_di_Santa_Maria_del_Fiore_%E2%80%93_Il_Duomo_di_Firenze.jpg) | Gary Campbell-Hall · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 米兰 / Milan | 意大利 | 米兰大教堂 | N  45.4669°    E  9.1900° | [城市](https://en.wikipedia.org/wiki/Milan) · [地标](https://en.wikipedia.org/wiki/Milan_Cathedral) · [照片](https://commons.wikimedia.org/wiki/File:Milan_Cathedral_from_Piazza_del_Duomo.jpg) | Jiuguang Wang · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 巴塞罗那 / Barcelona | 西班牙 | 圣家堂 | N  41.3833°    E  2.1833° | [城市](https://en.wikipedia.org/wiki/Barcelona) · [地标](https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia) · [照片](https://commons.wikimedia.org/wiki/File:SF_maig_2_cropped.jpg) | Canaan · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 马德里 / Madrid | 西班牙 | 西贝莱斯宫 | N  40.4169°    W  3.7033° | [城市](https://en.wikipedia.org/wiki/Madrid) · [地标](https://en.wikipedia.org/wiki/Palacio_de_Cibeles) · [照片](https://commons.wikimedia.org/wiki/File:Palacio_de_Comunicaciones_-_47.jpg) | Carlos Delgado · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 里斯本 / Lisbon | 葡萄牙 | 贝伦塔 | N  38.7253°    W  9.1500° | [城市](https://en.wikipedia.org/wiki/Lisbon) · [地标](https://en.wikipedia.org/wiki/Bel%C3%A9m_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Torre_Bel%C3%A9m_April_2009-4a.jpg) | Alvesgaspar · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 波尔图 / Porto | 葡萄牙 | 路易一世大桥 | N  41.1500°    W  8.6108° | [城市](https://en.wikipedia.org/wiki/Porto) · [地标](https://en.wikipedia.org/wiki/Dom_Lu%C3%ADs_I_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Dom_Lu%C3%ADs_I_Bridge_(36961760686).jpg) | Deensel · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 阿姆斯特丹 / Amsterdam | 荷兰 | 阿姆斯特丹运河 | N  52.3728°    E  4.8936° | [城市](https://en.wikipedia.org/wiki/Amsterdam) · [地标](https://en.wikipedia.org/wiki/Canals_of_Amsterdam) · [照片](https://commons.wikimedia.org/wiki/File:Imagen_de_los_canales_conc%C3%A9ntricos_en_%C3%81msterdam.png) | Andrés Barrios · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 柏林 / Berlin | 德国 | 勃兰登堡门 | N  52.5200°    E  13.4050° | [城市](https://en.wikipedia.org/wiki/Berlin) · [地标](https://en.wikipedia.org/wiki/Brandenburg_Gate) · [照片](https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_abends.jpg) | Thomas Wolf, www.foto-tw.de · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 慕尼黑 / Munich | 德国 | 新市政厅 | N  48.1375°    E  11.5750° | [城市](https://en.wikipedia.org/wiki/Munich) · [地标](https://en.wikipedia.org/wiki/New_Town_Hall_%28Munich%29) · [照片](https://commons.wikimedia.org/wiki/File:Neues_Rathaus_M%C3%BCnchen_2018.jpg) | Steffen Flor · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 布拉格 / Prague | 捷克 | 查理大桥 | N  50.0875°    E  14.4214° | [城市](https://en.wikipedia.org/wiki/Prague) · [地标](https://en.wikipedia.org/wiki/Charles_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Praha,_Karl%C5%AFv_most_DSC06743.JPG) | Aw58 · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 维也纳 / Vienna | 奥地利 | 圣斯蒂芬大教堂 | N  48.2083°    E  16.3725° | [城市](https://en.wikipedia.org/wiki/Vienna) · [地标](https://en.wikipedia.org/wiki/St._Stephen%27s_Cathedral%2C_Vienna) · [照片](https://commons.wikimedia.org/wiki/File:Wien_-_Stephansdom_(1).JPG) | C.Stadler/Bwag · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 布达佩斯 / Budapest | 匈牙利 | 匈牙利国会大厦 | N  47.4925°    E  19.0514° | [城市](https://en.wikipedia.org/wiki/Budapest) · [地标](https://en.wikipedia.org/wiki/Hungarian_Parliament_Building) · [照片](https://commons.wikimedia.org/wiki/File:Hungarian_Parliament_Building_from_across_the_Danube,_2025-01-11.jpg) | Kilyann Le Hen · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| 雅典 / Athens | 希腊 | 帕特农神庙 | N  37.9842°    E  23.7281° | [城市](https://en.wikipedia.org/wiki/Athens) · [地标](https://en.wikipedia.org/wiki/Parthenon) · [照片](https://commons.wikimedia.org/wiki/File:The_Parthenon_in_Athens.jpg) | Steve Swayne · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 伊斯坦布尔 / Istanbul | 土耳其 | 圣索菲亚 | N  41.0136°    E  28.9550° | [城市](https://en.wikipedia.org/wiki/Istanbul) · [地标](https://en.wikipedia.org/wiki/Hagia_Sophia) · [照片](https://commons.wikimedia.org/wiki/File:Hagia_Sophia_(228968325).jpeg) | Adli Wahid · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 哥本哈根 / Copenhagen | 丹麦 | 新港 | N  55.6761°    E  12.5683° | [城市](https://en.wikipedia.org/wiki/Copenhagen) · [地标](https://en.wikipedia.org/wiki/Nyhavn) · [照片](https://commons.wikimedia.org/wiki/File:The_Nyhavn_Canal_3.jpg) | European Commission · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| 斯德哥尔摩 / Stockholm | 瑞典 | 斯德哥尔摩市政厅 | N  59.3294°    E  18.0686° | [城市](https://en.wikipedia.org/wiki/Stockholm) · [地标](https://en.wikipedia.org/wiki/Stockholm_City_Hall) · [照片](https://commons.wikimedia.org/wiki/File:Stockholms_Stadshuset_City_Hall_Stockholm_2016_01.jpg) | Julian Herzog (Website) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| 奥斯陆 / Oslo | 挪威 | 奥斯陆歌剧院 | N  59.9133°    E  10.7389° | [城市](https://en.wikipedia.org/wiki/Oslo) · [地标](https://en.wikipedia.org/wiki/Oslo_Opera_House) · [照片](https://commons.wikimedia.org/wiki/File:Oslo_Opera_House_-_2025.jpg) | Pierre Blaché · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 赫尔辛基 / Helsinki | 芬兰 | 赫尔辛基大教堂 | N  60.1708°    E  24.9375° | [城市](https://en.wikipedia.org/wiki/Helsinki) · [地标](https://en.wikipedia.org/wiki/Helsinki_Cathedral) · [照片](https://commons.wikimedia.org/wiki/File:Kirkko3.png) | Manster323 · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 雷克雅未克 / Reykjavík | 冰岛 | 哈尔格林姆教堂 | N  64.1458°    W  21.9425° | [城市](https://en.wikipedia.org/wiki/Reykjav%C3%ADk) · [地标](https://en.wikipedia.org/wiki/Hallgr%C3%ADmskirkja) · [照片](https://commons.wikimedia.org/wiki/File:Hallgrimskirkja_mai_2026.jpg) | Steinninn · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| 都柏林 / Dublin | 爱尔兰 | 半便士桥 | N  53.3500°    W  6.2603° | [城市](https://en.wikipedia.org/wiki/Dublin) · [地标](https://en.wikipedia.org/wiki/Ha%27penny_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:HalfPennyBridge.jpg) | See original file description · [Public domain](https://commons.wikimedia.org/wiki/Commons:Public_domain) |
| 爱丁堡 / Edinburgh | 英国 | 爱丁堡城堡 | N  55.9533°    W  3.1892° | [城市](https://en.wikipedia.org/wiki/Edinburgh) · [地标](https://en.wikipedia.org/wiki/Edinburgh_Castle) · [照片](https://commons.wikimedia.org/wiki/File:City_of_Edinburgh_-_Edinburgh_Castle_-_20140421004403.jpg) | Enric · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 苏黎世 / Zürich | 瑞士 | 苏黎世大教堂 | N  47.3744°    E  8.5411° | [城市](https://en.wikipedia.org/wiki/Zurich) · [地标](https://en.wikipedia.org/wiki/Grossm%C3%BCnster) · [照片](https://commons.wikimedia.org/wiki/File:Grossm%C3%BCnster_-_M%C3%BCnsterhof_2014-05-23_12-08-43.JPG) | Roland zh · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 卢塞恩 / Lucerne | 瑞士 | 卡佩尔桥 | N  47.0500°    E  8.3000° | [城市](https://en.wikipedia.org/wiki/Lucerne) · [地标](https://en.wikipedia.org/wiki/Kapellbr%C3%BCcke) · [照片](https://commons.wikimedia.org/wiki/File:Kapellbruecke.JPG) | Simon Koopmann · [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) |
| 华沙 / Warsaw | 波兰 | 文化科学宫 | N  52.2300°    E  21.0111° | [城市](https://en.wikipedia.org/wiki/Warsaw) · [地标](https://en.wikipedia.org/wiki/Palace_of_Culture_and_Science) · [照片](https://commons.wikimedia.org/wiki/File:Pa%C5%82ac_Kultury_i_Nauki_2019.jpg) | Adrian Grycuk · [CC BY-SA 3.0 pl](https://creativecommons.org/licenses/by-sa/3.0/pl/deed.en) |
| 克拉科夫 / Kraków | 波兰 | 瓦维尔城堡 | N  50.0614°    E  19.9372° | [城市](https://en.wikipedia.org/wiki/Krak%C3%B3w) · [地标](https://en.wikipedia.org/wiki/Wawel_Castle) · [照片](https://commons.wikimedia.org/wiki/File:Wawel_(4).jpg) | Monika Towiańska · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 塔林 / Tallinn | 爱沙尼亚 | 亚历山大涅夫斯基大教堂 | N  59.4372°    E  24.7453° | [城市](https://en.wikipedia.org/wiki/Tallinn) · [地标](https://en.wikipedia.org/wiki/Alexander_Nevsky_Cathedral%2C_Tallinn) · [照片](https://commons.wikimedia.org/wiki/File:Catedral_de_Alejandro_Nevsky,_Tallin,_Estonia,_2012-08-11,_DD_46.JPG) | Diego Delso · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |

### 非洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 开罗 / Cairo | 埃及 | 穆罕默德阿里清真寺 | N  30.0444°    E  31.2358° | [城市](https://en.wikipedia.org/wiki/Cairo) · [地标](https://en.wikipedia.org/wiki/Muhammad_Ali_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:%D8%AC%D8%A7%D9%85%D8%B9_%D9%85%D8%AD%D9%85%D8%AF_%D8%B9%D9%84%D9%8A.JPG) | Ahmed Ragheb 97 · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 亚历山大 / Alexandria | 埃及 | 凯特贝城堡 | N  31.1975°    E  29.8925° | [城市](https://en.wikipedia.org/wiki/Alexandria) · [地标](https://en.wikipedia.org/wiki/Citadel_of_Qaitbay) · [照片](https://commons.wikimedia.org/wiki/File:%D9%82%D9%84%D8%B9%D8%A9_%D9%82%D8%A7%D9%8A%D8%AA%D8%A8%D8%A7%D9%8A_%D9%85%D9%86_%D8%A7%D9%84%D8%AC%D9%88.jpg) | Hmkree · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 马拉喀什 / Marrakesh | 摩洛哥 | 库图比亚清真寺 | N  31.6300°    W  8.0089° | [城市](https://en.wikipedia.org/wiki/Marrakesh) · [地标](https://en.wikipedia.org/wiki/Kutubiyya_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Marokko0112_(retouched).jpg) | Rol1000 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 卡萨布兰卡 / Casablanca | 摩洛哥 | 哈桑二世清真寺 | N  33.5333°    W  7.5833° | [城市](https://en.wikipedia.org/wiki/Casablanca) · [地标](https://en.wikipedia.org/wiki/Hassan_II_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Maroc,_Mosqu%C3%A9e_Hassan_2,_Grand_Casablanca_2.jpg) | Walaadari · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 突尼斯 / Tunis | 突尼斯 | 宰图纳清真寺 | N  36.8064°    E  10.1817° | [城市](https://en.wikipedia.org/wiki/Tunis) · [地标](https://en.wikipedia.org/wiki/Al-Zaytuna_Mosque) · [照片](https://commons.wikimedia.org/wiki/File:Minaret_et_patio_de_la_mosqu%C3%A9e_Zitouna_au_centre_de_la_M%C3%A9dina_de_Tunis.jpg) | T A · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| 阿尔及尔 / Algiers | 阿尔及利亚 | 烈士纪念碑 | N  36.7325°    E  3.0872° | [城市](https://en.wikipedia.org/wiki/Algiers) · [地标](https://en.wikipedia.org/wiki/Maqam_Echahid) · [照片](https://commons.wikimedia.org/wiki/File:Martyrs_Memorial._Algiers,_Algeria.jpg) | Boumediene15 · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 开普敦 / Cape Town | 南非 | 桌山 | S  33.9253°    E  18.4239° | [城市](https://en.wikipedia.org/wiki/Cape_Town) · [地标](https://en.wikipedia.org/wiki/Table_Mountain) · [照片](https://commons.wikimedia.org/wiki/File:Table_Mountain_DanieVDM.jpg) | Danie van der Merwe from Cape Town, South Africa · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 约翰内斯堡 / Johannesburg | 南非 | 希尔布罗塔 | S  26.2044°    E  28.0456° | [城市](https://en.wikipedia.org/wiki/Johannesburg) · [地标](https://en.wikipedia.org/wiki/Hillbrow_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Hillbrow_Tower-1.jpg) | Thuvack · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 内罗毕 / Nairobi | 肯尼亚 | 肯雅塔国际会议中心 | S  1.2864°    E  36.8172° | [城市](https://en.wikipedia.org/wiki/Nairobi) · [地标](https://en.wikipedia.org/wiki/Kenyatta_International_Convention_Centre) · [照片](https://commons.wikimedia.org/wiki/File:KICC_nairobi_kenya.jpg) | Original uploader was Mkimemia at en.wikipedia · [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) |
| 蒙巴萨 / Mombasa | 肯尼亚 | 耶稣堡 | S  4.0500°    E  39.6667° | [城市](https://en.wikipedia.org/wiki/Mombasa) · [地标](https://en.wikipedia.org/wiki/Fort_Jesus) · [照片](https://commons.wikimedia.org/wiki/File:Fort_Jesus_at_the_Mombasa_Island.jpg) | Maingi030 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 亚的斯亚贝巴 / Addis Ababa | 埃塞俄比亚 | 圣三一大教堂 | N  9.0358°    E  38.7525° | [城市](https://en.wikipedia.org/wiki/Addis_Ababa) · [地标](https://en.wikipedia.org/wiki/Holy_Trinity_Cathedral%2C_Addis_Ababa) · [照片](https://commons.wikimedia.org/wiki/File:Addis_Ababa_Ethiopia_2.jpg) | Gize12 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 达喀尔 / Dakar | 塞内加尔 | 非洲复兴纪念碑 | N  14.6928°    W  17.4467° | [城市](https://en.wikipedia.org/wiki/Dakar) · [地标](https://en.wikipedia.org/wiki/African_Renaissance_Monument) · [照片](https://commons.wikimedia.org/wiki/File:African_Renaissance_Monument_Dakar_2025.jpg) | Gromane · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 阿克拉 / Accra | 加纳 | 黑星门 | N  5.5500°    W  0.2000° | [城市](https://en.wikipedia.org/wiki/Accra) · [地标](https://en.wikipedia.org/wiki/Black_Star_Gate) · [照片](https://commons.wikimedia.org/wiki/File:Independence_Arch_-_Accra,_Ghana1.jpg) | George Appiah · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 拉各斯 / Lagos | 尼日利亚 | 莱基伊科伊大桥 | N  6.4561°    E  3.3936° | [城市](https://en.wikipedia.org/wiki/Lagos) · [地标](https://en.wikipedia.org/wiki/Lekki-Ikoyi_Link_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Lekki-link-bridge--full-view2.jpg) | S.aderogba · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 基加利 / Kigali | 卢旺达 | 基加利会议中心 | S  1.9525°    E  30.1150° | [城市](https://en.wikipedia.org/wiki/Kigali) · [地标](https://en.wikipedia.org/wiki/Kigali_Convention_Centre) · [照片](https://commons.wikimedia.org/wiki/File:An_aerial_of_Kigali_Convention_Center_on_June_19,_2019._Photo_by_Emmanuel_Kwizera.jpg) | Emmanuelkwizera · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 塔那那利佛 / Antananarivo | 马达加斯加 | 安塔那那利佛王宫 | S  18.9100°    E  47.5250° | [城市](https://en.wikipedia.org/wiki/Antananarivo) · [地标](https://en.wikipedia.org/wiki/Rova_of_Antananarivo) · [照片](https://commons.wikimedia.org/wiki/File:Reconstructed_Rova_Antananarivo_Madagascar.jpg) | Hery Zo Rakotondramanana · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |

### 北美洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 纽约 / New York | 美国 | 自由女神像 | N  40.7128°    W  74.0061° | [城市](https://en.wikipedia.org/wiki/New_York_City) · [地标](https://en.wikipedia.org/wiki/Statue_of_Liberty) · [照片](https://commons.wikimedia.org/wiki/File:Front_view_of_Statue_of_Liberty_(cropped).jpg) | AskALotl · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 旧金山 / San Francisco | 美国 | 金门大桥 | N  37.7775°    W  122.4164° | [城市](https://en.wikipedia.org/wiki/San_Francisco) · [地标](https://en.wikipedia.org/wiki/Golden_Gate_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:Golden_Gate_Bridge_as_seen_from_Battery_East.jpg) | Frank Schulenburg · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 洛杉矶 / Los Angeles | 美国 | 格里菲斯天文台 | N  34.0500°    W  118.2500° | [城市](https://en.wikipedia.org/wiki/Los_Angeles) · [地标](https://en.wikipedia.org/wiki/Griffith_Observatory) · [照片](https://commons.wikimedia.org/wiki/File:Griffith_observatory_2006.jpg) | Matthew Field · [CC BY 2.5](https://creativecommons.org/licenses/by/2.5) |
| 芝加哥 / Chicago | 美国 | 威利斯大厦与城市天际线 | N  41.8819°    W  87.6278° | [城市](https://en.wikipedia.org/wiki/Chicago) · [地标](https://en.wikipedia.org/wiki/Willis_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Chicago_From_the_Hancock_Tower_at_Sunset.jpg) | Space-Age Meat · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 华盛顿 / Washington, D.C. | 美国 | 美国国会大厦 | N  38.9047°    W  77.0164° | [城市](https://en.wikipedia.org/wiki/Washington%2C_D.C.) · [地标](https://en.wikipedia.org/wiki/United_States_Capitol) · [照片](https://commons.wikimedia.org/wiki/File:US_Capitol_east_side.JPG) | Martin Falbisoner · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 波士顿 / Boston | 美国 | 海关大楼钟塔 | N  42.3603°    W  71.0578° | [城市](https://en.wikipedia.org/wiki/Boston) · [地标](https://en.wikipedia.org/wiki/Boston_Custom_House_Tower) · [照片](https://commons.wikimedia.org/wiki/File:Custom_House_Tower.jpg) | Dismas · [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) |
| 西雅图 / Seattle | 美国 | 太空针塔 | N  47.6039°    W  122.3300° | [城市](https://en.wikipedia.org/wiki/Seattle) · [地标](https://en.wikipedia.org/wiki/Space_Needle) · [照片](https://commons.wikimedia.org/wiki/File:Space_Needle_2011-07-04.jpg) | Jordon Kalilich · [Public domain](https://commons.wikimedia.org/wiki/Commons:Public_domain) |
| 迈阿密 / Miami | 美国 | 海湾市场 | N  25.7742°    W  80.1936° | [城市](https://en.wikipedia.org/wiki/Miami) · [地标](https://en.wikipedia.org/wiki/Bayside_Marketplace) · [照片](https://commons.wikimedia.org/wiki/File:Bayside,_Miami,_Florida_June_2021_-_03.jpg) | Sharon Hahn Darlin · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 拉斯维加斯 / Las Vegas | 美国 | 欢迎来到拉斯维加斯 | N  36.1692°    W  115.1406° | [城市](https://en.wikipedia.org/wiki/Las_Vegas) · [地标](https://en.wikipedia.org/wiki/Welcome_to_Fabulous_Las_Vegas_sign) · [照片](https://commons.wikimedia.org/wiki/File:Welcome_to_Fabulous_Las_Vegas.jpg) | Thomas Wolf, www.foto-tw.de · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 温哥华 / Vancouver | 加拿大 | 加拿大广场 | N  49.2608°    W  123.1139° | [城市](https://en.wikipedia.org/wiki/Vancouver) · [地标](https://en.wikipedia.org/wiki/Canada_Place) · [照片](https://commons.wikimedia.org/wiki/File:Canada_Place_Landing.jpg) | Nicolas Untz · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| 多伦多 / Toronto | 加拿大 | 加拿大国家电视塔 | N  43.6525°    W  79.3817° | [城市](https://en.wikipedia.org/wiki/Toronto) · [地标](https://en.wikipedia.org/wiki/CN_Tower) · [照片](https://commons.wikimedia.org/wiki/File:CN_Tower_at_Toronto_04.jpg) | Fabian Roudra Baroi · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 魁北克城 / Québec City | 加拿大 | 芳堤娜城堡 | N  46.8139°    W  71.2081° | [城市](https://en.wikipedia.org/wiki/Quebec_City) · [地标](https://en.wikipedia.org/wiki/Ch%C3%A2teau_Frontenac) · [照片](https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_Frontenac_02.jpg) | Bernard Gagnon · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 墨西哥城 / Mexico City | 墨西哥 | 艺术宫 | N  19.4333°    W  99.1333° | [城市](https://en.wikipedia.org/wiki/Mexico_City) · [地标](https://en.wikipedia.org/wiki/Palacio_de_Bellas_Artes) · [照片](https://commons.wikimedia.org/wiki/File:Bellas_Artes_01.jpg) | Xavier Quetzalcoatl Contreras Castillo · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 哈瓦那 / Havana | 古巴 | 哈瓦那国会大厦 | N  23.1367°    W  82.3589° | [城市](https://en.wikipedia.org/wiki/Havana) · [地标](https://en.wikipedia.org/wiki/National_Capitol_of_Cuba) · [照片](https://commons.wikimedia.org/wiki/File:El_Capitolio_Havana_Cuba.jpg) | Nigel Pacquette · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 巴拿马城 / Panama City | 巴拿马 | 生物多样性博物馆 | N  8.9711°    W  79.5347° | [城市](https://en.wikipedia.org/wiki/Panama_City) · [地标](https://en.wikipedia.org/wiki/Biomuseo) · [照片](https://commons.wikimedia.org/wiki/File:Biomuseo_rear_stereo_pair_R.agr_(cropped).jpg) | user:ArnoldReinhold · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 圣何塞 / San José | 哥斯达黎加 | 哥斯达黎加国家剧院 | N  9.9325°    W  84.0800° | [城市](https://en.wikipedia.org/wiki/San_Jos%C3%A9%2C_Costa_Rica) · [地标](https://en.wikipedia.org/wiki/National_Theatre_of_Costa_Rica) · [照片](https://commons.wikimedia.org/wiki/File:Costa_Rica-Teatro_Nacional.JPG) | Andres Alvarez · [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) |

### 南美洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 里约热内卢 / Rio de Janeiro | 巴西 | 基督像 | S  22.9111°    W  43.2056° | [城市](https://en.wikipedia.org/wiki/Rio_de_Janeiro) · [地标](https://en.wikipedia.org/wiki/Christ_the_Redeemer_%28statue%29) · [照片](https://commons.wikimedia.org/wiki/File:Christ_the_Redeemer_-_Cristo_Redentor.jpg) | Arne Müseler · [CC BY-SA 3.0 de](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en) |
| 布宜诺斯艾利斯 / Buenos Aires | 阿根廷 | 布宜诺斯艾利斯方尖碑 | S  34.6039°    W  58.3814° | [城市](https://en.wikipedia.org/wiki/Buenos_Aires) · [地标](https://en.wikipedia.org/wiki/Obelisco_de_Buenos_Aires) · [照片](https://commons.wikimedia.org/wiki/File:Buenos_Aires_(20234294752).jpg) | Rodrigo Paredes from Ciudad Autónoma de Buenos Aires, Argentina · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 圣保罗 / São Paulo | 巴西 | 圣保罗大教堂 | S  23.5500°    W  46.6333° | [城市](https://en.wikipedia.org/wiki/S%C3%A3o_Paulo) · [地标](https://en.wikipedia.org/wiki/S%C3%A3o_Paulo_Cathedral) · [照片](https://commons.wikimedia.org/wiki/File:Catedral_da_S%C3%A9_em_S%C3%A3o_Paulo.jpg) | Wilfredor · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 巴西利亚 / Brasília | 巴西 | 巴西利亚大教堂 | S  15.7939°    W  47.8828° | [城市](https://en.wikipedia.org/wiki/Bras%C3%ADlia) · [地标](https://en.wikipedia.org/wiki/Cathedral_of_Bras%C3%ADlia) · [照片](https://commons.wikimedia.org/wiki/File:Catedral_Metropolitana_de_Brasilia.jpg) | Tissiana de A. de Souza · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 萨尔瓦多 / Salvador | 巴西 | 拉塞尔达升降机 | S  12.9747°    W  38.4767° | [城市](https://en.wikipedia.org/wiki/Salvador%2C_Bahia) · [地标](https://en.wikipedia.org/wiki/Elevador_Lacerda) · [照片](https://commons.wikimedia.org/wiki/File:Elevador_Lacerda_7610.jpg) | Paul R. Burley · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 利马 / Lima | 秘鲁 | 利马主教座堂 | S  12.0600°    W  77.0375° | [城市](https://en.wikipedia.org/wiki/Lima) · [地标](https://en.wikipedia.org/wiki/Metropolitan_Cathedral_of_Lima) · [照片](https://commons.wikimedia.org/wiki/File:Catedral_de_Limaa1.jpg) | Gatodemichi · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 库斯科 / Cusco | 秘鲁 | 库斯科大教堂 | S  13.5169°    W  71.9786° | [城市](https://en.wikipedia.org/wiki/Cusco) · [地标](https://en.wikipedia.org/wiki/Cusco_Cathedral) · [照片](https://commons.wikimedia.org/wiki/File:Catedral_de_la_ciudad_del_Cusco.jpg) | PoolPs · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 圣地亚哥 / Santiago | 智利 | 圣地亚哥大塔 | S  33.4375°    W  70.6500° | [城市](https://en.wikipedia.org/wiki/Santiago) · [地标](https://en.wikipedia.org/wiki/Gran_Torre_Costanera) · [照片](https://commons.wikimedia.org/wiki/File:Costanera_Center_at_evening_(cropped).jpg) | javier · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| 瓦尔帕莱索 / Valparaíso | 智利 | 瓦尔帕莱索历史城区 | S  33.0461°    W  71.6197° | [城市](https://en.wikipedia.org/wiki/Valpara%C3%ADso) · [地标](https://whc.unesco.org/en/list/959/) · [照片](https://commons.wikimedia.org/wiki/File:Historic_Quarter_of_the_Seaport_City_of_Valpara%C3%ADso_04.jpg) | Julia Sumangil · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 波哥大 / Bogotá | 哥伦比亚 | 蒙塞拉特山 | N  4.7111°    W  74.0722° | [城市](https://en.wikipedia.org/wiki/Bogot%C3%A1) · [地标](https://en.wikipedia.org/wiki/Monserrate) · [照片](https://commons.wikimedia.org/wiki/File:2017_Bogot%C3%A1_Bas%C3%ADlica_del_Se%C3%B1or_Ca%C3%ADdo_de_Monserrate.jpg) | Felipe Restrepo Acosta · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 卡塔赫纳 / Cartagena | 哥伦比亚 | 圣费利佩城堡 | N  10.4000°    W  75.5000° | [城市](https://en.wikipedia.org/wiki/Cartagena%2C_Colombia) · [地标](https://en.wikipedia.org/wiki/Castillo_San_Felipe_de_Barajas) · [照片](https://commons.wikimedia.org/wiki/File:62_-_Carthag%C3%A8ne_-_D%C3%A9cembre_2008.jpg) | Martin St-Amant (S23678) · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 基多 / Quito | 厄瓜多尔 | 国家誓言圣殿 | S  0.2200°    W  78.5125° | [城市](https://en.wikipedia.org/wiki/Quito) · [地标](https://en.wikipedia.org/wiki/Bas%C3%ADlica_del_Voto_Nacional) · [照片](https://commons.wikimedia.org/wiki/File:El_Voto_Nacional_._Quito,_Ecuador.JPG) | Samuelistok · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 蒙得维的亚 / Montevideo | 乌拉圭 | 萨尔沃宫 | S  34.9056°    W  56.1842° | [城市](https://en.wikipedia.org/wiki/Montevideo) · [地标](https://en.wikipedia.org/wiki/Palacio_Salvo) · [照片](https://commons.wikimedia.org/wiki/File:Palaciosalvouruguay.jpg) | Coolcaesar · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 拉巴斯 / La Paz | 玻利维亚 | 圣弗朗西斯科教堂 | S  16.4958°    W  68.1333° | [城市](https://en.wikipedia.org/wiki/La_Paz) · [地标](https://en.wikipedia.org/wiki/Basilica_of_San_Francisco%2C_La_Paz) · [照片](https://commons.wikimedia.org/wiki/File:Bas%C3%ADlica_Menor_Nuestra_Se%C3%B1ora_de_los_%C3%81ngeles_(San_Francisco).jpg) | Parallelepiped09 · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

### 大洋洲

| 城市 | 国家／地区 | 地标／景观 | 城市坐标 | 资料与照片 | 作者／许可 |
| --- | --- | --- | --- | --- | --- |
| 悉尼 / Sydney | 澳大利亚 | 悉尼歌剧院 | S  33.8678°    E  151.2100° | [城市](https://en.wikipedia.org/wiki/Sydney) · [地标](https://en.wikipedia.org/wiki/Sydney_Opera_House) · [照片](https://commons.wikimedia.org/wiki/File:Sydney_Australia._(21339175489).jpg) | Bernard Spragg. NZ from Christchurch, New Zealand · [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| 墨尔本 / Melbourne | 澳大利亚 | 弗林德斯街车站 | S  37.8142°    E  144.9631° | [城市](https://en.wikipedia.org/wiki/Melbourne) · [地标](https://en.wikipedia.org/wiki/Flinders_Street_railway_station) · [照片](https://commons.wikimedia.org/wiki/File:Flinders_Station_and_trams.jpg) | Created by Philip Mallis in 2021; cropped by HappyWaldo · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 布里斯班 / Brisbane | 澳大利亚 | 故事桥 | S  27.4678°    E  153.0281° | [城市](https://en.wikipedia.org/wiki/Brisbane) · [地标](https://en.wikipedia.org/wiki/Story_Bridge) · [照片](https://commons.wikimedia.org/wiki/File:BNE-StoryBridge-fromCityCat.jpg) | MagpieShooter · [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) |
| 珀斯 / Perth | 澳大利亚 | 伊丽莎白码头 | S  32.0000°    E  115.9000° | [城市](https://en.wikipedia.org/wiki/Perth) · [地标](https://en.wikipedia.org/wiki/Elizabeth_Quay) · [照片](https://commons.wikimedia.org/wiki/File:Elizabeth_Quay_June_2018_b.jpg) | File:Elizabeth Quay June 2018.jpg: Nick-D derivative work: Georgfotoart · [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| 奥克兰 / Auckland | 新西兰 | 天空塔 | S  36.8492°    E  174.7653° | [城市](https://en.wikipedia.org/wiki/Auckland) · [地标](https://en.wikipedia.org/wiki/Sky_Tower_%28Auckland%29) · [照片](https://commons.wikimedia.org/wiki/File:01_Auckland_New_Zealand-1000137.jpg) | QFSE Media · [CC BY-SA 3.0 nz](https://creativecommons.org/licenses/by-sa/3.0/nz/deed.en) |
| 惠灵顿 / Wellington | 新西兰 | 惠灵顿缆车 | S  41.2889°    E  174.7772° | [城市](https://en.wikipedia.org/wiki/Wellington) · [地标](https://en.wikipedia.org/wiki/Wellington_Cable_Car) · [照片](https://commons.wikimedia.org/wiki/File:Wellington_Cable_Car_(20240206a)_(53532605708).jpg) | Takeshi Aida from Hong Kong, Hong Kong · [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| 苏瓦 / Suva | 斐济 | 苏瓦海港 | S  18.1416°    E  178.4419° | [城市](https://en.wikipedia.org/wiki/Suva) · [地标](https://en.wikipedia.org/wiki/Suva) · [照片](https://commons.wikimedia.org/wiki/File:Suva,_Fiji_77.jpg) | Maksym Kozlenko · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| 莫尔兹比港 / Port Moresby | 巴布亚新几内亚 | 莫尔兹比港城市景观 | S  9.4789°    E  147.1494° | [城市](https://en.wikipedia.org/wiki/Port_Moresby) · [地标](https://en.wikipedia.org/wiki/Port_Moresby) · [照片](https://commons.wikimedia.org/wiki/File:Port_Moresby_Town2_Mschlauch.jpg) | MSchlauch · [Public domain](https://commons.wikimedia.org/wiki/Commons:Public_domain) |

## 最终验收结果

原型已完成 120 张照片解码、搜索、洲别筛选、漫游、拖动遮板与多视口检查。公开版本会单独检查构建产物、照片哈希、程序环境音以及正式域名上的交互；生产验证记录见 [部署验收](../../docs/deployment.md)。
