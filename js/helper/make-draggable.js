const MIN_DRAG_DISTANCE = 5; // 5 px offset before dragging instead of changing form

let mouseDownPos = null;
let target = null;
let targetCallback = null;
let hoverTarget = null;
let targetClone = null;

window.addEventListener("mousemove", ev => {
    if(window.document.body.classList.contains("disabled-editing-mode")) {
        return;
    }
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
        targetClone.style.left = `${ev.pageX - mouseDownPos.localX}px`;
        targetClone.style.top = `${ev.pageY - mouseDownPos.localY}px`;
    }
});

window.addEventListener("mouseup", () => {
    // Swap if target and hoverTarget exist
    if(target && hoverTarget) {
        const span = document.createElement("span"); // temp marker of where dragged unit is located
        target.parentElement.insertBefore(span, target);
        target.parentElement.insertBefore(target, hoverTarget.nextSibling); // nextSibling is null if none exists
        target.parentElement.insertBefore(hoverTarget, span);
        span.remove();
        
        sortIcons(target.parentElement);
        targetCallback && targetCallback();
    }
    mouseDownPos = null;
    if(target) {
        target.style.pointerEvents = "unset";
    }
    target = null;
    if(hoverTarget) {
        hoverTarget.classList.remove("dragover");
    }
    targetCallback = null;
    hoverTarget = null;
    if(targetClone) {
        targetClone.remove();
    }
    targetClone = null;
});

export default function makeDraggable(loadoutIconList, loadoutChangeCallback = null) {
    const units = loadoutIconList.querySelectorAll(".chip");

    units.forEach(unit => {
        unit.addEventListener("mousedown", ev => {
            if(window.document.body.classList.contains("disabled-editing-mode") || !unit.classList.contains("set-unit")) {
                return;
            }
            const bBox = unit.getBoundingClientRect();
            mouseDownPos = { localX: ev.clientX - bBox.left, localY: ev.clientY - bBox.top, x: ev.pageX, y: ev.pageY };
            target = unit;
            targetCallback = loadoutChangeCallback;
        });
        unit.addEventListener("mouseenter", () => {
            if(window.document.body.classList.contains("disabled-editing-mode")) {
                return;
            }
            if(target && target !== unit && target.parentElement === unit.parentElement) {
                hoverTarget = unit;
                unit.classList.add("dragover");
            }
        });
        unit.addEventListener("mouseleave", () => {
            hoverTarget = null;
            unit.classList.remove("dragover");
        });
    });
}

export function sortIcons(listWrapper) {
    listWrapper.querySelectorAll(".chip").forEach(unit => {
        if(!unit.classList.contains("set-unit")) {
            listWrapper.appendChild(unit); // shifts unset units to end
        }
    })
}