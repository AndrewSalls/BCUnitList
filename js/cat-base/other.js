//@ts-check

/**
 * Initializes other tab of cat base menu.
 */
export default function loadOtherInfo() {
    const brokenCheck = /** @type {!HTMLInputElement} */ (document.querySelector("#seal-broken"));
    const sealLevel = /** @type {!HTMLInputElement} */ (document.querySelector("#seal-level"));

    brokenCheck.checked = window.localStorage.getItem("akb") === "1";
    if(brokenCheck.checked) {
        /** @type {HTMLImageElement} */ (document.querySelector("#seal-altar")).src = "./assets/img/inactive_altar.png";
    }
    brokenCheck.onchange = () => {
        window.localStorage.setItem("akb", brokenCheck.checked ? "1" : "0");
        /** @type {HTMLImageElement} */ (document.querySelector("#seal-altar")).src = `./assets/img/${brokenCheck.checked ? "in" : ""}active_altar.png`;
    }

    sealLevel.value = window.localStorage.getItem("akl") ?? "0";
    sealLevel.onchange = () => {
        if(parseInt(sealLevel.value) < 0) {
            sealLevel.value = "0";
        } else if(parseInt(sealLevel.value) > 50) {
            sealLevel.value = "50";
        }

        window.localStorage.setItem("akl", sealLevel.value);
    };
    sealLevel.addEventListener("wheel", ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            sealLevel.value = `${parseInt(sealLevel.value) + 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            sealLevel.value = `${parseInt(sealLevel.value) - 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        }
    }, { passive: false });

    if(window.localStorage.getItem("s1") === "0") {
        document.querySelector("#seal-up-arrow")?.remove();
        document.querySelector("#seal-down-arrow")?.remove();
    } else {
        /** @type {SVGElement} */ (document.querySelector("#seal-up-arrow")).onclick = () => {
            sealLevel.value = `${parseInt(sealLevel.value) + 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        };
        /** @type {SVGElement} */ (document.querySelector("#seal-down-arrow")).onclick = () => {
            sealLevel.value = `${parseInt(sealLevel.value) - 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        };
    }
}