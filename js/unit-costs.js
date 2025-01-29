import * as CategorySelector from "./category/category-selector.js";
import createTableFromData from "./unit-table/creation/create-cost-table.js";
import createLoadingBar from "./helper/loading.js";
import { parseSnakeCase } from "./category/category-parser.js";

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(CategorySelector.createCategorySelector());

    window.addEventListener("portLoaded", loadCosts);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function loadCosts() {
    const container = document.querySelectorAll(".default-table");
    const loadingBar = createLoadingBar(8, () => {
        CategorySelector.allowSelection();
    });

    createTotalCostTable(container[0]);
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "N").then(data => {
        const table = createTableFromData(data, "Normal");
        table.classList.add("normal-color");
        container[1].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "EX").then(data => {
        const table = createTableFromData(data, "Special");
        table.classList.add("special-color");
        container[2].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "RR").then(data => {
        const table = createTableFromData(data, "Rare");
        table.classList.add("rare-color");
        container[3].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "SR").then(data => {
        const table = createTableFromData(data, "Super Rare");
        table.classList.add("super-rare-color");
        container[4].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "UR").then(data => {
        const table = createTableFromData(data, "Uber Rare");
        table.classList.add("uber-rare-color");
        container[5].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_RARITY_COST, "LR").then(data => {
        const table = createTableFromData(data, "Legend Rare");
        table.classList.add("legend-rare-color");
        table.querySelector(".collapsible").classList.add("legend-rare-multi");
        container[6].appendChild(table);
        loadingBar.increment();
    });
    makeRequest(REQUEST_TYPES.GET_FAVORITED_COST, null).then(data => {
        const table = createTableFromData(data, "Favorited");
        container[7].appendChild(table);
        loadingBar.increment();
    });

    makeRequest(REQUEST_TYPES.GET_CATEGORY_NAMES).then(c => {
        createAllCategoryCostTables(loadingBar, c);
    });
}

function createAllCategoryCostTables(loadingBar, categoryData) {
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
            superCategory.querySelectorAll(".generic-table").forEach(t => t.parentElement.classList.toggle("hidden", hidden));
        };
        superCategoryName.textContent = superName;
        superCategory.appendChild(superCategoryName);

        const subButtons = [];
        for(const subCategory of Object.keys(categoryData[key]).sort()) {
            const subWrapper = document.createElement("div");

            createCategoryCostTable(key, subCategory, subWrapper, categoryData);

            subButtons.push(CategorySelector.createCategoryButton(parseSnakeCase(subCategory), subWrapper));
            superCategory.appendChild(subWrapper);

            if(window.localStorage.getItem("s4") === "1" || window.localStorage.getItem("s5") === "1") {
                subWrapper.classList.toggle("hidden", true);
                hidden = true;
            }

            loadingBar.rincrement();
        }

        categorySearchBuiltin.appendChild(CategorySelector.createCategory(superName, subButtons));
        categoryGrouping.appendChild(superCategory);
    }

    loadingBar.increment();
}

function createCategoryCostTable(superCategory, categoryName, target, categoryData) {
    makeRequest(REQUEST_TYPES.GET_MULTIPLE_COST, categoryData[superCategory][categoryName]).then(data => {
        if(data.has_units || window.localStorage.getItem("s3") === "1") {
            const table = createTableFromData(data, categoryName);
            table.classList.add("generic-table");
            table.querySelector(".collapsible").insertAdjacentElement("afterbegin", createIconList(categoryData[superCategory][categoryName]));
            target.appendChild(table);
        } else {
            target.classList.add("hidden");
            [...document.querySelectorAll("#builtin-categories button")].find(b => b.textContent === parseSnakeCase(categoryName)).classList.add("hidden");
        }
    });
}

function createIconList(idList) {
    const superWrapper = document.createElement("div");
    superWrapper.classList.add("category-icon-list");

    const wrapper = document.createElement("div");
    makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, idList).then(unitList => {
        for(const unit of unitList) {
            const iconIMG = document.createElement("img");
            iconIMG.src = `./assets/img/unit_icon/${unit.id}_${unit.current_form}.png`;
            iconIMG.onerror = () => iconIMG.src = "./assets/img/unit_icon/unknown.png";
            iconIMG.title = [unit.normal_form, unit.evolved_form, unit.true_form, unit.ultra_form][unit.current_form];
            wrapper.appendChild(iconIMG);
        }
    }, true);

    superWrapper.appendChild(wrapper);
    return superWrapper
}

function createTotalCostTable(target) {
    makeRequest(REQUEST_TYPES.GET_ALL_COST, null).then(data => {
        const table = createTableFromData(data, "All Units");
        table.classList.add("generic-table");
        target.appendChild(table);
    });
}