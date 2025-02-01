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

const rowRef = [];

window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(CategorySelector.createCategorySelector());
    [...document.querySelector("#base-categories").querySelector(".category-row").children].slice(0, -1).forEach(c => c.classList.add("hidden"));
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    document.body.appendChild(createTableOptionModal());
    initializeTableModal();

    window.addEventListener("portLoaded", loadCategories);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function loadCategories() {
    const loadingBar = createLoadingBar(2, () => {
        document.querySelectorAll("section .sort-id").forEach(s => s.click());
        CategorySelector.allowSelection();
    });

    makeRequest(REQUEST_TYPES.GET_FAVORITED_DATA, null).then(data => {
        const subWrapper = document.querySelector("#favorited-table");
        subWrapper.classList.add("table-wrapper");

        const table = createTableFromData("Favorited", data, loadingBar);
        table.classList.add("favorited-table-marker");
        subWrapper.appendChild(table);
        attachTableOptionsAndFilters(table);

        
        if(window.localStorage.getItem("s4") === "1" || window.localStorage.getItem("s5") === "1") {
            subWrapper.classList.add("hidden");
        }

        loadingBar.increment();
    });

    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES, null).then(categories => {
        if(window.localStorage.getItem("s7") === "0") {
            createAllCategoryTables(loadingBar, categories);
        } else {
            const categorySearchBuiltin = document.querySelector("#builtin-categories");
            const replaceTable = document.querySelector("#favorited-table");
            document.querySelector("#category-label-centering").classList.add("hidden");

            for(const key of Object.keys(categories).sort()) {
                const subButtons = [];

                for(const subCategory of Object.keys(categories[key]).sort()) {
                    const categoryButton = document.createElement("button");
                    categoryButton.type = "button";
                    categoryButton.textContent = parseSnakeCase(subCategory);
                    categoryButton.onclick = () => {
                        replaceTable.innerHTML = "";
                        createCategoryUnitTable(key, subCategory, replaceTable, categories, loadingBar);
                    };

                    subButtons.push(categoryButton);
                }
                categorySearchBuiltin.appendChild(CategorySelector.createCategory(parseSnakeCase(key), subButtons));
            }

            loadingBar.increment();
        }
    });
}

function createAllCategoryTables(loadingBar, categoryData) {
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

            tables.push(createCategoryUnitTable(key, subCategory, subWrapper, categoryData, loadingBar));

            if(window.localStorage.getItem("s4") === "1" || window.localStorage.getItem("s5") === "1") {
                subWrapper.classList.add("hidden");
                hidden = true;
            }

            subButtons.push(CategorySelector.createCategoryButton(parseSnakeCase(subCategory), subWrapper));
            superCategory.appendChild(subWrapper);
            loadingBar.rincrement();
        }

        categorySearchBuiltin.appendChild(CategorySelector.createCategory(superName, subButtons));
        categoryGrouping.appendChild(superCategory);
    }

    Promise.all(tables).then(_ => loadingBar.increment());
}

async function createCategoryUnitTable(superCategory, categoryName, target, categoryData, loadingBar) {
    return makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, categoryData[superCategory][categoryName]).then(data => {
        if(data.length > 0 || window.localStorage.getItem("s3") === "1") {
            const table = createTableFromData(parseSnakeCase(categoryName), data, loadingBar);
            target.appendChild(table);
            attachTableOptionsAndFilters(table);
        } else {
            [...document.querySelectorAll("#builtin-categories button")].find(b => b.textContent === parseSnakeCase(categoryName)).classList.add("hidden");
        }
    });
}

function createTableFromData(tableName, data, loadingBar) {
    const table = createSearchableTable(tableName, data, loadingBar);
    const head = table.querySelector("thead tr");
    const body = table.querySelector("tbody");

    for(const row of body.querySelectorAll("tr")) {
        const id = parseInt(row.querySelector(".row-id").textContent);
        if(rowRef[id]) {
            rowRef[id].push(row);
        } else {
            rowRef[id] = [row];
        }

        observeRowChange(row, () => syncRowValues(row, id));
    }

    const title = table.removeChild(table.querySelector("h2"));

    const tableTitle = document.createElement("tr");
    const tableTitleText = document.createElement("td");
    tableTitleText.classList.add("composite-title");
    const textH5 = document.createElement("h5");
    textH5.classList.add("table-title-collapser");
    textH5.textContent = title.textContent;
    tableTitleText.colSpan = "8";

    const nameCollapser = document.createElement("div");
    nameCollapser.classList.add("table-composite-collapser");
    nameCollapser.onclick = () => {
        head.classList.toggle("hidden");
        body.classList.toggle("hidden");
    };
    if(window.localStorage.getItem("s2") === "1") {
        nameCollapser.click();
    }

    tableTitleText.append(textH5, nameCollapser);
    tableTitle.appendChild(tableTitleText);

    table.querySelector("thead tr").insertAdjacentElement("beforebegin", tableTitle);
    return table;
}

function syncRowValues(row, id) {
    if(rowRef[id].length > 1) {
        if(row.querySelector(".fav-icon").parentElement.dataset.favorited === "0") {
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
        values.name = row.querySelector(".row-name").textContent;
        rowRef[id].forEach(r => {
            if(r !== row) {
                copyUpdatedValues(values, r);
            }
        });
    } else if(row.querySelector(".fav-icon").parentElement.dataset.favorited === "1") {
        const values = getValuesFromRow(row);
        values.collab = row.dataset.is_collab;
        values.unobtainable = row.dataset.is_unobtainable;
        values.in_EN = row.dataset.in_en;

        const nameBox = row.querySelector(".row-name");
        values.normal_form = nameBox.dataset.normal_name;
        values.evolved_form = nameBox.dataset.evolved_name;
        values.true_form = nameBox.dataset.true_name;
        values.ultra_form = nameBox.dataset.ultra_name;
        values.max_form = row.querySelector(".row-image").dataset.max_form;

        values.level_cap = {
            MaxLevel: row.querySelector(".row-level .max-level").max,
            MaxPlusLevel: row.querySelector(".row-level .max-plus-level")?.max ?? 0
        };

        values.talents = [...row.querySelectorAll(".regular-talent")].map((t, i) => {
            return {
                name: t.querySelector("img").src.replace(/.+\//, "").replace(".png", ""),
                cap: t.dataset.max,
                value: values.talents[i]
            };
        });
        values.ultra_talents = [...row.querySelectorAll(".ultra-talent")].map((t, i) => {
            return {
                name: t.querySelector("img").src.replace(/.+\//, "").replace(".png", ""),
                cap: t.dataset.max,
                value: values.ultra_talents[i]
            };
        });
        
        const newRow = createRow(values);
        document.querySelector("#favorited-table tbody").appendChild(newRow);
        observeRowChange(newRow, () => syncRowValues(newRow, id));
        rowRef[id].push(newRow);
    }
};

function copyUpdatedValues(values, toUpdate) {    
    toUpdate.querySelector(".row-image").dataset.form = values.current_form;
    const image = toUpdate.querySelector(".unit-icon");
    image.src = image.src.replace(/[0-9]+(?=\.png)/, `${values.current_form}`);
    
    toUpdate.querySelector(".row-name").textContent = values.name;

    toUpdate.querySelector(".max-level").value = values.level;
    const pluslevel = toUpdate.querySelector(".max-plus-level");
    if(pluslevel) {
        pluslevel.value = values.plus_level;
    }

    const talents = toUpdate.querySelectorAll(".regular-talent");
    for(let x = 0; x < talents.length; x++) {
        talents[x].querySelector(".talent-level").textContent = values.talents[x];
        talents[x].classList.toggle("maxed-talent", `${values.talents[x]}` === talents[x].dataset.max);
    }
    const ultraTalents = toUpdate.querySelectorAll(".ultra-talent");
    for(let x = 0; x < ultraTalents.length; x++) {
        ultraTalents[x].querySelector(".talent-level").textContent = values.ultra_talents[x];
        ultraTalents[x].classList.toggle("maxed-talent", `${values.ultra_talents[x]}` === ultraTalents[x].dataset.max);
    }

    const orbs = toUpdate.querySelectorAll(".orb-selector");
    for(let x = 0; x < orbs.length; x++) {
        const trait = orbs[x].querySelector(".orb-color");
        const type = orbs[x].querySelector(".orb-type");
        const rank = orbs[x].querySelector(".orb-rank");

        if(values.orb[x] === null) {
            trait.dataset.trait = "none";
            trait.src = "./assets/img/orb/empty-orb.png";

            type.classList.add("invisible");
            type.dataset.type = "none";
            type.src = "";

            rank.classList.add("invisible");
            rank.dataset.rank = "none";
            rank.src = "";

            continue;
        }
        
        trait.dataset.trait = values.orb[x].trait;
        trait.src = `./assets/img/orb/${values.orb[x].trait}.png`;

        type.dataset.type = values.orb[x].type;
        type.src = `./assets/img/orb/${values.orb[x].type}.png`;
        type.classList.remove("invisible");

        rank.dataset.rank = values.orb[x].rank;
        rank.src = `./assets/img/orb/${values.orb[x].rank}.png`;
        rank.classList.remove("invisible");
    }

    toUpdate.querySelector(".fav-wrapper").dataset.favorited = values.favorited ? "1" : "0";
    toUpdate.querySelector(".fav-icon").src = `./assets/img/fav-${values.favorited ? "full" : "empty"}.png`;
}