(() => {
  if (window === window.top) return;

  let profile = null;
  let timer = null;
  let busy = false;
  let consentGranted = false;

  const visible = (el) => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden");

  function details(el) {
    const labels = [...(el.labels || [])].map((label) => label.textContent || "").join(" ");
    const labelledBy = (el.getAttribute("aria-labelledby") || "").split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "").join(" ");
    return [el.getAttribute("autocomplete"), el.name, el.id, el.placeholder,
      el.getAttribute("aria-label"), labelledBy, labels, el.closest("label")?.textContent]
      .filter(Boolean).join(" ").toLowerCase();
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

  function setValue(el, value) {
    if (!el || el.value.trim()) return false;
    el.focus({ preventScroll: true });
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.blur();
    return true;
  }

  async function fill() {
    if (!consentGranted || !profile || busy) return;
    busy = true;
    try {
      const settings = await chrome.storage.local.get({ cardEnabled: true, cardNumber: "4242424242424242", expiryYears: 2, cardCvc: "234" });
      if (!settings.cardEnabled || !/^\d{12,19}$/.test(settings.cardNumber)) return;
      const fields = cardControls();
      if (!Object.values(fields).some(Boolean)) return;
      if (fields.number?.value.trim() && fields.number.value.replace(/\D/g, "") !== settings.cardNumber) return;
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + settings.expiryYears);
      const month = String(expiry.getMonth() + 1).padStart(2, "0");
      const year = String(expiry.getFullYear());
      const number = settings.cardNumber.length === 15
        ? settings.cardNumber.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3")
        : settings.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
      for (const [field, value] of [
        [fields.number, fields.number?.type === "number" ? settings.cardNumber : number],
        [fields.expiry, fields.expiry?.type === "month" ? `${year}-${month}` : `${month}/${year.slice(-2)}`],
        [fields.month, month], [fields.year, year], [fields.cvc, settings.cardCvc],
        [fields.holder, `${profile.first} ${profile.last}`]
      ]) setValue(field, value);
    } finally { busy = false; }
  }

  function scheduleFill() {
    if (!consentGranted) return;
    clearTimeout(timer);
    timer = setTimeout(fill, 180);
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (consentGranted && message.type === "PROFILE_UPDATED") {
      profile = message.profile;
      scheduleFill();
    }
  });
  function loadProfile() {
    chrome.runtime.sendMessage({ type: "GET_PROFILE" }).then((reply) => {
      if (!consentGranted) return;
      profile = reply?.profile || null;
      scheduleFill();
    }).catch(() => {});
  }
  chrome.storage.local.get("consentGranted").then(({ consentGranted: allowed }) => {
    if (allowed !== true) return;
    consentGranted = true;
    loadProfile();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.consentGranted) {
      consentGranted = changes.consentGranted.newValue === true;
      if (consentGranted) loadProfile();
      else { profile = null; clearTimeout(timer); }
    }
    if (changes.resetAt) profile = null;
  });
  new MutationObserver(scheduleFill).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ["class", "style", "hidden", "aria-hidden"]
  });
})();
