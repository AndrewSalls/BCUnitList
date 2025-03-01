export default function makeDraggable(loadoutIconList, loadoutChangeCallback = null) {
    let draggedUnit = null;
    let units = loadoutIconList.querySelectorAll(".chip");

    units.forEach(unit => {
        const u = unit.querySelector("img");
        u.addEventListener("dragstart", e => {
            draggedUnit = unit;
            e.dataTransfer.effectAllowed = "move";
            console.log(draggedUnit);
        });
        u.addEventListener("dragenter", _ => u.classList.add("dragover"));
        u.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            return false;
        });
        u.addEventListener("dragleave", _ => u.classList.remove("dragover"));
        u.addEventListener("dragend", _ => units.forEach(u2 => u2.querySelector("img").classList.remove("dragover")));

        u.addEventListener("drop", e => {
            e.stopPropagation();

            if(draggedUnit != unit) {
                const span = document.createElement("span"); // temp marker of where dragged unit is located
                loadoutIconList.insertBefore(span, draggedUnit);
                loadoutIconList.insertBefore(draggedUnit, unit.nextSibling); // nextSibling is null if none exists
                loadoutIconList.insertBefore(unit, span);
                span.remove();
                
                sortIcons(units, loadoutIconList);
                loadoutChangeCallback ?? loadoutChangeCallback();
            }
        })
    });
}

export function sortIcons(chipList, listWrapper) {
    chipList.forEach(unit => {
        if(!unit.classList.contains("set-unit")) {
            listWrapper.appendChild(unit); // shifts unset units to end
        }
    })
}