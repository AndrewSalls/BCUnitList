import makeSearchable,{createSearchDropdown,initializeDataset}from"../helper/make-searchable.js";import{createSubCategoryButton,createSuperCategoryButton}from"./create-settings-category.js";const MAX_CATEGORY_NAME_LENGTH=64;let selectedUnits=new Set,targetedKey=null;export function initializeCategoryCreator(getCategories,modifyCategory,removeCategory,names,completionMessager){const wrapper=document.querySelector("#category-creator"),antiWrapper=document.querySelector("#category-creator-menu"),chipList=document.querySelector("#category-units"),categoryName=document.querySelector("#category-name"),cancelButton=document.querySelector("#cancel-category-creation"),createButton=document.querySelector("#create-category-creation"),datalist=createSearchDropdown();document.body.appendChild(datalist),makeSearchable(document.querySelector("#add-unit"),(id=>{if(!selectedUnits.has(id)){selectedUnits.add(id);const chip=createChip(id);if(0===chipList.children.length)chipList.appendChild(chip);else{let pos=0;const targetID=chipList.children[pos].querySelector(".unit-id")?.textContent;for(;pos<chipList.children.length&&targetID&&id>parseInt(targetID);)pos++;pos===chipList.children.length?chipList.appendChild(chip):chipList.children[pos].insertAdjacentElement("beforebegin",chip)}document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${id}"]`).forEach((o=>{o.classList.add("global-hidden"),o.classList.remove("suggestion-hovered")}))}})),initializeDataset(datalist,names),cancelButton.onclick=()=>{selectedUnits.clear(),antiWrapper.classList.remove("hidden"),wrapper.classList.add("hidden");document.querySelectorAll("#search-suggestion-dropdown div.global-hidden").forEach((o=>o.classList.remove("global-hidden"))),completionMessager("Cancelled category creation.",!1)},getCategories(!0).then((categories=>{const custom=categories.custom??{},opener=document.querySelector("#open-creator"),remover=document.querySelector("#delete-category"),existingList=document.querySelector("#created-category-list");for(const existing of Object.keys(custom))existingList.appendChild(createCategorySelectionButton(existing));opener.onclick=()=>{if(targetedKey&&custom[targetedKey])for(const preselected of custom[targetedKey]){document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${preselected}"]`).forEach((o=>{o.classList.add("global-hidden"),o.classList.remove("suggestion-hovered")}))}openCategoryModifier(targetedKey,custom[targetedKey])},remover.onclick=()=>{targetedKey&&removeCustomCategory(targetedKey,removeCategory).then((_=>{delete custom[targetedKey],targetedKey=null,opener.textContent="Create Category",completionMessager("Category removed...",!1)}))},createButton.onclick=()=>{const trimName=categoryName.value.trim();if(0===chipList.children.length)completionMessager("Category must have at least one unit!",!0);else if(trimName)if(trimName.length>64)completionMessager("Category name must be at most 64 characters long!",!0);else if(trimName!==targetedKey&&Object.keys(custom).includes(trimName))completionMessager("A custom category with that name already exists!",!0);else{const categoryValues=[...selectedUnits.values()];delete custom[targetedKey];document.querySelectorAll("#search-suggestion-dropdown div.global-hidden").forEach((o=>o.classList.remove("global-hidden"))),addCustomCategory(trimName,categoryValues,modifyCategory,removeCategory).then((_=>{custom[trimName]=categoryValues,antiWrapper.classList.remove("hidden"),wrapper.classList.add("hidden"),selectedUnits.clear(),completionMessager((targetedKey?"Modified":"Created")+" custom category!",!1)}))}else completionMessager("Category must have a name!",!0)}}))}export function openCategoryModifier(originalName=null,originalUnits=null){const wrapper=document.querySelector("#category-creator"),antiWrapper=document.querySelector("#category-creator-menu"),chipList=document.querySelector("#category-units"),categoryName=document.querySelector("#category-name"),createButton=document.querySelector("#create-category-creation");if(chipList.innerHTML="",originalName&&originalUnits){categoryName.value=originalName;for(const id of originalUnits.sort(((a,b)=>a-b)))chipList.appendChild(createChip(id)),selectedUnits.add(id);createButton.textContent="Modify"}else categoryName.value="",chipList.innerHTML="",createButton.textContent="Create";antiWrapper.classList.add("hidden"),wrapper.classList.remove("hidden")}function createChip(id){const wrapper=document.createElement("div");wrapper.classList.add("chip");const icon=document.createElement("img");icon.classList.add("unit-icon"),icon.src=`/assets/img/unit_icon/${id}_0.png`;const iconID=document.createElement("p");iconID.classList.add("unit-id"),iconID.textContent=`${id}`;const removeUnit=document.createElement("div");return removeUnit.classList.add("remove-unit"),removeUnit.textContent="x",removeUnit.onclick=()=>{selectedUnits.delete(id),wrapper.remove()},wrapper.append(icon,iconID,removeUnit),wrapper}async function addCustomCategory(categoryName,categoryIDs,modifyCategory,removeCategory){targetedKey&&targetedKey!==categoryName&&await removeCustomCategory(targetedKey,removeCategory);let customDiv=document.querySelector("#gk-custom .sub-category-wrapper");if(!customDiv){const insertingInto=document.querySelector("#category-selection"),inserting=createSuperCategoryButton("custom",[]);let inserted=!1;for(const child of insertingInto.children)if(child.id.localeCompare(inserting.id)>0){child.insertAdjacentElement("beforebegin",inserting),inserted=!0;break}inserted||insertingInto.appendChild(inserting)}if(!targetedKey||targetedKey!==categoryName){customDiv=document.querySelector("#gk-custom .sub-category-wrapper"),window.localStorage.setItem(`gk-custom-${categoryName}`,"1");const inserting=createSubCategoryButton(`custom-${categoryName}`,categoryName,0);let inserted=!1;for(const child of customDiv.children)if(child.textContent?.toLocaleLowerCase().localeCompare(categoryName.toLocaleLowerCase())){child.insertAdjacentElement("beforebegin",inserting),inserted=!0;break}inserted||customDiv?.appendChild(inserting);const insertedButton=createCategorySelectionButton(categoryName);document.querySelector("#created-category-list")?.appendChild(insertedButton),insertedButton.click(),targetedKey=categoryName}modifyCategory(categoryName,categoryIDs)}async function removeCustomCategory(categoryName,removeCategory){window.localStorage.removeItem(`gk-custom-${categoryName}`);const customWrapper=document.querySelector("#gk-custom");if(!customWrapper)return;const customButtonElements=customWrapper.querySelector(".sub-category-wrapper")?.children;if(customButtonElements){const customButtons=[...customButtonElements];customButtons.find((c=>c.textContent===categoryName))?.remove(),1===customButtons.length&&customWrapper.remove()}const customList=document.querySelector("#created-category-list")?.children;customList&&[...customList].find((c=>c.textContent===categoryName))?.remove(),await removeCategory(categoryName)}function createCategorySelectionButton(categoryName){const catButton=document.createElement("button"),existingList=document.querySelector("#created-category-list"),opener=document.querySelector("#open-creator"),remover=document.querySelector("#delete-category");return catButton.type="button",catButton.classList.add("filter-button"),catButton.classList.add("active"),catButton.textContent=categoryName,catButton.onclick=()=>{const toggleState=catButton.classList.contains("active");existingList?.querySelectorAll("button").forEach((b=>b.classList.add("active"))),remover.disabled=!toggleState,toggleState?(catButton.classList.remove("active"),opener.textContent="Modify Category",targetedKey=categoryName):(opener.textContent="Create Category",targetedKey=null)},catButton}