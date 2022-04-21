const brightnessSelectors = document.querySelectorAll(".brightness-toggle");
let theme = "light";

setTheme(theme);
brightnessSelectors.forEach(selector => selector.addEventListener("click", toggleTheme))

window.onscroll = function () {
    if (window.scrollY >= 50 ) navTopSelector.classList.add("nav-bg");
    else navTopSelector.classList.remove("nav-bg");
};

function toggleTheme() {
    if (theme === "light") {
        setTheme("dark")
    } else {
        setTheme("light");
    }
}

function setTheme(newTheme) {
    if (document.body.className.indexOf(theme) !== -1)
        document.body.className = document.body.className.replace(theme, newTheme);
    else document.body.classList.add(theme);
    theme = newTheme;

    let html = `<i class="bi bi-moon${(newTheme === "light") ? "" : "-fill"}"></i>`
    brightnessSelectors.forEach(selector => selector.innerHTML = html);
    console.debug(`Changed theme to ${newTheme}`);
}