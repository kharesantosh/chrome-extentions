
document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('toggle-switch');
    const toggleKnob = document.getElementById('toggle-knob');
    const status = document.getElementById('status');
    const resetBtn = document.getElementById('reset-btn');
    let isDarkMode = false;

    function updateUI() {
        if (isDarkMode) {
            toggleSwitch.classList.add('active');
            toggleKnob.textContent = '🌙';
            status.textContent = 'Current mode: Dark';
        } else {
            toggleSwitch.classList.remove('active');
            toggleKnob.textContent = '☀️';
            status.textContent = 'Current mode: Light';
        }
    }

    function toggleMode() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const domain = new URL(currentTab.url).hostname;
            isDarkMode = !isDarkMode;
            chrome.storage.local.set({ [domain]: isDarkMode ? 'dark' : 'light' });
            chrome.tabs.sendMessage(currentTab.id, {
                action: 'toggleMode',
                mode: isDarkMode ? 'dark' : 'light'
            });
            updateUI();
        });
    }

    function resetMode() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const domain = new URL(currentTab.url).hostname;
            chrome.storage.local.remove([domain]);
            chrome.tabs.sendMessage(currentTab.id, { action: 'resetMode' });
            isDarkMode = false;
            updateUI();
        });
    }

    function initPopup() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const domain = new URL(currentTab.url).hostname;
            chrome.storage.local.get([domain], (result) => {
                isDarkMode = result[domain] === 'dark';
                updateUI();
            });
        });
    }

    toggleSwitch.addEventListener('click', toggleMode);
    resetBtn.addEventListener('click', resetMode);
    initPopup();
});
