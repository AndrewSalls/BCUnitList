//@ts-check
import createRow from "./create-unit-row.js";
import { getValuesFromRow, observeRowChange } from "../../helper/link-row.js";
import attachUnitTableColumnSort from "../sort-units.js";

/**
 * Creates a unit table.
 * @param {string} titleText The name of the table.
 * @param {import("../../data/unit-data.js").UNIT_DATA[]} unitData The units to add to the table.
 * @param {((unit: import("../../data/unit-data.js").UNIT_RECORD) => Promise<void>)|null} changeEvent An event that gets called when a row's value changes, returning the change to the user's user rank, or null if no event should be called.
 * @param {import("../../helper/loading.js").LOADING_BAR|null} loadingBar A loading bar to update the page as the table loads, or null if the page does not need a loading bar.
 */
export default function createSearchableTable(titleText, unitData, changeEvent = null, loadingBar = null) {
    const wrapper = document.createElement("div");

    const table = document.createElement("table");
    table.classList.add("unit-table-list");

    const thead = document.createElement("thead");
    const theadRow = document.createElement("tr");
    const tbody = document.createElement("tbody");

    const titleRow = document.createElement("tr");
    const titleRowText = /** @type {HTMLTableCellElement} */ (document.createElement("td"));
    titleRowText.colSpan = 8;
    titleRowText.classList.add("searchable-table-title");
    titleRowText.textContent = titleText;
    titleRowText.onclick = () => {
        theadRow.classList.toggle("hidden");
        tbody.classList.toggle("hidden");
    };
    if(window.localStorage.getItem("s2") === "1") {
        titleRowText.click();
    }

    titleRow.appendChild(titleRowText);

    const favoriteCol = document.createElement("td");
    favoriteCol.classList.add("sort-favorite");

    const favIconWrapper = document.createElement("div");
    favIconWrapper.classList.add("fav-wrapper");

    const favIcon = document.createElement("img");
    favIcon.src = "./assets/img/fav-full.png";

    favIconWrapper.appendChild(favIcon);
    favoriteCol.appendChild(favIconWrapper);

    const optionHead = createColumnHead("head-option", "Stats");
    optionHead.colSpan = 2;

    theadRow.append(
        createColumnHead("sort-id", "ID"),
        createColumnHead("sort-form", "Icon"),
        createColumnHead("sort-name", "Name"),
        createColumnHead("sort-level", "Level"),
        createColumnHead("sort-talent", "Talents"),
        createColumnHead("sort-orb", "Talent Orb(s)"),
        favoriteCol,
        optionHead
    );

    thead.append(titleRow, theadRow);

    const colgroup = document.createElement("colgroup");
    const inst = (_class) => {
        const output = document.createElement("col");
        output.classList.add(_class);
        return output;
    }
    const last = inst("col-option");
    colgroup.append(inst("col-id"), inst("col-form"), inst("col-name"), inst("col-level"), inst("col-talent"), inst("col-orb"), inst("col-favorite"), inst("col-option"), inst("col-mega-option"));

    table.append(colgroup, thead, tbody);
    wrapper.appendChild(table);

    for(const unit of unitData) {
        if(unit !== null) {
            const row = createRow(unit);
            tbody.appendChild(row);
            if(changeEvent) {
                observeRowChange(row, () => {
                    changeEvent(getValuesFromRow(row));
                });
            }
        }

        loadingBar?.rincrement();
    }

    attachUnitTableColumnSort(table);
    return wrapper;
}

/**
 * Creates a column header for the table.
 * @param {string} className The name of the class to assign to this column head.
 * @param {string | null} textContent The text to display in the column head.
 * @returns {HTMLTableCellElement} The created column header.
 */
function createColumnHead(className, textContent) {
    const col = document.createElement("td");
    col.classList.add(className);
    col.textContent = textContent;

    return col;
}