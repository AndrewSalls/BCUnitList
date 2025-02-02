import { parseSnakeCase } from "./category-parser.js";

export function createSubCategoryButton(superCategoryName, subCategoryName) {
    const key = `${superCategoryName}-${subCategoryName}`;

    const subButton = document.createElement("button");
    subButton.type = "button";
    subButton.classList.add("filter-button");
    subButton.textContent = subCategoryName;

    if(!window.localStorage.getItem(key)) {
        window.localStorage.setItem(key, "1");
    }
    subButton.classList.toggle("active", window.localStorage.getItem(key) === "0");
    subButton.addEventListener("click", () => {
        window.localStorage.setItem(key, subButton.classList.toggle("active") ? "0" : "1");
    });

    return subButton;
}

export function createSuperCategoryButton(superCategoryName, categoryData) {
    const superKey = `gk-${superCategoryName}`;
    
    const wrapper = document.createElement("div");
    wrapper.classList.add("super-category-wrapper");
    wrapper.id = superKey;

    const superButton = document.createElement("button");
    superButton.type = "button";
    superButton.classList.add("filter-button");
    superButton.classList.add("super-category-button");
    superButton.textContent = parseSnakeCase(superCategoryName);

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

    for(const subCategory of Object.keys(categoryData[superCategoryName]).sort()) {
        subWrapper.appendChild(createSubCategoryButton(superCategoryName, subCategory));
    }

    wrapper.append(superButton, subWrapper);
    return wrapper;
}