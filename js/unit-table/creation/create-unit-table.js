//@ts-check
import createRow from "./create-unit-row.js";
import { getValuesFromRow, observeRowChange } from "../../helper/link-row.js";
import attachUnitTableColumnSort from "../sort-units.js";

/**
 * Creates a unit table.
 * @param {string} titleText The name of the table.
 * @param {import("../../data/unit-data.js").UNIT_DATA[]} unitData The units to add to the table.
 * @param {(unit: import("../../data/unit-data.js").UNIT_RECORD) => void} changeEvent An event that gets called when a row's value changes.
 * @param {import("../../helper/loading.js").LOADING_BAR|null} loadingBar A loading bar to update the page as the table loads, or null if the page does not need a loading bar.
 */
export default function createSearchableTable(titleText, unitData, changeEvent, loadingBar = null) {
    const wrapper = document.createElement("div");
    const title = document.createElement("h2");
    title.classList.add("searchable-table-title");
    title.textContent = titleText;

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const theadRow = document.createElement("tr");

    const favoriteCol = document.createElement("td");
    favoriteCol.classList.add("sort-favorite");

    const favIconWrapper = document.createElement("div");
    favIconWrapper.classList.add("fav-wrapper");

    const favIcon = document.createElement("img");
    favIcon.src = "./assets/img/fav-full.png";

    favIconWrapper.appendChild(favIcon);
    favoriteCol.appendChild(favIconWrapper);

    theadRow.append(
        createColumnHead("sort-id", "ID"),
        createColumnHead("sort-form", "Icon"),
        createColumnHead("sort-name", "Name"),
        createColumnHead("sort-level", "Level"),
        createColumnHead("sort-talent", "Talents"),
        createColumnHead("sort-orb", "Talent Orb(s)"),
        favoriteCol,
        createColumnHead("sort-option", "Options")
    );

    thead.appendChild(theadRow);

    const tbody = document.createElement("tbody");
    table.append(thead, tbody);
    wrapper.append(title, table);

    for(const unit of unitData) {
        if(unit !== null) {
            const row = createRow(unit);
            tbody.appendChild(row);
            observeRowChange(row, () => changeEvent(getValuesFromRow(row)));
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