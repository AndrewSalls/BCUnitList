import createRow from"./create-unit-row.js";import{getValuesFromRow,observeRowChange}from"../../helper/link-row.js";import attachUnitTableColumnSort from"../sort-units.js";export default function createSearchableTable(titleText,unitData,changeEvent=null,loadingBar=null){const wrapper=document.createElement("div"),table=document.createElement("table"),thead=document.createElement("thead"),theadRow=document.createElement("tr"),tbody=document.createElement("tbody"),titleRow=document.createElement("tr"),titleRowText=document.createElement("td");titleRowText.colSpan=8,titleRowText.classList.add("searchable-table-title"),titleRowText.textContent=titleText,titleRow.onclick=()=>{theadRow.classList.toggle("hidden"),tbody.classList.toggle("hidden")},"1"===window.localStorage.getItem("s2")&&titleRow.click(),titleRow.appendChild(titleRowText);const favoriteCol=document.createElement("td");favoriteCol.classList.add("sort-favorite");const favIconWrapper=document.createElement("div");favIconWrapper.classList.add("fav-wrapper");const favIcon=document.createElement("img");favIcon.src="./assets/img/fav-full.png",favIconWrapper.appendChild(favIcon),favoriteCol.appendChild(favIconWrapper),theadRow.append(createColumnHead("sort-id","ID"),createColumnHead("sort-form","Icon"),createColumnHead("sort-name","Name"),createColumnHead("sort-level","Level"),createColumnHead("sort-talent","Talents"),createColumnHead("sort-orb","Talent Orb(s)"),favoriteCol,createColumnHead("sort-option","Options")),thead.append(titleRow,theadRow),table.append(thead,tbody),wrapper.appendChild(table);for(const unit of unitData){if(null!==unit){const row=createRow(unit);tbody.appendChild(row),changeEvent&&observeRowChange(row,(()=>{changeEvent(getValuesFromRow(row)).then()}))}loadingBar?.rincrement()}return attachUnitTableColumnSort(table),wrapper}function createColumnHead(className,textContent){const col=document.createElement("td");return col.classList.add(className),col.textContent=textContent,col}