import makeSearchable from"../../helper/make-searchable.js";import makeDraggable,{sortIcons}from"../../helper/make-draggable.js";import{FORM}from"../../data/unit-data.js";import SETTINGS from"../../../assets/settings.js";const MAX_LOADOUT_NAME_LENGTH=64;export function createMinimalLoadout(loadoutData,unlockedCannons,saveCallback){const wrapper=document.createElement("div");wrapper.classList.add("loadout-wrapper"),wrapper.classList.add("v-align"),loadoutData&&wrapper.classList.add("save");const options=document.createElement("div");options.classList.add("loadout-options");const nameOption=document.createElement("input");nameOption.classList.add("loadout-name"),nameOption.type="text",nameOption.placeholder="Enter loadout name...",nameOption.value=loadoutData?.title??"",nameOption.maxLength=64,options.appendChild(nameOption);const contentWrapper=document.createElement("div");return contentWrapper.classList.add("loadout-contents"),contentWrapper.classList.add("h-align"),contentWrapper.append(createUnitInput(loadoutData&&loadoutData.units,loadoutData&&loadoutData.forms,saveCallback),createCannonInput(loadoutData&&loadoutData.baseLevels,unlockedCannons,saveCallback)),wrapper.append(options,contentWrapper),wrapper}export function createUnitInput(units,forms,saveCallback){const wrapper=document.createElement("div");wrapper.classList.add("loadout-unit-wrapper");let x=0;if(units&&forms)for(x=0;x<10&&x<units.length;x++)appendChip(units[x],forms[x],wrapper,saveCallback);for(;x<10;)appendChip(null,null,wrapper,saveCallback),x++;return makeDraggable(wrapper,saveCallback),wrapper}export function appendChip(id,form,parent,saveCallback){const wrapper=document.createElement("div");wrapper.classList.add("chip");const img=document.createElement("img");img.classList.add("unit-icon"),img.src="./assets/img/unit_icon/unknown.png",img.onclick=()=>{if(!window.document.body.classList.contains("disabled-editing-mode")&&wrapper.classList.contains("set-unit")){let form=parseInt(wrapper.dataset.form??"0")+1;form>parseInt(wrapper.dataset.maxForm??"0")&&(form=0),wrapper.dataset.form=`${form}`,img.src=`./assets/img/unit_icon/${wrapper.dataset.id}_${form}.png`,saveCallback&&saveCallback()}};const pId=document.createElement("p");pId.classList.add("unit-id"),pId.classList.add("hidden");const removeButton=document.createElement("div");removeButton.classList.add("remove-unit"),removeButton.textContent="X",removeButton.classList.add("hidden"),removeButton.onclick=()=>{document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${wrapper.dataset.id}"]`).forEach((o=>o.classList.remove("global-hidden"))),wrapper.classList.remove("set-unit"),delete wrapper.dataset.id,delete wrapper.dataset.maxForm,img.src="./assets/img/unit_icon/unknown.png",pId.textContent="",pId.classList.add("hidden"),removeButton.classList.add("hidden"),unitSearchInput.classList.remove("hidden"),sortIcons(parent),saveCallback&&saveCallback()};const unitSearchInput=document.createElement("input");unitSearchInput.classList.add("unset-search"),unitSearchInput.type="text",unitSearchInput.placeholder="Search...",unitSearchInput.addEventListener("focus",(()=>{for(const chipID of parent.querySelectorAll(".chip.set-unit .unit-id")){document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${chipID.textContent??"0"}"]`).forEach((o=>{o.classList.add("global-hidden"),o.classList.remove("suggestion-hovered")}))}})),unitSearchInput.addEventListener("blur",(()=>{document.querySelectorAll("#search-suggestion-dropdown div.global-hidden").forEach((d=>d.classList.remove("global-hidden")))})),makeSearchable(unitSearchInput,((searchID,searchForm)=>{const formNameOptions=document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${searchID}"]`);formNameOptions.forEach((o=>{o.classList.add("global-hidden"),o.classList.remove("suggestion-hovered")})),wrapper.classList.add("set-unit"),wrapper.dataset.form=`${searchForm}`,wrapper.dataset.id=`${searchID}`,wrapper.dataset.maxForm=""+(formNameOptions.length-1),SETTINGS.skipImages.includes(searchID)||(img.src=`./assets/img/unit_icon/${searchID}_${searchForm}.png`),pId.textContent=`${searchID}`,pId.classList.remove("hidden"),removeButton.classList.remove("hidden"),unitSearchInput.classList.add("hidden"),sortIcons(parent),saveCallback&&saveCallback()})),null!==id&&null!==form&&(wrapper.classList.add("set-unit"),wrapper.dataset.form=`${form}`,wrapper.dataset.id=`${id}`,wrapper.dataset.maxForm=""+(document.querySelectorAll(`#search-suggestion-dropdown div[data-target="${id}"]`).length-1),img.src=`./assets/img/unit_icon/${id}_${form}.png`,pId.textContent=`${id}`,pId.classList.remove("hidden"),removeButton.classList.remove("hidden"),unitSearchInput.classList.add("hidden")),wrapper.append(img,pId,removeButton,unitSearchInput),parent.appendChild(wrapper)}export function createCannonInput(cannonData,unlockedCannons,saveCallback=null){cannonData=cannonData??[1,1,1];const wrapper=document.createElement("div");wrapper.classList.add("loadout-base-wrapper"),wrapper.classList.add("h-align");const baseImage=document.createElement("div");baseImage.classList.add("loadout-base-image");const cannonImage=document.createElement("img");cannonImage.classList.add("base-cannon"),cannonImage.dataset.type=`${cannonData[0]}`,cannonImage.src=`./assets/img/foundation/base_${cannonData[0]??1}.png`;const styleImage=document.createElement("img");styleImage.classList.add("base-style"),styleImage.dataset.type=`${cannonData[1]}`,styleImage.src=`./assets/img/foundation/base_${cannonData[1]??1}_style.png`;const foundationImage=document.createElement("img");foundationImage.classList.add("base-foundation"),foundationImage.dataset.type=`${cannonData[2]}`,foundationImage.src=`./assets/img/foundation/base_${cannonData[2]??1}_foundation.png`;const leftArrowWrapper=document.createElement("div");leftArrowWrapper.classList.add("left-base-arrows"),baseImage.append(cannonImage,styleImage,foundationImage),leftArrowWrapper.append(createBaseArrow(!0,"cannon",cannonImage,unlockedCannons,saveCallback),createBaseArrow(!0,"style",styleImage,unlockedCannons,saveCallback),createBaseArrow(!0,"foundation",foundationImage,unlockedCannons,saveCallback));const rightArrowWrapper=document.createElement("div");return rightArrowWrapper.classList.add("right-base-arrows"),rightArrowWrapper.append(createBaseArrow(!1,"cannon",cannonImage,unlockedCannons,saveCallback),createBaseArrow(!1,"style",styleImage,unlockedCannons,saveCallback),createBaseArrow(!1,"foundation",foundationImage,unlockedCannons,saveCallback)),wrapper.append(leftArrowWrapper,baseImage,rightArrowWrapper),wrapper}export function createBaseArrow(isLeft,arrowFor,target,unlockedCannons,saveCallback=null){const wrapper=document.createElement("div");wrapper.classList.add(`${arrowFor}-arrow`),wrapper.classList.add(isLeft?"left-arrow":"right-arrow"),wrapper.innerHTML=isLeft?"<svg viewBox='0 0 16 32'><path d='M0 16 L16 0 L16 32'></path></svg>":"<svg viewBox='0 0 16 32'><path d='M16 16 L0 0 L0 32'></path></svg>";const changeAmt=isLeft?-1:1;return wrapper.querySelector("svg").onclick=()=>{const currIndex=parseInt(target.dataset.type??"1")-1;let inc=currIndex;do{inc=(inc+changeAmt+unlockedCannons.length)%unlockedCannons.length}while(!unlockedCannons[inc][arrowFor]&&inc!==currIndex);inc+=1,target.dataset.type=`${inc}`;let extra="";"style"!==arrowFor&&"foundation"!==arrowFor||(extra=`_${arrowFor}`),target.src=`./assets/img/foundation/base_${inc}${extra}.png`,saveCallback&&saveCallback()},wrapper}