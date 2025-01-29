document.addEventListener("DOMContentLoaded", () => {
    loadButton("#fake-filter", "f1");
    loadButton("#collab-filter", "f2");
    loadButton("#version-filter", "f3");
    loadButton("#unobtained-filter", "f4");
    loadButton("#favorite-filter", "f5");
    loadButton("#arrow-upgrade-filter", "s1");
    loadButton("#auto-collapse-filter", "s2");
    loadButton("#show-empty-filter", "s3");
    loadButton("#hide-category-filter", "s4");
    loadButton("#auto-group-collapse-filter", "s5");
});

function loadButton(buttonID, storageKey) {
    const showEmpty = document.querySelector(buttonID);
    showEmpty.addEventListener("click", () => {
        window.localStorage.setItem(storageKey, showEmpty.classList.toggle("active") ? "0" : "1");
    });
    showEmpty.classList.toggle("active", window.localStorage.getItem(storageKey) === "0");
}