//@ts-check
import * as CategorySelector from "./category/category-selector.js";
import createTableFromData, { createAbilityTableFromData } from "./unit-table/creation/create-cost-table.js";
import createLoadingBar from "./helper/loading.js";
import { parseSnakeCase } from "./helper/parse-string.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import { RARITY } from "./data/unit-data.js";
import SETTINGS from "../assets/settings.js";

/**
 * Initializes page elements once page has loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(CategorySelector.createCategorySelector(true));

    window.addEventListener("portLoaded", loadCosts);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function loadCosts() {
    const container = document.querySelectorAll(".default-table");
    const loadingBar = createLoadingBar(10, () => {
        CategorySelector.allowSelection();
    });
    
    if(window.localStorage.getItem("s7") === "0") {

        attachTotalCostTable(container[0], loadingBar);
        REQUEST_TYPES.GET_UPGRADE_COST().then(data => {
            container[1].appendChild(createAbilityTableFromData(data));
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.NORMAL).then(data => {
            const table = createTableFromData(data, "Normal");
            table.classList.add("normal-color");
            container[2].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.SPECIAL).then(data => {
            const table = createTableFromData(data, "Special");
            table.classList.add("special-color");
            container[3].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.RARE).then(data => {
            const table = createTableFromData(data, "Rare");
            table.classList.add("rare-color");
            container[4].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.SUPER_RARE).then(data => {
            const table = createTableFromData(data, "Super Rare");
            table.classList.add("super-rare-color");
            container[5].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.UBER_RARE).then(data => {
            const table = createTableFromData(data, "Uber Rare");
            table.classList.add("uber-rare-color");
            container[6].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_RARITY_COST(RARITY.LEGEND_RARE).then(data => {
            const table = createTableFromData(data, "Legend Rare");
            table.classList.add("legend-rare-color");
            table.querySelector(".collapsible")?.classList.add("legend-rare-multi");
            container[7].appendChild(table);
            loadingBar.increment();
        });
        REQUEST_TYPES.GET_FAVORITED_COST().then(data => {
            const table = createTableFromData(data, "Favorited");
            container[8].appendChild(table);
            loadingBar.increment();
        });

        REQUEST_TYPES.GET_CATEGORIES().then(categories => {
            attachAllCategoryCostTables(loadingBar, categories);
            loadingBar.increment();
        });
    } else {
        bindGenericCategories(loadingBar);

        REQUEST_TYPES.GET_CATEGORIES().then(categories => {
            const categorySearchBuiltin = document.querySelector("#builtin-categories");
            document.querySelector("#category-label-centering")?.classList.add("hidden");

            const waitArray = [];
            for(const key of Object.keys(categories).sort()) {
                const subButtons = [];
                const superName = parseSnakeCase(key);

                for(const subCategory of Object.keys(categories[key]).sort()) {
                    const categoryButton = CategorySelector.createCategoryButton(parseSnakeCase(subCategory), container[7]);
                    categoryButton.onclick = () => {
                        container[7].innerHTML = "";
                        container[7].classList.remove("hidden");
                        attachCategoryCostTable(key, subCategory, container[7], categories);
                    };

                    subButtons.push(categoryButton);
                    if(window.localStorage.getItem("s3") === "0") {
                        waitArray.push(REQUEST_TYPES.IS_ANY_UNFILTERED(categories[key][subCategory]).then(res => categoryButton.classList.toggle("hidden", !res)));
                    }
                }

                categorySearchBuiltin?.appendChild(CategorySelector.createCategory(superName, subButtons));
            }
            
            REQUEST_TYPES.GET_FAVORITED_COST().then(data => {
                const table = createTableFromData(data, "Favorited");
                container[7].appendChild(table);
                loadingBar.rincrement();
            });

            Promise.all(waitArray).then(_res => loadingBar.increment());
        });
    }
}

/**
 * Creates a cost table for every unfiltered category and adds them to the page.
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar that hides the page until content has finished loading.
 * @param {import("./data/category-data.js").CATEGORY_MAP} categoryData An object containing all categories.
 */
function attachAllCategoryCostTables(loadingBar, categoryData) {
    const categoryGrouping = document.querySelector("#category-grouping");
    const categorySearchBuiltin = document.querySelector("#builtin-categories");

    for(const key of Object.keys(categoryData).sort()) {
        const superCategory = document.createElement("div");
        superCategory.classList.add("super-category");

        const superCategoryName = document.createElement("h4");
        const superName = parseSnakeCase(key);
        let hidden = false;
        superCategoryName.onclick = () => {
            hidden = !hidden;
            superCategory.querySelectorAll(".generic-table").forEach(t => t.parentElement?.classList.toggle("hidden", hidden));
        };
        superCategoryName.textContent = superName;
        superCategory.appendChild(superCategoryName);

        const subButtons = [];
        for(const subCategory of Object.keys(categoryData[key]).sort()) {
            const subWrapper = document.createElement("div");

            attachCategoryCostTable(key, subCategory, subWrapper, categoryData);

            subButtons.push(CategorySelector.createCategoryButton(parseSnakeCase(subCategory), subWrapper));
            superCategory.appendChild(subWrapper);

            if(window.localStorage.getItem("s5") === "1") {
                subWrapper.classList.toggle("hidden", true);
                hidden = true;
            }

            loadingBar.rincrement();
        }

        categorySearchBuiltin?.appendChild(CategorySelector.createCategory(superName, subButtons));
        categoryGrouping?.appendChild(superCategory);
    }
}

/**
 * Creates a cost table for a specific category.
 * @param {string} superCategory The name of the category's super-category.
 * @param {string} categoryName The name of the category.
 * @param {Element} target An element to append the cost table to.
 * @param {import("./data/category-data.js").CATEGORY_MAP} categoryData An object containing all of the category data.
 */
function attachCategoryCostTable(superCategory, categoryName, target, categoryData) {
    REQUEST_TYPES.GET_MULTIPLE_COST(categoryData[superCategory][categoryName]).then(data => {
        if(data.has_units || window.localStorage.getItem("s3") === "1") {
            const table = createTableFromData(data, categoryName);
            table.classList.add("generic-table");
            table.querySelector(".collapsible")?.insertAdjacentElement("afterbegin", createIconList(categoryData[superCategory][categoryName]));
            target.appendChild(table);
        } else {
            target.classList.add("hidden");
            [...document.querySelectorAll("#builtin-categories button")].find(b => b.textContent === parseSnakeCase(categoryName))?.classList.add("hidden");
        }
    });
}

/**
 * Creates an element that holds all of the unit icons for a category's cost table.
 * @param {number[]} idList The IDs of the units to fetch.
 * @returns {HTMLDivElement} The element that was created.
 */
function createIconList(idList) {
    const superWrapper = document.createElement("div");
    superWrapper.classList.add("category-icon-list");

    const wrapper = document.createElement("div");
    REQUEST_TYPES.GET_MULTIPLE_DATA(idList, true).then(unitList => {
        for(const unit of unitList) {
            const iconIMG = document.createElement("img");
            if(SETTINGS.skipImages.includes(unit.id)) {
                iconIMG.src = "./assets/img/unit_icon/unknown.png";
            } else {
                iconIMG.src = `./assets/img/unit_icon/${unit.id}_${unit.current_form}.png`;
            }
            iconIMG.onerror = () => iconIMG.src = "./assets/img/unit_icon/unknown.png";
            iconIMG.title = [unit.normal_form, unit.evolved_form, unit.true_form, unit.ultra_form][unit.current_form] ?? "";
            wrapper.appendChild(iconIMG);
        }
    });

    superWrapper.appendChild(wrapper);
    return superWrapper
}

/**
 * Attaches a cost table of all units to the provided element.
 * @param {Element} target The element to attach the table to.
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar that hides the page until content has finished loading.
 */
function attachTotalCostTable(target, loadingBar) {
    REQUEST_TYPES.GET_ALL_COST().then(data => {
        const table = createTableFromData(data, "All Units");
        table.classList.add("generic-table");
        target.appendChild(table);
        loadingBar.increment();
    });
}

/**
 * Initializes select categories generic category buttons to load the category in single category mode
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar that hides the page until content has finished loading.
 */
function bindGenericCategories(loadingBar) {
    const buttons = /** @type {HTMLButtonElement[]} */ ([...document.querySelectorAll("#base-categories button")]);
    const container = document.querySelectorAll(".default-table")[7];

    buttons[0].onclick = () => attachTotalCostTable(container, loadingBar);
    loadingBar.increment();
    buttons[1].onclick = () => {
        REQUEST_TYPES.GET_UPGRADE_COST().then(data => {
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(createAbilityTableFromData(data));
        });
    };
    loadingBar.increment();
    buttons[2].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.NORMAL).then(data => {
            const table = createTableFromData(data, "Normal");
            table.classList.add("normal-color");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[3].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.SPECIAL).then(data => {
            const table = createTableFromData(data, "Special");
            table.classList.add("special-color");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[4].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.RARE).then(data => {
            const table = createTableFromData(data, "Rare");
            table.classList.add("rare-color");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[5].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.SUPER_RARE).then(data => {
            const table = createTableFromData(data, "Super Rare");
            table.classList.add("super-rare-color");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[6].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.UBER_RARE).then(data => {
            const table = createTableFromData(data, "Uber Rare");
            table.classList.add("uber-rare-color");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[7].onclick = () => {
        REQUEST_TYPES.GET_RARITY_COST(RARITY.LEGEND_RARE).then(data => {
            const table = createTableFromData(data, "Legend Rare");
            table.classList.add("legend-rare-color");
            table.querySelector(".collapsible")?.classList.add("legend-rare-multi");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
    buttons[8].onclick = () => {
        REQUEST_TYPES.GET_FAVORITED_COST().then(data => {
            const table = createTableFromData(data, "Favorited");
            container.innerHTML = "";
            container.classList.remove("hidden");
            container.appendChild(table);
        });
    };
    loadingBar.increment();
}