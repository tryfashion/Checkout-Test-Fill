const { t } = globalThis.CHECKOUT_I18N;
function renderLanguage() {
  document.documentElement.lang = globalThis.CHECKOUT_I18N.language.replace("_", "-");
  document.title = t("privacyTitle");
  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
}
renderLanguage();
addEventListener("checkout-language-changed", renderLanguage);
