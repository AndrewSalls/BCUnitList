import { initializeDataset } from "./helper/make-searchable.js";
import { createMinimalLoadout } from "./unit-table/creation/create-loadout-table.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";


document.addEventListener("DOMContentLoaded", () => {
    initializeContent();

    window.addEventListener("portLoaded", loadLoadouts);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

function initializeContent() {
    const table = createSearchableTable("Loadout", []);
    table.querySelector("h2").remove();
    document.querySelector("#unit-data-box").appendChild(table);
}

async function loadLoadouts() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);

    const cannonTypeCount = settings.ototo.count;
    const unlockedCannons = new Array(cannonTypeCount).map(() => { return { cannon: true, style: true, foundation: true }; });

    const unitCount = settings.unitCount;
    const searchSuggestions = document.createElement("datalist");
    searchSuggestions.id = "unit-search-suggestions";
    searchSuggestions.dataset.max_count = unitCount;
    document.body.appendChild(searchSuggestions);
    initializeDataset(searchSuggestions, true);

    const emptyLoadout = createMinimalLoadout(null, unlockedCannons, null);
    document.querySelector("#loadout-box").appendChild(emptyLoadout);
}