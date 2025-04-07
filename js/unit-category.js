//@ts-check
import createLoadingBar from "./helper/loading.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";
import createTableOptionModal from "./unit-table/creation/create-table-modal.js";
import * as CategorySelector from "./category/category-selector.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";
import { attachTableOptionsAndFilters, initializeTableModal } from "./unit-table/filter-units.js";
import { getValuesFromRow, observeRowChange } from "./helper/link-row.js";
import createRow from "./unit-table/creation/create-unit-row.js";
import { parseSnakeCase } from "./category/category-parser.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";

const rowRef = [];

/**
 * Initializes page elements once page has loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(CategorySelector.createCategorySelector());
    [...(/** @type {HTMLDivElement} */ (document.querySelector("#base-categories .category-row"))).children].slice(0, -1).forEach(c => c.classList.add("hidden"));
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    document.body.appendChild(createTableOptionModal());
    initializeTableModal();

    window.addEventListener("portLoaded", loadCategories);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function loadCategories() {
    const loadingBar = createLoadingBar(2, () => {
        CategorySelector.allowSelection();
    });

    REQUEST_TYPES.GET_FAVORITED_DATA().then(data => {
        const subWrapper = /** @type {HTMLTableElement} */ (document.querySelector("#favorited-table"));
        subWrapper.classList.add("table-wrapper");

        const favoritedHiddenLabel = document.createElement("p");
        favoritedHiddenLabel.textContent = "Favorited";
        favoritedHiddenLabel.classList.add("hidden");
        subWrapper.appendChild(favoritedHiddenLabel);

        const table = createTableFromData("Favorited", data, loadingBar);
        table.classList.add("favorited-table-marker");
        subWrapper.appendChild(table);
        attachTableOptionsAndFilters(table);

        
        if(window.localStorage.getItem("s4") === "1" || window.localStorage.getItem("s5") === "1") {
            subWrapper.classList.add("hidden");
        }

        loadingBar.increment();
    });

    REQUEST_TYPES.GET_CATEGORY_NAMES().then(categories => {
        if(window.localStorage.getItem("s7") === "0") {
            appendAllCategoryTables(loadingBar, categories);
        } else {
            const categorySearchBuiltin = document.querySelector("#builtin-categories");
            const replaceTable = /** @type {HTMLDivElement} */ (document.querySelector("#favorited-table"));
            document.querySelector("#category-label-centering")?.classList.add("hidden");

            for(const key of Object.keys(categories).sort()) {
                const subButtons = [];

                for(const subCategory of Object.keys(categories[key]).sort()) {
                    const categoryButton = document.createElement("button");
                    categoryButton.type = "button";
                    categoryButton.textContent = parseSnakeCase(subCategory);
                    categoryButton.onclick = () => {
                        replaceTable.innerHTML = "";
                        appendCategoryUnitTable(key, subCategory, replaceTable, categories, loadingBar);
                    };

                    subButtons.push(categoryButton);
                }
                categorySearchBuiltin?.appendChild(CategorySelector.createCategory(parseSnakeCase(key), subButtons));
            }

            loadingBar.increment();
        }
    });
}

/**
 * Creates a table for every non-filtered category.
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar that hides the screen until all tables are loaded.
 * @param {Object} categoryData An object whose keys are super-categories, and values are objects where { key is category, and values are lists of unit ids in that category }.
 */
function appendAllCategoryTables(loadingBar, categoryData) {
    const categoryGrouping = document.querySelector("#builtin-section");
    const categorySearchBuiltin = document.querySelector("#builtin-categories");

    const tables = [];
    for(const key of Object.keys(categoryData).sort()) {
        const superCategory = document.createElement("div");
        superCategory.classList.add("super-category");

        const superCategoryName = document.createElement("h4");
        const superName = parseSnakeCase(key);
        let hidden = false;
        superCategoryName.onclick = () => {
            hidden = !hidden;
            superCategory.querySelectorAll(".table-wrapper").forEach(t => t.classList.toggle("hidden", hidden));
        };
        superCategoryName.textContent = superName;
        superCategory.appendChild(superCategoryName);

        const subButtons = [];
        for(const subCategory of Object.keys(categoryData[key]).sort()) {
            const subWrapper = document.createElement("div");
            subWrapper.classList.add("table-wrapper");

            const nameTemplate = document.createElement("p");
            nameTemplate.classList.add("hidden");
            nameTemplate.textContent = parseSnakeCase(subCategory);
            subWrapper.appendChild(nameTemplate);

            tables.push(appendCategoryUnitTable(key, subCategory, subWrapper, categoryData, loadingBar));

            if(window.localStorage.getItem("s4") === "1" || window.localStorage.getItem("s5") === "1") {
                subWrapper.classList.add("hidden");
                hidden = true;
            }

            subButtons.push(CategorySelector.createCategoryButton(parseSnakeCase(subCategory), subWrapper));
            superCategory.appendChild(subWrapper);
            loadingBar.rincrement();
        }

        categorySearchBuiltin?.appendChild(CategorySelector.createCategory(superName, subButtons));
        categoryGrouping?.appendChild(superCategory);
    }

    Promise.all(tables).then(_ => loadingBar.increment());
}

/**
 * Creates a unit table for a category, and appends it to the provided target.
 * @param {string} superCategory The name of the super-category the category is a part of.
 * @param {string} categoryName The name of the category.
 * @param {Element} target The element to append the table to.
 * @param {Object} categoryData All category data.
 * @param {import("./helper/loading.js").LOADING_BAR} loadingBar A loading bar used to hide the page until all elements are loaded.
 */
async function appendCategoryUnitTable(superCategory, categoryName, target, categoryData, loadingBar) {
    REQUEST_TYPES.GET_MULTIPLE_DATA(categoryData[superCategory][categoryName]).then(data => {
        if(data.length > 0 || window.localStorage.getItem("s3") === "1") {
            const table = createTableFromData(parseSnakeCase(categoryName), data, loadingBar);
            target.appendChild(table);
            attachTableOptionsAndFilters(table);
        } else {
            [...document.querySelectorAll("#builtin-categories button")].find(b => b.textContent === parseSnakeCase(categoryName))?.classList.add("hidden");
        }
    });
}

/**
 * Creates a table from a list of unit data.
 * @param {string} tableName The name of the table.
 * @param {import("./helper/parse-file.js").UNIT_DATA[]} data The data to add to the table.
 * @param {import("./helper/loading.js").LOADING_BAR | null | undefined} loadingBar A loading bar to hide the page until the page elements have loaded.
 * @returns {HTMLDivElement} An element containing the created table.
 */
function createTableFromData(tableName, data, loadingBar) {
    const table = createSearchableTable(tableName, data, REQUEST_TYPES.UPDATE_ID, loadingBar);
    const head = table.querySelector("thead tr");
    const body = /** @type {HTMLTableSectionElement} */ (table.querySelector("tbody"));

    for(const row of body.querySelectorAll("tr")) {
        const id = parseInt(row.querySelector(".row-id")?.textContent ?? "0");
        if(rowRef[id]) {
            rowRef[id].push(row);
        } else {
            rowRef[id] = [row];
        }

        observeRowChange(row, () => syncRowValues(row, id));
    }

    const title = /** @type {Element} */ (table.querySelector(".searchable-table-title"));
    const titleText = title.textContent;
    title.remove();

    const tableTitle = document.createElement("tr");
    const tableTitleText = document.createElement("td");
    tableTitleText.classList.add("composite-title");
    const textH5 = document.createElement("h5");
    textH5.classList.add("table-title-collapser");
    textH5.textContent = titleText;
    tableTitleText.colSpan = 8;

    const nameCollapser = document.createElement("div");
    nameCollapser.classList.add("table-composite-collapser");
    nameCollapser.onclick = () => {
        head?.classList.toggle("hidden");
        body.classList.toggle("hidden");
    };
    if(window.localStorage.getItem("s2") === "1") {
        nameCollapser.click();
    }

    tableTitleText.append(textH5, nameCollapser);
    tableTitle.appendChild(tableTitleText);

    table.querySelector("thead tr")?.insertAdjacentElement("beforebegin", tableTitle);
    return table;
}

/**
 * Updates all rows representing a unit with the same id as the provided row to have the same values.
 * @param {HTMLTableRowElement} row The row to copy values from.
 * @param {number} id The ID of the unit that is being updated in all referencing rows.
 */
function syncRowValues(row, id) {
    if(rowRef[id].length > 1) {
        if(row.querySelector(".fav-icon")?.parentElement?.dataset.favorited === "0") {
            const remain = [], removed = [];
            for(const entry of rowRef[id]) {
                if(entry.parentElement.parentElement.parentElement.classList.contains("favorited-table-marker")) {
                    removed.push(entry);
                } else {
                    remain.push(entry);
                }
            }

            for(const favTableElm of removed) {
                favTableElm.parentElement.removeChild(favTableElm);
            }
            rowRef[id] = remain;
        }

        const values = getValuesFromRow(row);
        rowRef[id].forEach((/** @type {any} */ r) => {
            if(r !== row) {
                copyUpdatedValues(values, r);
            }
        });
    } else if(row.querySelector(".fav-icon")?.parentElement?.dataset.favorited === "1") {
        //@ts-ignore Parsing awkwardness since values cannot start uninitialized.
        const values = /** @type {import("./helper/parse-file.js").UNIT_DATA} */ (/** @type {unknown} */ (getValuesFromRow(row)));
        values.collab = row.dataset.is_collab === "Y";
        values.unobtainable = row.dataset.is_unobtainable === "Y";
        values.in_EN = row.dataset.in_en === "Y";

        const nameBox = /** @type {HTMLTableCellElement} */ (row.querySelector(".row-name"));
        values.normal_form = nameBox.dataset.normal_name ?? null;
        values.evolved_form = nameBox.dataset.evolved_name ?? null;
        values.true_form = nameBox.dataset.true_name ?? null;
        values.ultra_form = nameBox.dataset.ultra_name ?? null;
        values.max_form = parseInt(/** @type {HTMLTableCellElement} */ (row.querySelector(".row-image")).dataset.max_form ?? "0");

        values.level_cap = {
            Type: "INTERNAL",
            MaxLevel: parseInt(/** @type {HTMLInputElement} */ (row.querySelector(".row-level .max-level")).max),
            MaxPlusLevel: parseInt(/** @type {HTMLInputElement} */ (row.querySelector(".row-level .max-plus-level")).max ?? 0)
        };

        //@ts-ignore Parsing awkwardness since values is actually a UUNIT_RECORD, which stores talents as number[]
        values.talents = /** @type {NodeListOf<HTMLDivElement>} */ ([...row.querySelectorAll(".regular-talent")]).map((/** @type {HTMLDivElement} */ t, /** @type {number} */ i) => {
            return {
                name: t.querySelector("img")?.src.replace(/.+\//, "").replace(".png", ""),
                cap: t.dataset.max,
                value: values.talents[i]
            };
        });
        //@ts-ignore Parsing awkwardness since values is actually a UUNIT_RECORD, which stores talents as number[]
        values.ultra_talents = /** @type {NodeListOf<HTMLDivElement>} */ ([...row.querySelectorAll(".ultra-talent")]).map((/** @type {HTMLDivElement} */ t, /** @type {number} */ i) => {
            return {
                name: t.querySelector("img")?.src.replace(/.+\//, "").replace(".png", ""),
                cap: t.dataset.max,
                value: values.ultra_talents[i]
            };
        });
        
        const newRow = createRow(values);
        document.querySelector("#favorited-table tbody")?.appendChild(newRow);
        observeRowChange(newRow, () => syncRowValues(newRow, id));
        rowRef[id].push(newRow);
    }
};

/**
 * Copies values taken from a category's unit table and pastes them into a provided different unit table to sync.
 * @param {import("./helper/parse-file.js").UNIT_RECORD} values The values to copy into a table.
 * @param {HTMLDivElement} toUpdate The element containing the table to update with new values.
 */
function copyUpdatedValues(values, toUpdate) {    
    /** @type {HTMLDivElement} */ (toUpdate.querySelector(".row-image")).dataset.form = `${values.current_form}`;
    const image = /** @type {HTMLImageElement} */ (toUpdate.querySelector(".unit-icon"));
    image.src = image.src.replace(/[0-9]+(?=\.png)/, `${values.current_form}`);
    
    const nameDiv = /** @type {HTMLTableCellElement} */ (toUpdate.querySelector(".row-name"));
    nameDiv.textContent = [nameDiv.dataset.normal_name, nameDiv.dataset.evolved_name, nameDiv.dataset.true_name, nameDiv.dataset.ultra_name][values.current_form] ?? null;

    /** @type {HTMLInputElement} */ (toUpdate.querySelector(".max-level")).value = `${values.level}`;
    const pluslevel = /** @type {HTMLInputElement} */ (toUpdate.querySelector(".max-plus-level"));
    if(pluslevel) {
        pluslevel.value = `${values.plus_level}`;
    }

    const talents = /** @type {NodeListOf<HTMLDivElement>} */ (toUpdate.querySelectorAll(".regular-talent"));
    for(let x = 0; x < talents.length; x++) {
        /** @type {HTMLParagraphElement} */ (talents[x].querySelector(".talent-level")).textContent = `${values.talents[x]}`;
        talents[x].classList.toggle("maxed-talent", `${values.talents[x]}` === talents[x].dataset.max);
    }
    const ultraTalents = /** @type {NodeListOf<HTMLDivElement>} */ (toUpdate.querySelectorAll(".ultra-talent"));
    for(let x = 0; x < ultraTalents.length; x++) {
        /** @type {HTMLParagraphElement} */ (ultraTalents[x].querySelector(".talent-level")).textContent = `${values.ultra_talents[x]}`;
        ultraTalents[x].classList.toggle("maxed-talent", `${values.ultra_talents[x]}` === ultraTalents[x].dataset.max);
    }

    const orbs = toUpdate.querySelectorAll(".orb-selector");
    for(let x = 0; x < orbs.length; x++) {
        const trait = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-color"));
        const type = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-type"));
        const rank = /** @type {HTMLImageElement} */ (orbs[x].querySelector(".orb-rank"));

        if(!values.orb[x]) {
            trait.dataset.trait = "";
            trait.src = "./assets/img/orb/empty-orb.png";

            type.classList.add("invisible");
            type.dataset.type = "";
            type.src = "";

            rank.classList.add("invisible");
            rank.dataset.rank = "";
            rank.src = "";
        } else {
            trait.dataset.trait = `${values.orb[x]?.trait}`;
            trait.src = `./assets/img/orb/${values.orb[x]?.trait}.png`;
    
            type.dataset.type = `${values.orb[x]?.type}`;
            type.src = `./assets/img/orb/${values.orb[x]?.type}.png`;
            type.classList.remove("invisible");
    
            rank.dataset.rank = `${values.orb[x]?.rank}`;
            rank.src = `./assets/img/orb/${values.orb[x]?.rank}.png`;
            rank.classList.remove("invisible");
        }
    }

    /** @type {HTMLDivElement} */ (toUpdate.querySelector(".fav-wrapper")).dataset.favorited = values.favorited ? "1" : "0";
    /** @type {HTMLImageElement} */ (toUpdate.querySelector(".fav-icon")).src = `./assets/img/fav-${values.favorited ? "full" : "empty"}.png`;
}