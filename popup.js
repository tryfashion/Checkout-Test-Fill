const { t } = globalThis.CHECKOUT_I18N;
let consentGranted = false;
function renderLanguage() {
  const i18n = globalThis.CHECKOUT_I18N;
  document.documentElement.lang = i18n.language.replace("_", "-");
  document.title = t("popupTitle");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) el.placeholder = t(el.dataset.i18nPlaceholder);
  document.getElementById("uiLanguage").value = i18n.preference;
}
renderLanguage();
const status = document.getElementById("status");
const country = document.getElementById("country");
const state = document.getElementById("state");
const cardEnabled = document.getElementById("cardEnabled");
const cardNumber = document.getElementById("cardNumber");
const customCard = document.getElementById("customCard");
const moveUp = document.getElementById("moveUp");
const moveDown = document.getElementById("moveDown");
const removeCard = document.getElementById("removeCard");
const addCard = document.getElementById("addCard");
const sortCards = document.getElementById("sortCards");
const expiryYears = document.getElementById("expiryYears");
const cardCvc = document.getElementById("cardCvc");
const fill = document.getElementById("fill");
const save = document.getElementById("save");
const clearData = document.getElementById("clearData");
const uiLanguage = document.getElementById("uiLanguage");
const defaultCards = ["4242424242424242", "5555555555554444", "4000002760003184"];
let cardNumbers = [...defaultCards];
function renderConsent() {
  fill.textContent = t("generateAndFill");
  fill.disabled = !consentGranted;
}
uiLanguage.addEventListener("change", async () => {
  globalThis.CHECKOUT_I18N.setLanguage(uiLanguage.value);
  await chrome.storage.local.set({ uiLanguage: uiLanguage.value });
});
addEventListener("checkout-language-changed", () => {
  renderLanguage();
  renderConsent();
  renderCards();
  refreshStatus();
});

function formatCard(number) {
  if (number.length === 15) return number.replace(/^(\d{4})(\d{6})(\d{5})$/, "$1 $2 $3");
  return number.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function renderCards(selected = cardNumber.value) {
  cardNumber.replaceChildren();
  for (const number of cardNumbers) {
    const prefix = number === defaultCards[0] ? t("officialVisa") : number === defaultCards[1] ? t("officialMastercard") : number === defaultCards[2] ? t("official3ds") : t("customPrefix");
    cardNumber.add(new Option(prefix + formatCard(number), number));
  }
  cardNumber.value = cardNumbers.includes(selected) ? selected : cardNumbers[0];
}

function moveCard(direction) {
  const index = cardNumbers.indexOf(cardNumber.value);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= cardNumbers.length) return;
  [cardNumbers[index], cardNumbers[next]] = [cardNumbers[next], cardNumbers[index]];
  renderCards(cardNumbers[next]);
}

const states = { AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California", CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina", SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont", VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming" };
for (const [code, label] of Object.entries(states)) state.add(new Option(label, code));

chrome.storage.local.get({ country: "US", state: "CA", cardEnabled: true, cardNumber: "4242424242424242", cardNumbers: defaultCards, added3dsCard: false, expiryYears: 2, cardCvc: "234" }, (settings) => {
  const { country: savedCountry, state: savedState } = settings;
  country.value = savedCountry;
  state.value = savedState;
  cardEnabled.checked = settings.cardEnabled;
  cardNumbers = [...new Set((Array.isArray(settings.cardNumbers) ? settings.cardNumbers : defaultCards).filter((number) => /^\d{12,19}$/.test(number)))];
  if (/^\d{12,19}$/.test(settings.cardNumber) && !cardNumbers.includes(settings.cardNumber)) cardNumbers.push(settings.cardNumber);
  if (!cardNumbers.length) cardNumbers = [...defaultCards];
  if (!settings.added3dsCard) {
    if (!cardNumbers.includes(defaultCards[2])) cardNumbers.push(defaultCards[2]);
    chrome.storage.local.set({ cardNumbers, added3dsCard: true });
  }
  renderCards(settings.cardNumber);
  expiryYears.value = settings.expiryYears;
  cardCvc.value = settings.cardCvc;
});

moveUp.addEventListener("click", () => moveCard(-1));
moveDown.addEventListener("click", () => moveCard(1));
removeCard.addEventListener("click", () => {
  if (cardNumbers.length === 1) { status.textContent = t("keepCard"); return; }
  cardNumbers = cardNumbers.filter((number) => number !== cardNumber.value);
  renderCards();
});
addCard.addEventListener("click", () => {
  const number = customCard.value.replace(/[\s-]/g, "");
  if (!/^\d{12,19}$/.test(number)) { status.textContent = t("invalidCard"); return; }
  if (cardNumbers.includes(number)) { status.textContent = t("duplicateCard"); return; }
  cardNumbers.push(number);
  renderCards(number);
  customCard.value = "";
  status.textContent = t("cardAdded");
});
sortCards.addEventListener("click", () => {
  const selected = cardNumber.value;
  cardNumbers.sort((a, b) => a.localeCompare(b));
  renderCards(selected);
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function refreshStatus() {
  if (!consentGranted) { status.textContent = t("enableOnPage"); return; }
  const tab = await activeTab();
  if (!tab?.url || !tab.url.toLowerCase().includes("checkout")) {
    status.textContent = t("notCheckout");
    fill.disabled = true;
    return;
  }
  try {
    const reply = await chrome.tabs.sendMessage(tab.id, { type: "STATUS" }, { frameId: 0 });
    status.textContent = reply?.message || t("connected");
    fill.disabled = false;
  } catch {
    status.textContent = t("refreshPage");
  }
}

fill.addEventListener("click", async () => {
  if (!consentGranted) return;
  const tab = await activeTab();
  status.textContent = t("generating");
  try {
    const reply = await chrome.tabs.sendMessage(tab.id, { type: "FILL", force: true }, { frameId: 0 });
    status.textContent = reply.message;
  } catch {
    status.textContent = t("connectionFailed");
  }
});

save.addEventListener("click", async () => {
  const years = Number(expiryYears.value);
  const cvc = cardCvc.value.trim();
  if (!Number.isInteger(years) || years < 1 || years > 10 || !/^\d{3,4}$/.test(cvc)) {
    status.textContent = t("invalidExpiryCvc");
    return;
  }
  await chrome.storage.local.set({ country: country.value, state: state.value, cardEnabled: cardEnabled.checked, cardNumber: cardNumber.value, cardNumbers, expiryYears: years, cardCvc: cvc });
  status.textContent = t(state.value === "CA" ? "savedCA" : "savedOther");
});

clearData.addEventListener("click", async () => {
  await chrome.storage.local.clear();
  await chrome.storage.session.clear();
  await chrome.storage.local.set({ resetAt: Date.now() });
  consentGranted = false;
  renderConsent();
  status.textContent = t("enableOnPage");
});

renderConsent();
chrome.storage.local.get("consentGranted").then((settings) => {
  consentGranted = settings.consentGranted === true;
  renderConsent();
  refreshStatus();
});
