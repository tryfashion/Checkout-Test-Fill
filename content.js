(() => {
  const { t } = globalThis.CHECKOUT_I18N;
  const firstNames = globalThis.TEST_NAMES.first;
  const lastNames = globalThis.TEST_NAMES.last;
  const edited = new Set();
  let lastMessage = t("initialStatus");
  let lastFillResult = null;
  function fillResultMessage({ fields, cards, name, phoneFailed, state }) {
    let result = fields || cards ? t("fillSuccess", { fields, cards, name }) : t("noEmptyFields");
    if (phoneFailed) result += t("phoneFailed");
    if (state) result += t("otherState", { state });
    return result;
  }
  let filling = false;
  let widgetHost = null;
  let triggerTimer = null;
  let cardTimer = null;
  let cardBusy = false;
  let lastProfile = null;
  let consentGranted = false;
  const stateNames = { AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming" };

  const random = (max) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const visible = (el) => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");

  function details(el) {
    const labels = [...(el.labels || [])].map((label) => label.textContent || "").join(" ");
    const parent = el.closest("label")?.textContent || "";
    const described = el.getAttribute("aria-label") || "";
    const labelledBy = (el.getAttribute("aria-labelledby") || "").split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ");
    const adjacent = el.previousElementSibling?.textContent || el.parentElement?.querySelector("label")?.textContent || "";
    return [el.getAttribute("autocomplete"), el.name, el.id, el.placeholder, described, labelledBy, labels, parent, adjacent].filter(Boolean).join(" ").toLowerCase();
  }

  function control(pattern, tag = "input,select,textarea") {
    return [...document.querySelectorAll(tag)].find((el) => visible(el) && pattern.test(details(el)) && el.type !== "hidden");
  }

  function isConfirmEmail(el) {
    return /confirm(?:ation)?[\s_-]*(?:e-?mail)|(?:e-?mail)[\s_-]*(?:confirm|verification|verify)|re[\s_-]?enter[\s_-]*(?:e-?mail)|确认(?:电子)?邮箱|再次输入(?:电子)?邮箱|重复(?:电子)?邮箱/.test(details(el));
  }

  function input(key) {
    const patterns = {
      email: /email|e-mail|电子邮箱|电子邮件|邮箱|电邮/,
      first: /given-name|first[ _-]?name|forename|名字|名(?!称|字)/,
      last: /family-name|last[ _-]?name|surname|姓氏|姓/,
      address1: /address-line1|address[ _-]?1|street[ _-]?address|address|flat|floor|building|街道|地址|门牌/,
      address2: /address-line2|address[ _-]?2|apartment|suite|unit|公寓|房间/,
      city: /address-level2|city|town|城市|市区/,
      zip: /postal-code|zip|post[ _-]?code|邮编|邮政编码/,
      phone: /tel|phone|mobile|电话|手机/
    };
    if (key === "email" || key === "confirmEmail") {
      return [...document.querySelectorAll("input,textarea")].find((el) => visible(el) && el.type !== "hidden" && patterns.email.test(details(el)) && isConfirmEmail(el) === (key === "confirmEmail"));
    }
    if (key === "phone") {
      const fields = [...document.querySelectorAll("input,textarea")];
      const marketing = (el) => [el.parentElement, el.parentElement?.parentElement]
        .some((node) => node?.textContent?.length < 300 && /text offers|subscribe|sms|marketing|newsletter|短信|订阅/i.test(node.textContent));
      const phones = fields.filter((el) => visible(el) && el.type !== "hidden" && patterns.phone.test(details(el)) && !/tel[ _-]?area[ _-]?code|area[ _-]?code|tel-country-code|country[ _-]?(?:code|dial)|dial[ _-]?code|calling[ _-]?code|phone[ _-]?prefix|电话区号|国际区号/.test(details(el)) && !marketing(el));
      const address = input("zip") || input("city") || input("address1");
      const addressIndex = fields.indexOf(address);
      return phones.find((el) => addressIndex >= 0 && fields.indexOf(el) > addressIndex) || phones[0];
    }
    if (key === "address1") {
      return [...document.querySelectorAll("input,textarea")].find((el) => visible(el) && patterns.address1.test(details(el)) && !/address-line2|address[ _-]?2|apartment|suite|unit|email|邮箱|公寓|房间/.test(details(el)));
    }
    return control(patterns[key], "input,textarea");
  }

  function selection(kind, values = []) {
    const candidates = [...document.querySelectorAll("select,[role=combobox],button,input")].filter(visible);
    if (kind === "state") {
      const countryControl = selection("country");
      const stateLabel = /state|province|address-level1|州|省/;
      const stateControls = candidates.filter((el) => el !== countryControl && stateLabel.test(details(el)));
      const byOption = stateControls.find((el) => el.tagName === "SELECT" && !el.disabled && [...el.options].some((option) => values.some((value) => option.value.trim().toLowerCase() === value || option.textContent.trim().toLowerCase() === value)));
      const byFullName = candidates.find((el) => el !== countryControl && el.tagName === "SELECT" && !el.disabled && [...el.options].some((option) => values.some((value) => value.length > 2 && option.textContent.trim().toLowerCase() === value)));
      return byOption || stateControls[0] || byFullName || candidates.find((el) => el !== countryControl && /region|地区/.test(details(el)) && !/country|国家/.test(details(el)));
    }
    return candidates.find((el) => /country|nation|国家/.test(details(el))) || candidates.find((el) => /region|地区/.test(details(el)));
  }

  function selectionMatches(el, values) {
    if (!el) return false;
    const normalize = (value) => String(value || "").trim().toLowerCase();
    if (el.tagName === "SELECT") {
      const selected = el.selectedOptions?.[0];
      return values.some((value) => normalize(el.value) === value || normalize(selected?.textContent) === value);
    }
    const displayed = [el.value, el.getAttribute("aria-valuetext"), el.textContent]
      .map(normalize).filter(Boolean);
    return displayed.some((text) => values.some((value) => text === value || (value.length > 2 && text.endsWith(value))));
  }

  function formStage() {
    if (!location.href.toLowerCase().includes("checkout")) return false;
    const first = input("first");
    const last = input("last");
    const shipping = !!first && !!last && first !== last && !!selection("country");
    const email = !!input("email");
    if (shipping) return email ? "single" : "shipping";
    if (email) return "contact";
    const card = cardControls();
    return card.number || card.holder ? "payment" : false;
  }

  async function readProfile() {
    try {
      const { profile } = await chrome.runtime.sendMessage({ type: "GET_PROFILE" });
      return profile && profile.first && profile.last && profile.email && profile.stage ? profile : null;
    } catch { return null; }
  }

  async function saveProfile(profile) {
    lastProfile = profile;
    await chrome.runtime.sendMessage({ type: "SAVE_PROFILE", profile });
  }

  async function createProfile(stateCode) {
    const first = firstNames[random(firstNames.length)];
    const last = lastNames[random(lastNames.length)];
    const [address1, city, , zip] = stateCode === "CA" ? await nextAddress() : ["", "", stateCode, ""];
    return {
      first, last, email: await makeEmail(first, last), address1, city, zip,
      phone: `41555501${String(random(100)).padStart(2, "0")}`, stateCode
    };
  }

  function setValue(el, value) {
    if (!el) return false;
    el.focus({ preventScroll: true });
    const prototype = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur();
    return true;
  }

  async function setUSPhoneCountry() {
    const phone = input("phone");
    if (!phone) return null;
    const container = phone.parentElement?.parentElement || phone.parentElement;
    if (!container) return null;
    const shopyyCode = container.querySelector('.country_phone_code_input[name="tel_area_code"]');
    if (shopyyCode && visible(shopyyCode)) {
      if (shopyyCode.getAttribute("data-country")?.toUpperCase() === "US" && shopyyCode.value === "US_1") return true;
      const trigger = container.querySelector(".country_phone_code");
      if (!trigger) return false;
      trigger.click();
      await sleep(180);
      const option = [...document.querySelectorAll('.phone-number-wrap li[data-country="US"]')].find(visible);
      if (!option) return false;
      option.click();
      await sleep(180);
      return shopyyCode.getAttribute("data-country")?.toUpperCase() === "US" && shopyyCode.value === "US_1";
    }
    const candidates = [...container.querySelectorAll('select,button,input[readonly],[role="combobox"],[role="button"],[class*="country"],[class*="Country"],[class*="flag"],[class*="Flag"],[class*="dial"]')]
      .filter((el) => el !== phone && visible(el));
    const label = (el) => [el.value, el.textContent, el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("data-dial-code")].filter(Boolean).join(" ").trim().toLowerCase();
    const us = /(?:united states|\bus\b|\+1\b)/;
    const current = candidates.find((el) => el.tagName === "SELECT" && [...el.options].some((option) => us.test(`${option.value} ${option.textContent}`.toLowerCase())))
      || candidates.filter((el) => label(el).length < 90).sort((a, b) => label(a).length - label(b).length).find((el) => /\+\d{1,3}|\bchina\b|\bunited states\b/.test(label(el)));
    if (!current) return /\+86\b/.test(container.textContent || "") ? false : null;
    if (current.tagName === "SELECT") {
      const option = [...current.options].find((item) => /\bunited states\b|\bus\b/.test(`${item.value} ${item.textContent}`.toLowerCase()) && /\+1\b|\bus\b/.test(`${item.value} ${item.textContent}`.toLowerCase()))
        || [...current.options].find((item) => /\bunited states\b|\bus\b|\+1\b/.test(`${item.value} ${item.textContent}`.toLowerCase()));
      if (!option) return false;
      if (current.value !== option.value) {
        current.value = option.value;
        current.dispatchEvent(new Event("input", { bubbles: true }));
        current.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return current.value === option.value;
    }
    if (us.test(label(current)) && !/\+86\b/.test(label(current))) return true;
    current.click();
    await sleep(180);
    const options = [...document.querySelectorAll('[data-country-code],[data-dial-code],[role="option"],li,button')].filter(visible);
    const option = options.find((el) => (el.getAttribute("data-country-code") || "").toLowerCase() === "us")
      || options.find((el) => /united states/.test(label(el)) && /\+1\b/.test(label(el)));
    if (!option) return false;
    option.click();
    await sleep(180);
    return !/\+86\b/.test(container.textContent || "");
  }

  function setText(key, value, force) {
    if (!force && edited.has(key)) return false;
    const field = input(key);
    if (!field || !value || (!force && field.value?.trim())) return false;
    return setValue(field, value);
  }

  function clearMarketingOptIn() {
    for (const checkbox of document.querySelectorAll('input[type="checkbox"]')) {
      if (checkbox.checked && /news|offers|newsletter|marketing|促销|优惠|订阅|营销/.test(details(checkbox))) checkbox.click();
    }
  }

  function cardControls() {
    const controls = [...document.querySelectorAll("input")].filter((el) => visible(el) && el.type !== "hidden");
    const find = (pattern) => controls.find((el) => pattern.test(details(el)));
    return {
      number: find(/cc-number|card[ _-]?number|cardnumber|银行卡号|信用卡号|卡号/),
      expiry: find(/cc-exp(?!-month|-year)|expir(?:ation|y)[ _-]?date|有效期|到期日/),
      month: find(/cc-exp-month|expir(?:ation|y)[ _-]?month|到期月份/),
      year: find(/cc-exp-year|expir(?:ation|y)[ _-]?year|到期年份/),
      cvc: find(/cc-csc|security[ _-]?code|cvv|cvc|安全码/),
      holder: find(/cc-name|cardholder[ _-]?name|name[ _-]?on[ _-]?card|持卡人/)
    };
  }

  async function fillCardFields(profile, overwrite = false) {
    if (!profile || cardBusy) return 0;
    cardBusy = true;
    try {
      const settings = await chrome.storage.local.get({ cardEnabled: true, cardNumber: "4242424242424242", expiryYears: 2, cardCvc: "234" });
      if (!settings.cardEnabled) return 0;
      const fields = cardControls();
      if (!fields.number && !fields.expiry && !fields.cvc && !fields.holder) return 0;
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + settings.expiryYears);
      const month = String(expiry.getMonth() + 1).padStart(2, "0");
      const year = String(expiry.getFullYear());
      const cardNumber = settings.cardNumber.length === 15
        ? settings.cardNumber.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3")
        : settings.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
      const pairs = [
        [fields.number, fields.number?.type === "number" ? settings.cardNumber : cardNumber],
        [fields.expiry, fields.expiry?.type === "month" ? `${year}-${month}` : `${month}/${year.slice(-2)}`],
        [fields.month, month],
        [fields.year, year],
        [fields.cvc, settings.cardCvc],
        [fields.holder, `${profile.first} ${profile.last}`]
      ];
      let filled = 0;
      for (const [field, value] of pairs) {
        if (field && (overwrite || !field.value.trim()) && setValue(field, value)) filled++;
      }
      return filled;
    } finally {
      cardBusy = false;
    }
  }

  async function setSelection(kind, values, force) {
    if (!force && edited.has(kind)) return false;
    let el = selection(kind, values);
    if (kind === "state") {
      for (let attempt = 0; attempt < 25 && (!el || (el.tagName === "SELECT" && ![...el.options].some((option) => values.some((value) => option.value.trim().toLowerCase() === value || option.textContent.trim().toLowerCase() === value)))); attempt++) {
        await sleep(160);
        el = selection(kind, values);
      }
    }
    if (!el) return false;
    if (el.tagName === "SELECT") {
      const option = [...el.options].find((item) => values.some((v) => item.value.toLowerCase() === v || item.textContent.trim().toLowerCase() === v));
      if (!option) return false;
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
      if (setter) setter.call(el, option.value);
      else el.value = option.value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
      await sleep(180);
      return selectionMatches(selection(kind, values), values);
    }
    if (el.tagName === "INPUT" && !el.readOnly && !el.getAttribute("aria-haspopup") && el.getAttribute("role") !== "combobox" && ["text", "search"].includes(el.type)) {
      const text = values.find((value) => value.length > 2) || values[0];
      if (!text) return false;
      setValue(el, text.replace(/\b\w/g, (letter) => letter.toUpperCase()));
      await sleep(180);
      return selectionMatches(selection(kind, values), values);
    }
    if (selectionMatches(el, values)) return true;
    el.click();
    await sleep(180);
    const options = [...document.querySelectorAll("[role=option],li,button,[data-value]")].filter(visible);
    const option = options.find((item) => values.some((v) => (item.getAttribute("data-value") || "").trim().toLowerCase() === v || (item.textContent || "").trim().toLowerCase() === v));
    if (!option) return false;
    option.click();
    await sleep(180);
    return selectionMatches(selection(kind, values), values);
  }

  async function nextAddress() {
    const count = globalThis.CA_ADDRESSES?.length || 0;
    if (!count) throw new Error(t("noAddresses"));
    let { addressOrder, addressCursor } = await chrome.storage.local.get(["addressOrder", "addressCursor"]);
    if (!Array.isArray(addressOrder) || addressOrder.length !== count || !Number.isInteger(addressCursor) || addressCursor >= count) {
      addressOrder = Array.from({ length: count }, (_, i) => i);
      for (let i = count - 1; i > 0; i--) {
        const j = random(i + 1);
        [addressOrder[i], addressOrder[j]] = [addressOrder[j], addressOrder[i]];
      }
      addressCursor = 0;
    }
    const address = globalThis.CA_ADDRESSES[addressOrder[addressCursor]];
    await chrome.storage.local.set({ addressOrder, addressCursor: addressCursor + 1 });
    return address;
  }

  async function makeEmail(first, last) {
    const { usedEmails = [] } = await chrome.storage.local.get("usedEmails");
    const recent = new Set(usedEmails);
    for (let attempt = 0; attempt < 100; attempt++) {
      const year = 1970 + random(36);
      const domain = random(2) ? "gmail.com" : "outlook.com";
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${year}@${domain}`;
      if (recent.has(email)) continue;
      usedEmails.push(email);
      if (usedEmails.length > 20_000) usedEmails.shift();
      await chrome.storage.local.set({ usedEmails });
      return email;
    }
    throw new Error(t("noUniqueEmail"));
  }

  function keyFor(el) {
    const found = Object.keys({ email: 1, confirmEmail: 1, first: 1, last: 1, address1: 1, address2: 1, city: 1, zip: 1, phone: 1 }).find((key) => input(key) === el);
    if (found) return found;
    if (selection("country") === el) return "country";
    if (selection("state") === el) return "state";
    return null;
  }

  document.addEventListener("input", (event) => {
    if (!consentGranted) return;
    if (event.isTrusted) { const key = keyFor(event.target); if (key) edited.add(key); }
  }, true);
  document.addEventListener("change", (event) => {
    if (!consentGranted) return;
    if (event.isTrusted) { const key = keyFor(event.target); if (key) edited.add(key); }
    scheduleTriggerCheck();
  }, true);

  async function fill(force = false) {
    if (!consentGranted) return { message: t("refreshPage") };
    if (filling) return { message: t("filling") };
    const stage = formStage();
    if (!stage) return { message: t("noFields") };
    filling = true;
    lastFillResult = null;
    try {
      const { country: countryCode = "US", state: stateCode = "CA" } = await chrome.storage.local.get(["country", "state"]);
      if (countryCode !== "US") {
        lastMessage = t("usOnly");
        return { message: lastMessage };
      }
      if (!force && (edited.has("country") || edited.has("state") || edited.has("address1") || edited.has("city") || edited.has("zip"))) {
        lastMessage = t("manualAddress");
        return { message: lastMessage };
      }
      if (stage === "single" || stage === "shipping") {
        const countryValues = ["united states", "united states of america", "us", "usa"];
        const country = await setSelection("country", countryValues, force);
        if (!country) {
          lastMessage = t("countryFailed");
          return { message: lastMessage };
        }
        await sleep(350);
        const state = await setSelection("state", [stateNames[stateCode]?.toLowerCase(), stateCode.toLowerCase()].filter(Boolean), force);
        if (!state) {
          lastMessage = t("stateFailed", { state: stateNames[stateCode] || stateCode });
          return { message: lastMessage };
        }
        if (!selectionMatches(selection("country"), countryValues)) {
          lastMessage = t("countryChanged");
          return { message: lastMessage };
        }
        for (let attempt = 0; attempt < 25 && !input("zip"); attempt++) await sleep(160);
        if (stateCode === "CA" && !input("zip")) {
          lastMessage = t("zipMissing");
          return { message: lastMessage };
        }
      }
      const fresh = !lastProfile || lastProfile.stage === stage || lastProfile.stateCode !== stateCode;
      const profile = fresh ? await createProfile(stateCode) : lastProfile;
      const values = { email: profile.email, first: profile.first, last: profile.last,
        address1: profile.address1, city: profile.city, zip: profile.zip, phone: profile.phone };
      const phoneCountry = await setUSPhoneCountry();
      let filled = 0;
      for (const [key, value] of Object.entries(values)) if ((key !== "phone" || phoneCountry !== false) && setText(key, value, force)) filled++;
      if (setText("confirmEmail", input("email")?.value?.trim() || profile.email, force)) filled++;
      clearMarketingOptIn();
      profile.stage = stage;
      await saveProfile(profile);
      const cardFilled = await fillCardFields(profile, force);
      lastFillResult = { fields: filled, cards: cardFilled, name: `${profile.first} ${profile.last}`,
        phoneFailed: phoneCountry === false,
        state: stateCode !== "CA" && (stage === "single" || stage === "shipping") ? stateNames[stateCode] : null };
      lastMessage = fillResultMessage(lastFillResult);
      return { message: lastMessage };
    } catch (error) {
      lastMessage = /Extension context invalidated/i.test(String(error?.message))
        ? t("refreshPage") : t("fillFailed", { error: error.message });
      return { message: lastMessage };
    } finally {
      filling = false;
    }
  }

  function createButton() {
    if (widgetHost || !document.body) return;
    const host = document.createElement("div");
    host.id = "checkout-test-fill-widget";
    host.style.cssText = "position:fixed;right:20px;bottom:calc(50vh - 24px);z-index:2147483647";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>*{box-sizing:border-box;font-family:system-ui,sans-serif}[hidden]{display:none!important}.wrap{display:flex;flex-direction:column;align-items:flex-end}button{font-size:16px;font-weight:600;border:0;border-radius:25px;background:#165dcb;color:#fff;padding:14px 22px;box-shadow:0 3px 12px #0003;cursor:pointer}button:disabled{opacity:.65;cursor:wait}p,.disclosure{max-width:300px;margin:0 0 9px;padding:9px 11px;border-radius:8px;background:#fff;color:#202124;box-shadow:0 2px 12px #0003;font-size:12px;line-height:1.5}p{display:none}p.show{display:block}.disclosure a{color:#165dcb}</style><div class="wrap"><div class="disclosure"><span></span> <a target="_blank" rel="noopener noreferrer"></a></div><p role="status"></p><button class="generate" type="button"></button></div>`;
    const button = shadow.querySelector(".generate");
    shadow.querySelector(".disclosure a").href = chrome.runtime.getURL("privacy.html");
    const message = shadow.querySelector("p");
    const showMessage = (value) => { message.textContent = value; message.classList.add("show"); };
    button.addEventListener("click", async () => {
      button.disabled = true;
      if (!consentGranted) {
        await chrome.storage.local.set({ consentGranted: true });
        consentGranted = true;
        updateWidget();
      }
      showMessage(t("generating"));
      const result = await fill(true);
      showMessage(result.message);
      button.disabled = false;
    });
    document.body.appendChild(host);
    widgetHost = host;
    updateWidget();
  }

  function updateWidget() {
    if (!widgetHost) return;
    const shadow = widgetHost.shadowRoot;
    shadow.querySelector(".disclosure").hidden = consentGranted;
    shadow.querySelector(".disclosure span").textContent = t("consentNotice");
    shadow.querySelector(".disclosure a").textContent = t("privacyLink");
    shadow.querySelector(".generate").textContent = t(consentGranted ? "generate" : "enableAndFill");
  }

  function checkTrigger() {
    if (!location.href.toLowerCase().includes("checkout")) {
      if (widgetHost) { widgetHost.remove(); widgetHost = null; }
      return;
    }
    if (!consentGranted) { createButton(); return; }
    if (formStage()) createButton();
    else if (widgetHost) { widgetHost.remove(); widgetHost = null; }
  }

  function scheduleTriggerCheck() {
    clearTimeout(triggerTimer);
    triggerTimer = setTimeout(checkTrigger, 200);
    if (lastProfile) {
      clearTimeout(cardTimer);
      cardTimer = setTimeout(async () => {
        if (!consentGranted) return;
        const filled = await fillCardFields(lastProfile, false);
        if (filled) {
          if (lastFillResult) {
            lastFillResult.cards += filled;
            lastMessage = fillResultMessage(lastFillResult);
          } else lastMessage += t("cardSupplement", { count: filled });
          const message = widgetHost?.shadowRoot?.querySelector('p[role="status"]');
          if (message) { message.textContent = lastMessage; message.classList.add("show"); }
        }
      }, 250);
    }
  }

  addEventListener("checkout-language-changed", () => {
    lastMessage = lastFillResult ? fillResultMessage(lastFillResult) : t("initialStatus");
    updateWidget();
    const message = widgetHost?.shadowRoot?.querySelector('p[role="status"]');
    if (message?.classList.contains("show")) {
      if (lastFillResult) message.textContent = lastMessage;
      else { message.textContent = ""; message.classList.remove("show"); }
    }
    scheduleTriggerCheck();
  });

  new MutationObserver(scheduleTriggerCheck).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden", "aria-hidden"] });
  addEventListener("popstate", scheduleTriggerCheck);
  addEventListener("hashchange", scheduleTriggerCheck);
  let lastUrl = "";
  setInterval(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; scheduleTriggerCheck(); }
  }, 1000);
  chrome.storage.local.get("consentGranted").then(({ consentGranted: allowed }) => {
    consentGranted = allowed === true;
    scheduleTriggerCheck();
    if (consentGranted) readProfile().then((profile) => { lastProfile = profile; });
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.consentGranted) {
      consentGranted = changes.consentGranted.newValue === true;
      if (consentGranted) readProfile().then((profile) => { lastProfile = profile; });
      else {
        clearTimeout(triggerTimer);
        clearTimeout(cardTimer);
        lastProfile = null;
        edited.clear();
      }
      updateWidget();
      scheduleTriggerCheck();
    }
    if (changes.resetAt) { lastProfile = null; edited.clear(); }
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "STATUS") { sendResponse({ message: !consentGranted ? t("enableOnPage") : formStage() ? lastMessage : t("noFields") }); return; }
    if (message.type === "FILL") {
      chrome.storage.local.get("consentGranted").then(({ consentGranted: allowed }) => {
        consentGranted = allowed === true;
        return fill(!!message.force);
      }).then(sendResponse);
      return true;
    }
  });
})();
