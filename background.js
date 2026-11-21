const profileKey = (tabId) => `checkoutProfile:${tabId}`;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (!Number.isInteger(tabId)) return;
  const key = profileKey(tabId);
  if (message.type === "GET_PROFILE") {
    if (!sender.tab?.url?.toLowerCase().includes("checkout")) { sendResponse({ profile: null }); return; }
    chrome.storage.session.get(key).then((data) => sendResponse({ profile: data[key] || null }));
    return true;
  }
  if (message.type === "SAVE_PROFILE") {
    if (sender.frameId !== 0 || !sender.tab?.url?.toLowerCase().includes("checkout")) { sendResponse({ ok: false }); return; }
    const profile = message.profile;
    if (!profile || typeof profile.first !== "string" || typeof profile.last !== "string" || typeof profile.email !== "string") {
      sendResponse({ ok: false });
      return;
    }
    chrome.storage.session.set({ [key]: profile }).then(() => {
      chrome.tabs.sendMessage(tabId, { type: "PROFILE_UPDATED", profile }).catch(() => {});
      sendResponse({ ok: true });
    });
    return true;
  }
  if (message.type === "CLEAR_PROFILE") {
    chrome.storage.session.remove(key).then(() => sendResponse({ ok: true }));
    return true;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => chrome.storage.session.remove(profileKey(tabId)));

