(() => {
  const zh = {
    popupTitle: "Checkout 测试资料", checking: "正在检查页面…", generateAndFill: "生成并填充", enableAndFill: "启用并生成", enableOnPage: "首次使用：请在 checkout 网页右侧中间点击“启用并生成”。", consentNotice: "插件会在浏览器本地读取 checkout 表单字段及已有输入，以识别并填写测试资料；不会发送给开发者或自动提交订单。点击“启用并生成”即允许此项处理。", languageLabel: "界面语言", languageAuto: "跟随浏览器", languageEnglish: "English", languageSimplified: "简体中文", languageTraditional: "繁體中文",
    settings: "配置", country: "国家", state: "州", stateHint: "目前只内置加州地址。选择其他州时，街道、城市和 ZIP Code 留空供你手动填写。",
    stripeCards: "测试卡", autoCard: "检测到信用卡字段时自动填写", cardNumber: "测试卡号（选中的是当前默认卡）",
    moveUp: "上移", moveDown: "下移", remove: "删除", customCard: "新增自定义测试卡号", customCardPlaceholder: "仅输入测试卡号",
    addCard: "添加卡号", sortCards: "按卡号排序", expiryYears: "有效期往后推几年", cvc: "安全码",
    cardHint: "4242、5555 和标注 3DS 的卡号均为 Stripe 官方测试卡。3DS 卡在支持验证的 Stripe 测试结账中用于测试身份验证。其他支付服务可添加其官方测试卡；不要保存真实银行卡号。",
    save: "保存配置", emailHint: "邮箱会按姓名和数字随机生成 Gmail 或 Outlook 格式，仅供测试，不保证有收件箱。",
    usageHint: "网址含 checkout 且检测到联系、收货或卡片字段时显示页面按钮。多步骤结账在每一步点击，沿用同一标签页的测试资料；不会提交订单或付款。",
    privacyLink: "隐私说明", localOnly: "数据和设置仅保存在本地浏览器。", clearData: "清除本地数据",
    officialVisa: "Stripe 官方 Visa · ", officialMastercard: "Stripe 官方 Mastercard · ", official3ds: "3DS · Stripe 官方 Visa · ", customPrefix: "自定义 · ",
    keepCard: "至少保留一个测试卡号。", invalidCard: "卡号应为 12–19 位数字。", duplicateCard: "这个卡号已经在列表中。",
    cardAdded: "已添加，请点击“保存配置”。", notCheckout: "当前不是目标 checkout 页面。", connected: "已连接，等待表单。",
    refreshPage: "请刷新 checkout 页面以加载插件。", generating: "正在生成并填写…", connectionFailed: "无法连接页面，请刷新后重试。",
    invalidExpiryCvc: "有效期请输入 1–10 年，安全码请输入 3–4 位数字。", savedCA: "配置已保存，可在页面右侧点击“生成资料”。",
    savedOther: "配置已保存。该州暂无地址库，地址需手动填写。", cleared: "已清除本地数据。",
    initialStatus: "已检测到 checkout 表单，可点击生成资料。", noAddresses: "地址库未加载。", noUniqueEmail: "暂时无法生成不重复的邮箱，请再点一次。",
    filling: "正在填写，请稍候。",
    noFields: "未检测到 checkout 的联系、收货或支付字段。", usOnly: "目前只支持美国地址。",
    manualAddress: "检测到手动修改，已停止自动覆盖地址。", countryFailed: "未能找到或选择 United States，请检查国家控件。",
    stateFailed: "未能找到或选择 {state}，请检查州控件。", countryChanged: "选择州后国家不是 United States，已停止填写地址。请检查国家和州下拉框。",
    zipMissing: "已选择美国和加州，但邮编字段尚未出现，请稍后再点一次。",
    fillSuccess: "已填写 {fields} 项联系／收货资料和 {cards} 项测试卡资料；本次测试姓名：{name}。",
    noEmptyFields: "当前步骤没有可填写的空字段；如需重新生成，请在本步骤再点一次。",
    phoneFailed: " 电话区号未能切换到美国，已跳过电话，请手动选 +1 后再填写。",
    otherState: " {state} 暂无地址库，街道、城市和 ZIP Code 需手动填写。", fillFailed: "填写失败：{error}",
    generate: "生成资料", cardSupplement: " 已补填 {count} 项测试卡资料。",
    privacyTitle: "Checkout 测试资料填充 · 隐私说明", privacyDate: "更新日期：2026 年 11 月 15 日",
    privacyReadHeading: "插件读取什么", privacyRead: "插件在浏览器本地检查网页地址是否含有 checkout，并读取页面表单及可访问的支付 iframe 中的字段标签、选项和现有输入值，以识别收货信息及可选的信用卡测试字段。插件不会读取无法访问的封闭支付控件。",
    privacyStoreHeading: "插件填写和保存什么", privacyStore: "点击生成后，插件填写组合生成的测试姓名、Gmail 或 Outlook 格式的虚构邮箱、美国测试电话、地址，以及启用时选定的测试卡号、有效期、安全码和持卡人姓名。这些资料比 111、222、abc 等占位内容更接近常见表单输入，便于检查结账流程；姓名和邮箱是生成的测试资料，不来自客户名单。邮箱格式不代表存在对应邮箱。插件将国家、州、测试卡设置、近期生成的邮箱和地址使用顺序保存在 Chrome 的本地扩展存储中。多步骤结账所用的当前资料按标签页暂存在扩展会话内存中，在标签页关闭、浏览器重启或插件更新后清除；不会放入网站的存储。自定义卡号也会保存在本地；请勿输入真实银行卡号。",
    privacyShareHeading: "数据发送和使用", privacyShare: "插件没有开发者服务器，不向开发者、广告商或分析服务发送网页、表单或设置数据，不销售或共享这些数据，也不加载远程代码。插件不会自动提交订单或付款。你如果自行提交 checkout 表单，网站及其支付服务可能收到已填入的内容；该处理取决于网站自身的隐私政策。",
    privacyDeleteHeading: "删除数据", privacyDelete: "在插件弹窗中点击“清除本地数据”，即可删除插件保存在浏览器本地的设置及历史记录。卸载插件也会删除其本地存储。",
    privacyScopeHeading: "使用范围", privacyScope: "首次使用时，checkout 网页右侧中间会说明本地表单处理方式；点击“启用并生成”后才开始读取表单。该选择保存在浏览器本地，点击“清除本地数据”可撤销。本插件可用于你获准测试的 checkout，表单填写不限定支付服务商。内置三张卡是 Stripe 测试卡，只应在 Stripe 测试环境中使用；其他支付服务须使用其官方测试卡和测试环境。真实地址源数据只为生成测试输入；请勿用于实际发货。请勿保存或输入真实银行卡号。"
  };
  const en = {
    popupTitle: "Checkout Test Fill", checking: "Checking this page…", generateAndFill: "Generate and fill", enableAndFill: "Enable and generate", enableOnPage: "First use: click Enable and generate at the middle right of the checkout page.", consentNotice: "The extension reads checkout form fields and existing input locally to identify and fill test data. It does not send them to the developer or submit orders. Click Enable and generate to allow this processing.", languageLabel: "Language", languageAuto: "Follow browser", languageEnglish: "English", languageSimplified: "简体中文", languageTraditional: "繁體中文",
    settings: "Settings", country: "Country", state: "State", stateHint: "Only California addresses are included. For other states, enter the street, city, and ZIP code yourself.",
    stripeCards: "Test cards", autoCard: "Fill recognized card fields automatically", cardNumber: "Test card numbers (selected card is the default)",
    moveUp: "Move up", moveDown: "Move down", remove: "Remove", customCard: "Add a custom test card number", customCardPlaceholder: "Test card number only",
    addCard: "Add card", sortCards: "Sort by number", expiryYears: "Years until expiry", cvc: "Security code",
    cardHint: "4242, 5555, and the 3DS-labeled card are official Stripe test cards. The 3DS card tests authentication in a supported Stripe test checkout. For other payment providers, add their official test cards. Never save a real card number.",
    save: "Save settings", emailHint: "Emails are generated from names and digits using Gmail or Outlook format for testing. They may not have an inbox.",
    usageHint: "The page button appears when a checkout URL has contact, shipping, or card fields. Click it on each step of a multi-step checkout; it reuses the same test profile. It never submits an order or payment.",
    privacyLink: "Privacy notice", localOnly: "Data and settings stay in this browser.", clearData: "Clear local data",
    officialVisa: "Official Stripe Visa · ", officialMastercard: "Official Stripe Mastercard · ", official3ds: "3DS · Official Stripe Visa · ", customPrefix: "Custom · ",
    keepCard: "Keep at least one test card number.", invalidCard: "Card number must be 12–19 digits.", duplicateCard: "That card number is already in the list.",
    cardAdded: "Added. Click Save settings to keep it.", notCheckout: "This is not a target checkout page.", connected: "Connected; waiting for a form.",
    refreshPage: "Refresh the checkout page to load the extension.", generating: "Generating and filling…", connectionFailed: "Could not connect to the page. Refresh and try again.",
    invalidExpiryCvc: "Expiry must be 1–10 years and security code must be 3–4 digits.", savedCA: "Settings saved. Click Generate on the right side of the page.",
    savedOther: "Settings saved. No address library for this state; enter the address yourself.", cleared: "Local data cleared.",
    initialStatus: "Checkout form found. Click Generate.", noAddresses: "Address library did not load.", noUniqueEmail: "Could not generate a unique email. Try again.",
    filling: "Filling fields; please wait.",
    noFields: "No checkout contact, shipping, or payment fields found.", usOnly: "Only US addresses are supported for now.",
    manualAddress: "Manual address changes detected. Automatic address fill stopped.", countryFailed: "Could not find or select United States. Check the country control.",
    stateFailed: "Could not find or select {state}. Check the state control.", countryChanged: "The country is no longer United States after selecting the state. Address fill stopped; check both menus.",
    zipMissing: "United States and California are selected, but the ZIP field has not appeared. Try again shortly.",
    fillSuccess: "Filled {fields} contact/shipping fields and {cards} test-card fields. Test name: {name}.",
    noEmptyFields: "No empty fields on this step. Click again here to generate a new profile.",
    phoneFailed: " Could not switch the phone code to the US. Phone skipped; select +1 and enter it manually.",
    otherState: " No address library for {state}; enter street, city, and ZIP code manually.", fillFailed: "Fill failed: {error}",
    generate: "Generate", cardSupplement: " Filled {count} additional test-card fields.",
    privacyTitle: "Checkout Test Fill · Privacy Notice", privacyDate: "Updated November 15, 2026",
    privacyReadHeading: "What the extension reads", privacyRead: "The extension checks locally whether a page URL contains checkout. It reads field labels, options, and existing values in the page form and accessible payment iframes to identify shipping and optional test-card fields. It cannot read inaccessible closed payment controls.",
    privacyStoreHeading: "What it fills and stores", privacyStore: "When you click Generate, the extension fills a combined test name, a fictional Gmail- or Outlook-formatted email, a US test phone number and address, and, when enabled, the selected test card number, expiry, security code, and cardholder name. These details resemble ordinary form entries more closely than placeholders such as 111, 222, or abc, helping you check checkout flows; generated names and emails do not come from customer lists. The email format does not mean an inbox exists. Country, state, test-card settings, recently generated emails, and address order are stored in Chrome local extension storage. The current multi-step profile is kept per tab in extension session memory and cleared when the tab closes, the browser restarts, or the extension updates; it is not stored in the website's storage. Custom card numbers are also stored locally; never enter a real card number.",
    privacyShareHeading: "Data sharing and use", privacyShare: "The extension has no developer server. It does not send page, form, or settings data to the developer, advertisers, or analytics providers; sell or share that data; or load remote code. It never submits an order or payment. If you submit a checkout form yourself, the website and payment provider may receive the filled data under the site's privacy policy.",
    privacyDeleteHeading: "Delete data", privacyDelete: "Click Clear local data in the popup to delete stored settings and history. Uninstalling the extension also removes its local storage.",
    privacyScopeHeading: "Scope", privacyScope: "On first use, a notice at the middle right of checkout pages explains local form processing. The extension starts reading form fields only after you click Enable and generate. This choice is stored locally and can be withdrawn with Clear local data. Use this extension on checkout flows you are authorized to test; form filling is not limited to any payment provider. The three built-in cards are Stripe test cards for Stripe test environments only. For other payment providers, use their official test cards in their test environments. Real address source data is for test input only; do not use it for actual shipping. Never save or enter a real card number."
  };
  const zhTW = { ...zh,
    popupTitle: "Checkout 測試資料", checking: "正在檢查頁面…", generateAndFill: "產生並填入", enableAndFill: "啟用並產生", enableOnPage: "首次使用：請在 checkout 網頁右側中間點擊「啟用並產生」。", consentNotice: "擴充功能會在瀏覽器本機讀取 checkout 表單欄位及現有輸入，以辨識並填入測試資料；不會傳送給開發者或自動提交訂單。點擊「啟用並產生」即允許此項處理。", languageLabel: "介面語言", languageAuto: "跟隨瀏覽器", languageEnglish: "English", languageSimplified: "简体中文", languageTraditional: "繁體中文",
    settings: "設定", country: "國家", state: "州", stateHint: "目前僅內建加州地址。選擇其他州時，街道、城市與郵遞區號請自行填寫。",
    stripeCards: "測試卡", autoCard: "偵測到信用卡欄位時自動填入", cardNumber: "測試卡號（選取的是目前預設卡）",
    moveUp: "上移", moveDown: "下移", remove: "刪除", customCard: "新增自訂測試卡號", customCardPlaceholder: "僅輸入測試卡號",
    addCard: "新增卡號", sortCards: "依卡號排序", expiryYears: "有效期限往後推幾年", cvc: "安全碼",
    cardHint: "4242、5555 與標示 3DS 的卡號均為 Stripe 官方測試卡。3DS 卡可在支援驗證的 Stripe 測試結帳中測試身分驗證。其他付款服務可新增其官方測試卡；勿儲存真實信用卡號。",
    save: "儲存設定", emailHint: "電子郵件會依姓名與數字隨機產生 Gmail 或 Outlook 格式，僅供測試，不保證有收件匣。",
    usageHint: "網址含 checkout 且偵測到聯絡、收貨或卡片欄位時顯示頁面按鈕。多步驟結帳請在每一步點擊，沿用同一分頁的測試資料；不會提交訂單或付款。",
    privacyLink: "隱私說明", localOnly: "資料與設定僅儲存在本機瀏覽器。", clearData: "清除本機資料",
    officialVisa: "Stripe 官方 Visa · ", officialMastercard: "Stripe 官方 Mastercard · ", official3ds: "3DS · Stripe 官方 Visa · ", customPrefix: "自訂 · ",
    keepCard: "至少保留一個測試卡號。", invalidCard: "卡號應為 12–19 位數字。", duplicateCard: "此卡號已在清單中。",
    cardAdded: "已新增，請點擊「儲存設定」。", notCheckout: "目前不是目標 checkout 頁面。", connected: "已連線，等待表單。",
    refreshPage: "請重新整理 checkout 頁面以載入擴充功能。", generating: "正在產生並填入…", connectionFailed: "無法連線至頁面，請重新整理後再試。",
    invalidExpiryCvc: "有效期限請輸入 1–10 年，安全碼請輸入 3–4 位數字。", savedCA: "設定已儲存，可在頁面右側點擊「產生資料」。",
    savedOther: "設定已儲存。該州暫無地址庫，地址需自行填寫。", cleared: "已清除本機資料。",
    initialStatus: "已偵測到 checkout 表單，可點擊產生資料。", noAddresses: "地址庫未載入。", noUniqueEmail: "暫時無法產生不重複的電子郵件，請再點一次。",
    filling: "正在填入，請稍候。",
    noFields: "未偵測到 checkout 的聯絡、收貨或付款欄位。", usOnly: "目前僅支援美國地址。",
    manualAddress: "偵測到手動修改，已停止自動覆蓋地址。", countryFailed: "無法找到或選擇 United States，請檢查國家欄位。",
    stateFailed: "無法找到或選擇 {state}，請檢查州欄位。", countryChanged: "選擇州後，國家不再是 United States。已停止填入地址，請檢查國家與州選單。",
    zipMissing: "已選擇美國與加州，但郵遞區號欄位尚未出現，請稍後再點一次。",
    fillSuccess: "已填入 {fields} 項聯絡／收貨資料及 {cards} 項測試卡資料；本次測試姓名：{name}。",
    noEmptyFields: "目前步驟沒有可填入的空白欄位；如需重新產生，請在此步驟再點一次。",
    phoneFailed: " 電話區碼無法切換至美國，已略過電話；請自行選擇 +1 後填入。",
    otherState: " {state} 暫無地址庫，街道、城市及郵遞區號需自行填寫。", fillFailed: "填入失敗：{error}",
    generate: "產生資料", cardSupplement: " 已補填 {count} 項測試卡資料。",
    privacyTitle: "Checkout 測試資料填入 · 隱私說明", privacyDate: "更新日期：2026 年 11 月 15 日",
    privacyReadHeading: "擴充功能讀取什麼", privacyRead: "擴充功能會在瀏覽器本機檢查網頁網址是否含有 checkout，並讀取頁面表單及可存取的付款 iframe 中的欄位標籤、選項與現有輸入值，以辨識收貨資訊及可選的信用卡測試欄位。擴充功能無法讀取不可存取的封閉式付款欄位。",
    privacyStoreHeading: "擴充功能填入與儲存什麼", privacyStore: "點擊產生後，擴充功能會填入組合產生的測試姓名、Gmail 或 Outlook 格式的虛構電子郵件、美國測試電話與地址；啟用時亦會填入所選的測試卡號、有效期限、安全碼及持卡人姓名。這些資料比 111、222、abc 等佔位內容更接近一般表單輸入，便於檢查結帳流程；產生的姓名與電子郵件並非來自客戶名單。電子郵件格式不代表信箱實際存在。國家、州、測試卡設定、近期產生的電子郵件及地址使用順序儲存在 Chrome 的本機擴充功能儲存空間中。目前多步驟結帳使用的資料按分頁暫存在擴充功能工作階段記憶體中，關閉分頁、重新啟動瀏覽器或更新擴充功能後即清除；不會存入網站儲存空間。自訂卡號也會儲存在本機；請勿輸入真實信用卡號。",
    privacyShareHeading: "資料傳送與使用", privacyShare: "擴充功能沒有開發者伺服器，不會將網頁、表單或設定資料傳送給開發者、廣告商或分析服務；不會出售或分享這些資料，也不會載入遠端程式碼。擴充功能不會自動提交訂單或付款。若你自行提交 checkout 表單，網站及其付款服務可能會收到已填入的內容；相關處理依網站自身的隱私權政策而定。",
    privacyDeleteHeading: "刪除資料", privacyDelete: "在擴充功能彈出視窗中點擊「清除本機資料」，即可刪除擴充功能儲存在瀏覽器本機的設定與歷史紀錄。解除安裝也會刪除其本機儲存資料。",
    privacyScopeHeading: "使用範圍", privacyScope: "首次使用時，checkout 網頁右側中間會說明本機表單處理方式；點擊「啟用並產生」後才開始讀取表單。此選擇儲存在瀏覽器本機，可透過「清除本機資料」撤回。本擴充功能可用於你獲准測試的 checkout，表單填寫不限付款服務商。內建三張卡是 Stripe 測試卡，僅供 Stripe 測試環境使用；其他付款服務須使用其官方測試卡及測試環境。真實地址來源資料僅供產生測試輸入；請勿用於實際寄送。請勿儲存或輸入真實信用卡號。"
  };
  function fromBrowser() {
    const browserLanguage = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
    if (/^zh[-_](?:Hant|TW|HK|MO)(?:[-_]|$)/i.test(browserLanguage)) return "zh_TW";
    return /^zh(?:[-_]|$)/i.test(browserLanguage) ? "zh_CN" : "en";
  }
  const supported = { en, zh_CN: zh, zh_TW: zhTW };
  let preference = "auto";
  const api = {
    get language() { return preference === "auto" ? fromBrowser() : preference; },
    get preference() { return preference; },
    setLanguage(value) {
      preference = value === "auto" || Object.hasOwn(supported, value) ? value : "auto";
      globalThis.dispatchEvent?.(new Event("checkout-language-changed"));
    },
    t(key, values = {}) {
      return (supported[api.language][key] || en[key] || key).replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));
    }
  };
  globalThis.CHECKOUT_I18N = api;
  chrome.storage?.local?.get?.({ uiLanguage: "auto" }, (settings) => api.setLanguage(settings.uiLanguage));
  chrome.storage?.onChanged?.addListener?.((changes, area) => {
    if (area === "local" && changes.uiLanguage) api.setLanguage(changes.uiLanguage.newValue);
  });
})();
