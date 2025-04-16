import{FORM}from"../data/unit-data.js";let targettedInput=null;export default function makeSearchable(input,findCallback){const suggestionDropdown=document.querySelector("#search-suggestion-dropdown");function displayDropdown(){input.dispatchEvent(new Event("keyup")),targettedInput=input;const inputBounds=input.getBoundingClientRect(),suggestionBounds=suggestionDropdown.getBoundingClientRect();suggestionDropdown.style.minWidth=`${inputBounds.width}px`,inputBounds.left+suggestionBounds.width>window.innerWidth?suggestionDropdown.style.left=inputBounds.right+window.scrollX-suggestionBounds.width+"px":suggestionDropdown.style.left=`${inputBounds.left+window.scrollX}px`,inputBounds.bottom+suggestionBounds.height>window.innerHeight?suggestionDropdown.style.top=inputBounds.top+window.scrollY-suggestionBounds.height+"px":suggestionDropdown.style.top=`${inputBounds.bottom+window.scrollY}px`,suggestionDropdown.classList.remove("invisible")}input.addEventListener("click",displayDropdown),input.addEventListener("focus",displayDropdown),input.addEventListener("blur",(_ev=>{suggestionDropdown.classList.add("invisible"),suggestionDropdown.style.top="-10000000px",suggestionDropdown.style.left="-10000000px",suggestionDropdown.querySelectorAll("div.hidden").forEach((d=>d.classList.remove("hidden")))})),input.addEventListener("suggest",(v=>{input.value="",input.blur(),suggestionDropdown.querySelectorAll(".hidden").forEach((s=>s.classList.remove("hidden"))),findCallback(v.detail.id,v.detail.form)})),input.addEventListener("keydown",(ev=>{if("ArrowUp"===ev.key){if(0===suggestionDropdown.children.length)return;let target=suggestionDropdown.querySelector(".suggestion-hovered");target?target.classList.remove("suggestion-hovered"):target=suggestionDropdown.children[0];do{target=target===suggestionDropdown.children[0]?suggestionDropdown.children[suggestionDropdown.children.length-1]:target.previousElementSibling}while(target.classList.contains("hidden")||target.classList.contains("global-hidden"));target.classList.add("suggestion-hovered"),ensureOnscreen(target,suggestionDropdown)}else if("ArrowDown"===ev.key){if(0===suggestionDropdown.children.length)return;let target=suggestionDropdown.querySelector(".suggestion-hovered");target?target.classList.remove("suggestion-hovered"):target=suggestionDropdown.children[suggestionDropdown.children.length-1];do{target=target===suggestionDropdown.children[suggestionDropdown.children.length-1]?suggestionDropdown.children[0]:target.nextElementSibling}while(target.classList.contains("hidden")||target.classList.contains("global-hidden"));target.classList.add("suggestion-hovered"),ensureOnscreen(target,suggestionDropdown)}})),input.addEventListener("keyup",(ev=>{if("Enter"===ev.key){let id=-1,form=-1;const hovered=suggestionDropdown.querySelector(".suggestion-hovered");if(hovered)id=parseInt(hovered.dataset.target??"0"),form=parseInt(hovered.dataset.form??"0");else if(isNaN(parseInt(input.value))){const idEntry=suggestionDropdown.querySelector(`div[data-content="${input.value.trim().toLowerCase()}"]`);if(!idEntry||idEntry.classList.contains("hidden")||idEntry.classList.contains("global-hidden"))return;id=parseInt(idEntry.dataset.target??"0"),form=parseInt(idEntry.dataset.form??"0")}else{if(id=parseInt(input.value),id<0||id>parseInt(suggestionDropdown.dataset.max_count??"0"))return;const potential=suggestionDropdown.querySelector(`div[data-target="${id}"]`);if(!potential||potential.classList.contains("hidden"))return;form=Math.max(...[...suggestionDropdown.querySelectorAll(`div[data-target="${id}"]`)].map((d=>parseInt(d.dataset.form??"0"))))}findCallback(id,form),input.value="",input.blur(),suggestionDropdown.querySelectorAll(".hidden").forEach((s=>s.classList.remove("hidden")))}else{const cleanValue=input.value.trim().toLowerCase();let shouldShow=!1;for(const child of suggestionDropdown.children)shouldShow=child.dataset.content?.includes(cleanValue)??!1,shouldShow=shouldShow||(child.dataset.target?.includes(cleanValue)??!1),child.classList.toggle("hidden",!shouldShow),child.classList.contains("suggestion-hovered")&&(child.classList.contains("hidden")||child.classList.contains("global-hidden"))&&child.classList.remove("suggestion-hovered")}}))}function ensureOnscreen(dropdownElement,dropdown){const suggestionBounds=dropdown.getBoundingClientRect(),targettedBounds=dropdownElement.getBoundingClientRect();targettedBounds.top<=suggestionBounds.top?dropdown.scrollTop=dropdown.scrollTop+(targettedBounds.top-suggestionBounds.top):targettedBounds.bottom>=suggestionBounds.bottom&&(dropdown.scrollTop=dropdown.scrollTop+(targettedBounds.bottom-suggestionBounds.bottom))}export function createSearchDropdown(){const wrapper=document.createElement("div");return wrapper.classList.add("invisible"),wrapper.id="search-suggestion-dropdown",wrapper}export async function initializeDataset(datalist,names){for(let x=0;x<names.length;x++)appendSearchSuggestions(names[x],datalist);[...datalist.children].sort(((a,b)=>(a.textContent?.toLowerCase()??"")>(b.textContent?.toLowerCase()??"")?1:-1)).forEach((n=>datalist.appendChild(n)))}function suggestionOption_onEnter(option,datalist){datalist.querySelector(".suggestion-hovered")?.classList.remove("suggestion-hovered"),option.classList.add("suggestion-hovered")}function createSearchOption(text,id,form,datalist){const option=document.createElement("div");return option.textContent=text,option.dataset.content=text.toLowerCase(),option.dataset.target=`${id}`,option.dataset.form=`${form}`,option.addEventListener("mouseenter",(()=>suggestionOption_onEnter(option,datalist))),option.addEventListener("mouseleave",(()=>option.classList.remove("suggestion-hovered"))),option.addEventListener("mousedown",(()=>targettedInput?.dispatchEvent(new CustomEvent("suggest",{detail:{id:id,form:form}})))),option}function appendSearchSuggestions(data,datalist){data[1]&&datalist.appendChild(createSearchOption(data[1],data[0],FORM.NORMAL,datalist)),data[2]&&datalist.appendChild(createSearchOption(data[2],data[0],FORM.EVOLVED,datalist)),data[3]&&datalist.appendChild(createSearchOption(data[3],data[0],FORM.TRUE,datalist)),data[4]&&datalist.appendChild(createSearchOption(data[4],data[0],FORM.ULTRA,datalist))}