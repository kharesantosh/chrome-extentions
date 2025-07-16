
if (document.getElementById('theme-toggle-button')) return;

const svgSun = chrome.runtime.getURL('icons/sun.svg');
const svgMoon = chrome.runtime.getURL('icons/moon.svg');

const button = document.createElement('div');
button.id = 'theme-toggle-button';
button.innerHTML = `<img id="theme-icon" src="${svgSun}" />`;
document.body.appendChild(button);

let isDark = false;
let hideTimeout = null;
let isDragging = false;
let offset = {x: 0, y: 0};

// Load theme and position
chrome.storage.local.get(["themeMode", "themeButtonPos"], ({ themeMode, themeButtonPos }) => {
  isDark = themeMode === "dark";
  applyTheme();
  if (themeButtonPos) {
    button.style.top = themeButtonPos.top;
    button.style.left = themeButtonPos.left;
  }
});

function applyTheme() {
  const root = document.documentElement;
  root.classList.toggle("dark-mode-maza", isDark);
  document.getElementById("theme-icon").src = isDark ? svgMoon : svgSun;
  chrome.storage.local.set({ themeMode: isDark ? "dark" : "light" });
}

button.addEventListener("click", (e) => {
  e.stopPropagation();
  isDark = !isDark;
  applyTheme();
});

document.addEventListener("mousemove", (e) => {
  const x = e.clientX, y = e.clientY;
  if (window.innerWidth - x < 80 && y < 80) {
    button.classList.add("visible");
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => button.classList.remove("visible"), 3000);
  }
});

button.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.clientX - button.offsetLeft;
  offset.y = e.clientY - button.offsetTop;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    chrome.storage.local.set({ themeButtonPos: { top: button.style.top, left: button.style.left } });
  }
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  button.style.left = `${e.clientX - offset.x}px`;
  button.style.top = `${e.clientY - offset.y}px`;
});
