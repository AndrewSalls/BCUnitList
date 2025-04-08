//@ts-check
const MIN_DRAG_DISTANCE = 5; // 5 px offset before dragging instead of changing form

let mouseDownPos = null;
let target = null;
let targetCallback = null;
let hoverTarget = null;
let targetClone = null;

/**
 * Moves a dragged unit chip to the current mouse location.
 */
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

/**
 * Checks for a unit chip being dragged, and if it is released above another unit chip from the same loadout, shifts the second unit chip out of the way.
 */
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

/**
 * Makes the unit chips in a loadout's wrapper element draggable.
 * @param {HTMLDivElement} loadoutIconList The wrapper containing the unit chips.
 * @param {(() => void)|null} [loadoutChangeCallback = null] A function used to tell the page to save the updated loadout, or null if the loadout should not be saved.
 */
export default function makeDraggable(loadoutIconList, loadoutChangeCallback = null) {
    const units = /** @type {NodeListOf<HTMLDivElement>} */ (loadoutIconList.querySelectorAll(".chip"));

    units.forEach(unit => {
        unit.addEventListener("mousedown", (/** @type {MouseEvent} */ ev) => {
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

/**
 * Sorts unit chips within a single loadout.
 * @param {HTMLDivElement} listWrapper The element containing the icons to be sorted.
 */
export function sortIcons(listWrapper) {
    listWrapper.querySelectorAll(".chip").forEach((/** @type {Element} */ unit) => {
        if(!unit.classList.contains("set-unit")) {
            listWrapper.appendChild(unit); // shifts unset units to end
        }
    })
}