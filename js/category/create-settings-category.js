//@ts-check
import { parseSnakeCase } from "../helper/parse-string.js";

/**
 * Creates a button for filtering a sub-category from category displays.
 * @param {string} superCategoryName The name of the super-category.
 * @param {string} subCategoryName The name of the sub-category.
 * @param {number} localStoragePosition The position of this sub-category in the localStorage for all sub-categories of the provided super-category.
 * @returns {HTMLButtonElement} The created button.
 */
export function createSubCategoryButton(superCategoryName, subCategoryName, localStoragePosition) {
    const key = `gk-${superCategoryName}`;

    const subButton = document.createElement("button");
    subButton.type = "button";
    subButton.classList.add("filter-button");
    subButton.textContent = subCategoryName;

    subButton.classList.toggle("active", window.localStorage.getItem(key)?.charAt(localStoragePosition) === "0");
    subButton.addEventListener("click", () => {
        let previous = window.localStorage.getItem(key);
        if(previous) {
            previous = previous.substring(0, localStoragePosition) + (previous.charAt(localStoragePosition) === "0" ? "1" : "0") + previous.substring(localStoragePosition + 1);
            window.localStorage.setItem(key, previous);
        }
        subButton.classList.toggle("active");
    });

    return subButton;
}

/**
 * Creates a button for filtering a super-category from category displays.
 * @param {string} superCategoryName The name of the super-category to create a button for.
 * @param {string[]} subCategoriesOrder A list of the sub-categories in order. 
 * @returns {HTMLDivElement} An element containing the button for filtering a super-category.
 */
export function createSuperCategoryButton(superCategoryName, subCategoriesOrder) {
    const superKey = `gk-${superCategoryName}`;
    
    const wrapper = document.createElement("div");
    wrapper.classList.add("super-category-wrapper");
    wrapper.id = superKey;

    const superButton = document.createElement("button");
    superButton.type = "button";
    superButton.classList.add("filter-button");
    superButton.classList.add("super-category-button");
    superButton.textContent = parseSnakeCase(superCategoryName);

    superButton.classList.toggle("active", window.localStorage.getItem(superKey)?.charAt(0) === "0");
    superButton.addEventListener("click", () => {
        let previous = window.localStorage.getItem(superKey);
        if(previous) {
            previous = (previous.charAt(0) === "0" ? "1" : "0") + previous.substring(1);
            window.localStorage.setItem(superKey, previous);
        }
        superButton.classList.toggle("active");
    });

    const subWrapper = document.createElement("div");
    subWrapper.classList.add("h-align");
    subWrapper.classList.add("sub-category-wrapper");

    for(let x = 0; x < subCategoriesOrder.length; x++) {
        subWrapper.appendChild(createSubCategoryButton(superCategoryName, subCategoriesOrder[x], x));
    }

    wrapper.append(superButton, subWrapper);
    return wrapper;
}