import createRow from "./create-unit-row.js";
import { getValuesFromRow, observeRowChange } from "../../helper/link-row.js";
import attachUnitTableColumnSort from "../sort-units.js";

export default function createSearchableTable(titleText, unitData, loadingBar = null) {
    const wrapper = document.createElement("div");
    const title = document.createElement("h2");
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
            observeRowChange(row, () => makeRequest(REQUEST_TYPES.UPDATE_ID, getValuesFromRow(row)));
        }

        loadingBar?.rincrement();
    }

    attachUnitTableColumnSort(table);
    return wrapper;
}

function createColumnHead(className, textContent) {
    const col = document.createElement("td");
    col.classList.add(className);
    col.textContent = textContent;

    return col;
}