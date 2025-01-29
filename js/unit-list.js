import createLoadingBar from "./helper/loading.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";
import createTableOptionModal from "./unit-table/creation/create-table-modal.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";
import { attachTableOptionsAndFilters, initializeTableModal } from "./unit-table/filter-units.js";
import makeSearchable from "./helper/make-searchable.js";

window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    document.body.appendChild(createTableOptionModal());
    initializeTableModal();

    window.addEventListener("portLoaded", loadUnitTables);
    if(checkPort()) {
        window.dispatchEvent("portLoaded");
    }
});

async function loadUnitTables() {
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS, null).then(r => r);
    const unitCount = settings.unitCount;

    const loadingBar = createLoadingBar(8, () => {
        document.querySelectorAll("section .sort-id").forEach(s => s.click());
    });

    const searchSuggestions = document.createElement("datalist");
    searchSuggestions.id = "unit-search-suggestions";
    searchSuggestions.dataset.max_count = unitCount;
    document.body.appendChild(searchSuggestions);

    makeSearchable(document.querySelector("#unit-search"), searchSuggestions, targettedID => {
        const target = [...document.querySelectorAll(".row-id")].find(r => r.textContent === `${targettedID}`)?.parentElement;
        if(target && !target.classList.contains("hidden") && !target.classList.contains("filter-hidden")) {
            window.scrollTo({ left: 0, top: window.scrollY + target.getBoundingClientRect().top, behavior: "smooth" });
        }
    }).then(_ => loadingBar.increment());

    const tableAppending = [
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "N").then(units => {
            const table = createSearchableTable("Normal Units", units, loadingBar);
            table.id = "normal-table";
            table.classList.add("normal-color");
            loadingBar.increment();
            return table;
        }),
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "EX").then(units => {
            const table = createSearchableTable("Special Units", units, loadingBar);
            table.id = "special-table";
            table.classList.add("special-color");
            loadingBar.increment();
            return table;
        }),
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "RR").then(units => {
            const table = createSearchableTable("Rare Units", units, loadingBar);
            table.id = "rare-table";
            table.classList.add("rare-color");
            loadingBar.increment();
            return table;
        }),
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "SR").then(units => {
            const table = createSearchableTable("Super Rare Units", units, loadingBar);
            table.id = "super-table";
            table.classList.add("super-rare-color");
            loadingBar.increment();
            return table;
        }),
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "UR").then(units => {
            const table = createSearchableTable("Uber Rare Units", units, loadingBar);
            table.id = "uber-table";
            table.classList.add("uber-rare-color");
            loadingBar.increment();
            return table;
        }),
        makeRequest(REQUEST_TYPES.GET_RARITY_DATA, "LR").then(units => {
            const table = createSearchableTable("Legend Rare Units", units, loadingBar);
            table.id = "legend-table";
            table.classList.add("legend-rare-color");
            table.querySelector("tbody").classList.add("legend-rare-multi");
            loadingBar.increment();
            return table;
        })
    ];
    Promise.all(tableAppending).then(tables => {
        document.querySelector("#loading-content").append(...tables);
        tables.forEach(t => attachTableOptionsAndFilters(t.querySelector("table")));
        initializeQuickNav(searchSuggestions);
        loadingBar.increment();
    });
}

function initializeQuickNav() {
    const nav = document.querySelector("#quick-nav");

    const navToggle = nav.querySelector("#quick-nav-access");
    navToggle.onclick = () => nav.classList.toggle("raised");

    const normalJump = nav.querySelector("#normal-jump");
    const normalTable = document.querySelector("#normal-table");
    normalJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + normalTable.getBoundingClientRect().top, behavior: "smooth" });
    const specialJump = nav.querySelector("#special-jump");
    const specialTable = document.querySelector("#special-table");
    specialJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + specialTable.getBoundingClientRect().top, behavior: "smooth" });
    const rareJump = nav.querySelector("#rare-jump");
    const rareTable = document.querySelector("#rare-table");
    rareJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + rareTable.getBoundingClientRect().top, behavior: "smooth" });
    const superJump = nav.querySelector("#super-jump");
    const superTable = document.querySelector("#super-table");
    superJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + superTable.getBoundingClientRect().top, behavior: "smooth" });
    const uberJump = nav.querySelector("#uber-jump");
    const uberTable = document.querySelector("#uber-table");
    uberJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + uberTable.getBoundingClientRect().top, behavior: "smooth" });
    const legendJump = nav.querySelector("#legend-jump");
    const legendTable = document.querySelector("#legend-table");
    legendJump.onclick = () => window.scrollTo({ left: 0, top: window.scrollY + legendTable.getBoundingClientRect().top, behavior: "smooth" });
};