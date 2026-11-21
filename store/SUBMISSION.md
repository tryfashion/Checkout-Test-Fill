# Chrome 网上应用店提交准备 v1.2.11

## 当前状态

- 上传文件：`release/checkout-test-autofill-store-v1.2.11.zip`。这是只含运行文件的 ZIP，JavaScript 已最小化、未混淆。`release/checkout-test-autofill-offline-v1.2.11.zip` 与它逐字节相同，供线下解压测试；不要上传旧版线下混淆包或 `.crx`。
- 插件商店名称暂用当前名称。发布者名称和正式插件名称待确定，正式提交前统一核对 `manifest.json`、`_locales` 和商店详情。
- 国家和州为普通文本输入框的 checkout 已在 v1.2.1 中适配。此前已打开的 checkout 页面在插件更新后须刷新。
- v1.2.2 增加英文、简体中文、繁体中文的自动识别和弹窗内手动切换。
- v1.2.3 将图标改为结账小票加确认勾选。
- v1.2.4 起商店和线下包统一使用最小化代码及相同文件。v1.2.5 新增 Stripe 3DS 测试卡，并澄清插件可填写不同支付服务商的 checkout 表单。
- v1.2.6 移除 checkout 页面上的启用提示，用户点击“生成资料”后直接填写。
- v1.2.7 优先填写收货电话，避免误把营销短信电话当作结账电话。
- v1.2.11 在首次使用时由 checkout 网页右侧中间说明本地表单处理方式，用户点击“启用并生成”才开始读取表单；“清除本地数据”会撤销此选择。

## 开发者账号

1. 用计划长期持有的 Google 账号打开 `https://chrome.google.com/webstore/devconsole`，接受开发者协议并支付一次性注册费。
2. 在后台 Account 页面设置发布者名称并验证联系邮箱；Google 账号须启用两步验证。
3. 如实申报 Trader 或 Non-Trader 身份；如果被要求验证经营者信息，按后台提示提交法定名称、地址、可收短信的电话及可能要求的文件。

## 商店详情

使用 `store/STORE_LISTING.md` 中的英文和简体中文文案；首次使用方式已与 v1.2.11 一致。

## 隐私实践填写依据

- 单一用途：在用户获准测试的 checkout 页面生成并填写测试表单资料。
- 网站访问权限：用户可能测试不同域名的商店；脚本须在页面本地判断 URL 是否包含 checkout 以及是否出现相关字段。后台应如实解释宽泛的网站访问范围。
- `storage`：本地保存国家／州／测试卡设置、近期邮箱和地址轮换状态；会话内存按标签页暂存多步骤资料。
- `activeTab`：用户打开弹窗时读取活动标签页并向该页发送生成指令。
- 数据处理：在浏览器本地读取表单标签、选项和现有输入值；不向开发者服务器发送，不用于广告或分析。用户自行提交 checkout 时，商店及支付服务可能收到填写内容。
- 远程代码：无。所有运行脚本和数据都在扩展包内。
- 按后台实际选项如实申报信用卡测试字段及本地保存的自定义测试卡设置。

## 提交前必须补齐

1. 把 `release/privacy-site/index.html` 单独上传到公开 GitHub 仓库 `tryfashion/Checkout-Test-Fill` 的根目录，在 Settings → Pages 选择 Deploy from a branch、`main`、`/(root)`。确认 `https://tryfashion.github.io/Checkout-Test-Fill/` 可访问后，将该链接填入后台 Privacy 页面；不要上传插件源码或 ZIP。
2. 在 v1.2.11 实际 checkout 页面重新截取 1280×800 截图；`store/screenshots/checkout-test-fill-1280x800.png` 是旧按钮位置的参考图，应以新版截图替换。现有演示 GIF 和 Word 中的模拟 checkout 图不能当作商店真实功能截图。
3. 商店图标可用 `icons/128.png`。填写商店详情、隐私实践、分发地区与测试说明。可先选 Private（仅可信测试者），也可选 Unlisted 或 Public；三者接受相同政策审核。
4. 复查正式名称、发布者信息、隐私实践和截图后，上传 `release/checkout-test-autofill-store-v1.2.11.zip` 并提交审核。审核通过后才会在所选范围内发布。

同一商店条目后续更新时提高 `manifest.json` 版本号并上传新版 ZIP；商店安装的用户由 Chrome 检查并安装更新。开发模式加载的本地文件夹不会自动更新。
