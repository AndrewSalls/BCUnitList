import { parseSnakeCase } from "./category/category-parser.js";

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
    loadButton("#history-filter", "s6");

    window.addEventListener("portLoaded", finishSetup);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function loadButton(buttonID, storageKey) {
    const showEmpty = document.querySelector(buttonID);
    showEmpty.addEventListener("click", () => {
        window.localStorage.setItem(storageKey, showEmpty.classList.toggle("active") ? "0" : "1");
    });
    showEmpty.classList.toggle("active", window.localStorage.getItem(storageKey) === "0");
}

function finishSetup() {
    const selection = document.querySelector("#category-selection");
    selection.classList.add("hidden");
    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES, null, true).then(names => {
        for(const superCategory of Object.keys(names).sort()) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("super-category-wrapper");

            const superKey = `gk-${superCategory}`;
            const superButton = document.createElement("button");
            superButton.type = "button";
            superButton.classList.add("filter-button");
            superButton.classList.add("super-category-button");
            superButton.textContent = parseSnakeCase(superCategory);

            if(!window.localStorage.getItem(superKey)) {
                window.localStorage.setItem(superKey, "1");
            }
            superButton.classList.toggle("active", window.localStorage.getItem(superKey) === "0");
            superButton.addEventListener("click", () => {
                window.localStorage.setItem(superKey, superButton.classList.toggle("active") ? "0" : "1");
            });

            const subWrapper = document.createElement("div");
            subWrapper.classList.add("h-align");
            subWrapper.classList.add("sub-category-wrapper");

            for(const subCategory of Object.keys(names[superCategory]).sort()) {
                const key = `${superCategory}-${subCategory}`;

                const subButton = document.createElement("button");
                subButton.type = "button";
                subButton.classList.add("filter-button");
                subButton.textContent = subCategory;

                if(!window.localStorage.getItem(key)) {
                    window.localStorage.setItem(key, "1");
                }
                subButton.classList.toggle("active", window.localStorage.getItem(key) === "0");
                subButton.addEventListener("click", () => {
                    window.localStorage.setItem(key, subButton.classList.toggle("active") ? "0" : "1");
                });

                subWrapper.appendChild(subButton);
            }

            wrapper.append(superButton, subWrapper);
            selection.appendChild(wrapper);
        }
        selection.classList.remove("hidden");
    });
}