
document.getElementById("toggle").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const isDark = document.documentElement.classList.toggle("maza-popup-dark");
      if (isDark) {
        document.documentElement.style.backgroundColor = "#121212";
        document.documentElement.style.color = "#e0e0e0";
      } else {
        document.documentElement.style.backgroundColor = "";
        document.documentElement.style.color = "";
      }
    }
  });
});
