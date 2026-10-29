const tokenField = document.querySelector("#token");
const textField = document.querySelector("#text");
const status = document.querySelector("#status");
const APP = "http://localhost:3010";

chrome.storage.local.get("token", ({ token }) => {
  if (token) tokenField.value = token;
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.id) return;
  chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => getSelection()?.toString() ?? "" }, (results) => {
    const selected = results?.[0]?.result;
    if (selected && !textField.value) textField.value = selected;
  });
});

document.querySelector("#save").addEventListener("click", async () => {
  const token = tokenField.value.trim();
  const text = textField.value.trim();
  status.textContent = "";
  if (!token || !text) {
    status.textContent = "Add the token and the posting.";
    return;
  }
  await chrome.storage.local.set({ token });
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  try {
    const response = await fetch(`${APP}/api/capture`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ text, url: tab?.url ?? "" }),
    });
    const body = await response.json().catch(() => ({}));
    status.textContent = response.ok ? "Saved. Open Applications in Offer Letter." : body.error || "Offer Letter didn't accept that.";
  } catch {
    status.textContent = "Offer Letter isn't running at localhost:3010.";
  }
});
