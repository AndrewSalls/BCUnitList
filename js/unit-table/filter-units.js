import{observeRowChange}from"../helper/link-row.js";import*as filterFunctions from"./filter-functions.js";import*as orbData from"../../assets/orb-map.js";const ORB_DATA=orbData.default;let topPos=0;export function initializeTableModal(){const tableModal=document.querySelector("#table-option-modal");tableModal.querySelector("#table-option-cancel")?.addEventListener("click",(()=>{targettedTable.dataset.options=[...tableModal.querySelectorAll("#table-filter-options button")].reduce(((s,a)=>s+(a.classList.contains("active")?"1":"0")),""),tableModal.classList.add("hidden"),document.body.classList.remove("unscrollable"),document.documentElement.scrollTop=topPos})),initializeUpdateOptions(),initializeMiscFilters(),initializeFormFilters(),initializeLevelFilters(),initializeTalentFilters(),initializeOrbFilters()}let targettedTable=null;export function attachTableOptionsAndFilters(table){const tableButtonDiv=document.createElement("div");tableButtonDiv.classList.add("h-align");const openOptionButton=document.createElement("button");openOptionButton.classList.add("open-table-option"),openOptionButton.innerText="Table Options",tableButtonDiv.appendChild(openOptionButton);const tableModal=document.querySelector("#table-option-modal"),filterOptions=[...tableModal.querySelectorAll("#table-filter-options button")];table.dataset.options="0".repeat(filterOptions.length),openOptionButton.onclick=()=>{topPos=document.documentElement.scrollTop,document.body.classList.add("unscrollable"),document.body.style.top=-1*topPos+"px",tableModal.classList.remove("hidden"),document.querySelector("#table-option-label").textContent=table.querySelector(".searchable-table-title")?.textContent??"MISSING TABLE NAME",targettedTable=table,filterOptions.forEach(((b,i)=>b.classList.toggle("active","1"===targettedTable.dataset.options[i])))},table.querySelector("tbody")?.querySelectorAll("tr")?.forEach((r=>observeRowChange(r,(()=>updateRowCallback(table,r,filterOptions))))),table.prepend(tableButtonDiv)}export function getModalTarget(){return targettedTable}function updateRowCallback(table,row,filterOptions){row.dataset.filteredCount="0";for(let x=0;x<filterOptions.length;x++)"1"===table.dataset.options?.charAt(x)&&filterOptions[x].dispatchEvent(new CustomEvent("filter-row",{detail:row}));"0"===row.dataset.filteredCount&&row.classList.remove("filter-hidden")}function checkRowIsOwned(row){return"0"!==row.querySelector(".max-level.level-select").value}function applyUpdate(update,checkForOwnership,checkForVisibility){targettedTable.querySelectorAll("tbody tr").forEach((r=>{checkForVisibility&&!r.checkVisibility()||checkForOwnership&&!checkRowIsOwned(r)||(update(r),r.dispatchEvent(new CustomEvent("generic-update")))}))}function applyFilter(predicate,isUndoing){[...targettedTable.querySelectorAll("tbody tr")].filter((r=>predicate(r))).forEach((r=>updateRowFilter(r,isUndoing)))}function updateRowFilter(row,isUndoing){const target=row.querySelector(".row-id");row.dataset.filteredCount=`${Math.max(0,parseInt(row.dataset.filteredCount??"0")+(isUndoing?-1:1))}`,"0"===row.dataset.filteredCount?(row.classList.remove("filter-hidden"),document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((o=>{o.classList.toggle("global-hidden",row.classList.contains("hidden"))}))):(row.classList.add("filter-hidden"),document.querySelectorAll(`#unit-search-suggestions div[data-target='${target.textContent}']`).forEach((o=>{o.classList.add("global-hidden"),o.classList.remove("suggestion-hovered")})))}function registerFilter(button,callback){button.onclick=()=>applyFilter(callback,!button.classList.toggle("active")),button.addEventListener("filter-row",(ev=>{const detail=ev.detail;callback(detail)&&updateRowFilter(detail,!1)}))}function initializeUpdateOptions(){const optionWrapper=document.querySelector("#table-update-options"),applyToOwnedOnly=optionWrapper.querySelector("#update-owned-only"),applyToVisibleOnly=optionWrapper.querySelector("#update-visible-only"),unhideButton=optionWrapper.querySelector("#unhide-all"),resetButton=optionWrapper.querySelector("#reset-all"),ownAllButton=optionWrapper.querySelector("#own-all"),fullyEvolveButton=optionWrapper.querySelector("#fully-evolve-all"),level30Button=optionWrapper.querySelector("#level-30-all"),level50Button=optionWrapper.querySelector("#level-50-all"),maxAllButton=optionWrapper.querySelector("#max-all");unhideButton.onclick=()=>applyUpdate((r=>{r.classList.remove("hidden"),document.querySelectorAll(`#unit-search-suggestions div[data-target='${r.querySelector(".row-id").textContent}']`).forEach((o=>o.classList.toggle("global-hidden",r.classList.contains("filter-hidden"))))}),applyToOwnedOnly.checked,applyToVisibleOnly.checked),resetButton.onclick=()=>applyUpdate((r=>r.querySelector(".reset-option").click()),applyToOwnedOnly.checked,applyToVisibleOnly.checked),ownAllButton.onclick=()=>applyUpdate((r=>{const levelSelector=r.querySelector(".max-level.level-select");levelSelector.value=Math.max(parseInt(levelSelector.value),1)}),!1,applyToVisibleOnly.checked),fullyEvolveButton.onclick=()=>applyUpdate((r=>{const icon=r.querySelector(".row-image");icon.dataset.form=parseInt(icon.dataset.max_form)-1,icon.querySelector("img").click()}),applyToOwnedOnly.checked,applyToVisibleOnly.checked),level30Button.onclick=()=>applyUpdate((r=>{const levelSelector=r.querySelector(".max-level.level-select");levelSelector.value=Math.min(Math.max(parseInt(levelSelector.value),30),parseInt(levelSelector.max))}),applyToOwnedOnly.checked,applyToVisibleOnly.checked),level50Button.onclick=()=>applyUpdate((r=>{const levelSelector=r.querySelector(".max-level.level-select");levelSelector.value=levelSelector.max}),applyToOwnedOnly.checked,applyToVisibleOnly.checked),maxAllButton.onclick=()=>applyUpdate((r=>r.querySelector(".max-option").click()),applyToOwnedOnly.checked,applyToVisibleOnly.checked)}function initializeMiscFilters(){const filterWrapper=document.querySelector("#table-filter-options");registerFilter(filterWrapper.querySelector("#fake-filter"),filterFunctions.isUnreleased),registerFilter(filterWrapper.querySelector("#collab-filter"),filterFunctions.isCollab),registerFilter(filterWrapper.querySelector("#version-filter"),filterFunctions.isInEN),registerFilter(filterWrapper.querySelector("#unobtained-filter"),filterFunctions.isUnobtained),registerFilter(filterWrapper.querySelector("#favorite-filter"),filterFunctions.isNotFavorited)}function initializeFormFilters(){const filterWrapper=document.querySelector("#table-filter-options");registerFilter(filterWrapper.querySelector("#normal-filter"),filterFunctions.isNormalForm),registerFilter(filterWrapper.querySelector("#evolved-filter"),filterFunctions.isEvolvedForm),registerFilter(filterWrapper.querySelector("#true-filter"),filterFunctions.isTrueForm),registerFilter(filterWrapper.querySelector("#ultra-filter"),filterFunctions.isUltraForm),registerFilter(filterWrapper.querySelector("#fully-evolved-filter"),filterFunctions.isFullyEvolved),registerFilter(filterWrapper.querySelector("#not-fully-evolved-filter"),(r=>!filterFunctions.isFullyEvolved(r)))}function initializeLevelFilters(){const filterWrapper=document.querySelector("#table-filter-options");registerFilter(filterWrapper.querySelector("#max-lvl-filter"),filterFunctions.isMaxLevel),registerFilter(filterWrapper.querySelector("#not-max-lvl-filter"),filterFunctions.isNotMaxLevel),registerFilter(filterWrapper.querySelector("#lvl-1-filter"),filterFunctions.isMaxLevel1),registerFilter(filterWrapper.querySelector("#max-plus-filter"),filterFunctions.isMaxPlusLevel),registerFilter(filterWrapper.querySelector("#not-max-plus-filter"),filterFunctions.isNotMaxPlusLevel),registerFilter(filterWrapper.querySelector("#plus-0-filter"),filterFunctions.isMaxPlusLevel0)}function initializeTalentFilters(){const filterWrapper=document.querySelector("#table-filter-options");registerFilter(filterWrapper.querySelector("#max-talent-filter"),(r=>filterFunctions.isTalentsMax(r,!0))),registerFilter(filterWrapper.querySelector("#not-max-talent-filter"),(r=>filterFunctions.isTalentsMax(r,!1))),registerFilter(filterWrapper.querySelector("#max-ut-filter"),(r=>filterFunctions.isUltraTalentsMax(r,!0))),registerFilter(filterWrapper.querySelector("#not-max-ut-filter"),(r=>filterFunctions.isUltraTalentsMax(r,!1))),registerFilter(filterWrapper.querySelector("#has-talent-filter"),filterFunctions.isTalentable),registerFilter(filterWrapper.querySelector("#has-ut-filter"),filterFunctions.isUltraTalentable),registerFilter(filterWrapper.querySelector("#talentless-filter"),(r=>!filterFunctions.isTalentable(r))),registerFilter(filterWrapper.querySelector("#utless-filter"),(r=>!filterFunctions.isUltraTalentable(r)))}function initializeOrbFilters(){initializeOrbTraitFilters(),initializeOrbTypeFilters(),initializeOrbRankFilters()}function initializeOrbTraitFilters(){const filterWrapper=document.querySelector("#table-filter-options");for(let x=0;x<ORB_DATA.traits.length;x++)registerFilter(filterWrapper.querySelector(`#trait-${x}-filter`),(r=>filterFunctions.isOrbTrait(r,x)))}function initializeOrbTypeFilters(){const filterWrapper=document.querySelector("#table-filter-options");for(let x=0;x<ORB_DATA.types.length;x++)registerFilter(filterWrapper.querySelector(`#type-${x}-filter`),(r=>filterFunctions.isOrbType(r,x)))}function initializeOrbRankFilters(){const filterWrapper=document.querySelector("#table-filter-options");for(let x=0;x<ORB_DATA.ranks.length;x++)registerFilter(filterWrapper.querySelector(`#rank-${x}-filter`),(r=>filterFunctions.isOrbRank(r,x)))}