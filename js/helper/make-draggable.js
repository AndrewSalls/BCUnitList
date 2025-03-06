const MIN_DRAG_DISTANCE = 5; // 5 px offset before dragging instead of changing form

export default function makeDraggable(loadoutIconList, loadoutChangeCallback = null) {
    const units = loadoutIconList.querySelectorAll(".chip");

    let mouseDownPos = null;
    let target = null;
    let hoverTarget = null;
    let targetClone = null;
    units.forEach(unit => {
        unit.addEventListener("mousedown", ev => {
            const bBox = unit.getBoundingClientRect();
            mouseDownPos = { localX: ev.pageX - bBox.left, localY: ev.pageY - bBox.top, x: ev.clientX, y: ev.clientY };
            target = unit;
        });
        unit.addEventListener("mouseenter", () => {
            if(target && target !== unit) {
                hoverTarget = unit;
                unit.classList.add("dragover");
            }
        });
        unit.addEventListener("mouseleave", () => {
            hoverTarget = null;
            unit.classList.remove("dragover");
        })
    });
    window.addEventListener("mousemove", ev => {
        if(mouseDownPos && Math.sqrt(Math.pow(ev.clientX - mouseDownPos.x, 2) + Math.pow(ev.clientY - mouseDownPos.y, 2)) > MIN_DRAG_DISTANCE && !targetClone) {
            target.style.pointerEvents = "none";
            targetClone = document.createElement("div");
            targetClone.classList.add("chip");
            targetClone.style.pointerEvents = "none";
            targetClone.style.position = "absolute";
            targetClone.style.opacity = "0.7";

            const targetCloneIMG = document.createElement("img");
            targetCloneIMG.classList.add("unit-icon");
            targetCloneIMG.src = target.querySelector("img").src;
            targetCloneIMG.style.pointerEvents = "none";
            
            targetClone.appendChild(targetCloneIMG);
            window.document.body.appendChild(targetClone);
        }
        if(targetClone) {
            targetClone.style.left = `${ev.clientX - mouseDownPos.localX}px`;
            targetClone.style.top = `${ev.clientY - mouseDownPos.localY}px`;
        }
    });
    window.addEventListener("mouseup", () => {
        // Swap if target and hoverTarget exist
        if(target && hoverTarget) {
            const span = document.createElement("span"); // temp marker of where dragged unit is located
            loadoutIconList.insertBefore(span, target);
            loadoutIconList.insertBefore(target, hoverTarget.nextSibling); // nextSibling is null if none exists
            loadoutIconList.insertBefore(hoverTarget, span);
            span.remove();
            
            sortIcons(units, loadoutIconList);
            loadoutChangeCallback && loadoutChangeCallback();
        }
        mouseDownPos = null;
        if(target) {
            target.style.pointerEvents = "unset";
        }
        target = null;
        if(hoverTarget) {
            hoverTarget.classList.remove("dragover");
        }
        hoverTarget = null;
        if(targetClone) {
            targetClone.remove();
        }
        targetClone = null;
    });
}

export function sortIcons(chipList, listWrapper) {
    chipList.forEach(unit => {
        if(!unit.classList.contains("set-unit")) {
            listWrapper.appendChild(unit); // shifts unset units to end
        }
    })
}