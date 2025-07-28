//@ts-check
import createLoadingBar from "./helper/loading.js";
import createOrbMenu from "./unit-table/orb/create-orb-selector.js";
import { initializeOrbSelection } from "./unit-table/orb/orb-selection.js";
import createTableOptionModal from "./unit-table/creation/create-table-modal.js";
import createSearchableTable from "./unit-table/creation/create-unit-table.js";
import { attachTableOptionsAndFilters, initializeTableModal } from "./unit-table/filter-units.js";
import makeSearchable, { createSearchDropdown, initializeDataset } from "./helper/make-searchable.js";
import { checkPort, REQUEST_TYPES } from "./communication/iframe-link.js";
import { RARITY } from "./data/unit-data.js";

/**
 * Initializes page elements once page has loaded.
 */
window.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(createOrbMenu());
    initializeOrbSelection();
    document.body.appendChild(createTableOptionModal());
    initializeTableModal();

    window.addEventListener("portLoaded", loadUnitTables);
    if(checkPort()) {
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
});

/**
 * Initializes static content on the page.
 */
function loadUnitTables() {
    const loadingBar = createLoadingBar(8, () => {});

    const datalist = createSearchDropdown();
    document.body.appendChild(datalist);
    makeSearchable(/** @type {HTMLInputElement} */ (document.querySelector("#unit-search")), targettedID => {
        const target = [...document.querySelectorAll(".row-id")].find(r => r.textContent === `${targettedID}`)?.parentElement;
        if(target && !target.classList.contains("hidden") && !target.classList.contains("filter-hidden")) {
            if(target.parentElement?.classList.contains("hidden")) {
                //@ts-ignore Inside a table, so parentElements must exist. Table is malformatted if searchable-table-title element is missing
                target.parentElement.parentElement.querySelector(".searchable-table-title").click();
            }
            window.scrollTo({ left: 0, top: window.scrollY + target.getBoundingClientRect().top, behavior: "smooth" });
        }
    });
    REQUEST_TYPES.GET_NAMES().then(names => initializeDataset(datalist, names)).then(_ => loadingBar.increment());

    const tableAppending = [
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.NORMAL).then(units => {
            const table = createSearchableTable("Normal Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar);
            table.id = "normal-table";
            table.classList.add("normal-color");
            loadingBar.increment();
            return table;
        }),
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.SPECIAL).then(units => {
            const table = createSearchableTable("Special Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar);
            table.id = "special-table";
            table.classList.add("special-color");
            loadingBar.increment();
            return table;
        }),
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.RARE).then(units => {
            const table = createSearchableTable("Rare Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar);
            table.id = "rare-table";
            table.classList.add("rare-color");
            loadingBar.increment();
            return table;
        }),
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.SUPER_RARE).then(units => {
            const table = createSearchableTable("Super Rare Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar);
            table.id = "super-table";
            table.classList.add("super-rare-color");
            loadingBar.increment();
            return table;
        }),
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.UBER_RARE).then(units => {
            const table = createSearchableTable("Uber Rare Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar);
            table.id = "uber-table";
            table.classList.add("uber-rare-color");
            loadingBar.increment();
            return table;
        }),
        REQUEST_TYPES.GET_RARITY_DATA(RARITY.LEGEND_RARE).then(units => {
            const table = createSearchableTable("Legend Rare Cats", units, REQUEST_TYPES.UPDATE_ID, loadingBar, true);
            table.id = "legend-table";
            table.classList.add("legend-rare-color");
            loadingBar.increment();
            return table;
        })
    ];

    Promise.all(tableAppending).then(tables => {
        document.querySelector("#loading-content")?.append(...tables);
        tables.forEach(t => attachTableOptionsAndFilters(t));
        initializeQuickNav();
        loadingBar.increment();
    });
}

/**
 * Initializes the quick nav popup.
 */
function initializeQuickNav() {
    const nav = /** @type {HTMLDivElement} */ (document.querySelector("#quick-nav"));
    const scrollable = /** @type {HTMLDivElement} */ (document.querySelector("#loading-content"));

    const navToggle = /** @type {HTMLDivElement} */ (nav.querySelector("#quick-nav-access"));
    navToggle.onclick = () => nav.classList.toggle("raised");

    const normalJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#normal-jump"));
    const normalTable = /** @type {HTMLDivElement} */ (document.querySelector("#normal-table"));
    normalJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + normalTable.getBoundingClientRect().top, behavior: "smooth" });
    const specialJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#special-jump"));
    const specialTable = /** @type {HTMLDivElement} */ (document.querySelector("#special-table"));
    specialJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + specialTable.getBoundingClientRect().top, behavior: "smooth" });
    const rareJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#rare-jump"));
    const rareTable = /** @type {HTMLDivElement} */ (document.querySelector("#rare-table"));
    rareJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + rareTable.getBoundingClientRect().top, behavior: "smooth" });
    const superJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#super-jump"));
    const superTable = /** @type {HTMLDivElement} */ (document.querySelector("#super-table"));
    superJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + superTable.getBoundingClientRect().top, behavior: "smooth" });
    const uberJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#uber-jump"));
    const uberTable = /** @type {HTMLDivElement} */ (document.querySelector("#uber-table"));
    uberJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + uberTable.getBoundingClientRect().top, behavior: "smooth" });
    const legendJump = /** @type {HTMLButtonElement} */ (nav.querySelector("#legend-jump"));
    const legendTable = /** @type {HTMLDivElement} */ (document.querySelector("#legend-table"));
    legendJump.onclick = () => scrollable.scrollTo({ left: 0, top: scrollable.scrollTop + legendTable.getBoundingClientRect().top, behavior: "smooth" });
};