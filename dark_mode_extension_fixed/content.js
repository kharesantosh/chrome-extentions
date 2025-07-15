// Content script for dark/light mode switcher
(function() {
    'use strict';
    
    let darkModeEnabled = false;
    let styleElement = null;
    
    // CSS for dark mode
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
    
    // Enable dark mode
    function enableDarkMode() {
        if (darkModeEnabled) return;
        
        // Create style element if it doesn't exist
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dark-mode-extension-styles';
            styleElement.textContent = darkModeCSS;
            document.head.appendChild(styleElement);
        }
        
        document.documentElement.classList.add('dark-mode-extension');
        darkModeEnabled = true;
        
        console.log('Dark mode enabled');
    }
    
    // Disable dark mode
    function disableDarkMode() {
        if (!darkModeEnabled) return;
        
        document.documentElement.classList.remove('dark-mode-extension');
        darkModeEnabled = false;
        
        console.log('Dark mode disabled');
    }
    
    // Reset mode
    function resetMode() {
        document.documentElement.classList.remove('dark-mode-extension');
        
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
        
        darkModeEnabled = false;
        console.log('Mode reset');
    }
    
    // Initialize based on stored preference
    function initializeMode() {
        const domain = window.location.hostname;
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([domain], (result) => {
                if (result[domain] === 'dark') {
                    enableDarkMode();
                } else if (result[domain] === 'light') {
                    disableDarkMode();
                }
            });
        }
    }
    
    // Listen for messages from popup
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('Message received:', request);
            
            if (request.action === 'toggleMode') {
                if (request.mode === 'dark') {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
                sendResponse({ success: true });
            } else if (request.action === 'resetMode') {
                resetMode();
                sendResponse({ success: true });
            }
        });
    }
    
    // Initialize when DOM is ready
    function init() {
        initializeMode();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('Dark mode extension content script loaded');
})();