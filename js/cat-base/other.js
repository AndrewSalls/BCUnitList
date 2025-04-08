//@ts-check

/**
 * Initializes other tab of cat base menu.
 */
export default function loadOtherInfo() {
    const brokenCheck = /** @type {!HTMLInputElement} */ (document.querySelector("#seal-broken"));
    const sealLevel = /** @type {!HTMLInputElement} */ (document.querySelector("#seal-level"));

    brokenCheck.checked = window.localStorage.getItem("akb") === "1";
    brokenCheck.onchange = () => window.localStorage.setItem("akb", brokenCheck.checked ? "1" : "0");

    sealLevel.value = window.localStorage.getItem("akl") ?? "0";
    sealLevel.onchange = () => {
        if(parseInt(sealLevel.value) < 0) {
            sealLevel.value = "0";
        } else if(parseInt(sealLevel.value) > 50) {
            sealLevel.value = "50";
        }

        window.localStorage.setItem("akl", sealLevel.value);
    };
    sealLevel.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            sealLevel.value = `${parseInt(sealLevel.value) + 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            sealLevel.value = `${parseInt(sealLevel.value) - 1}`;
            sealLevel.dispatchEvent(new Event("change"));
        }
    };

    /** @type {SVGElement} */ (document.querySelector("#seal-up-arrow")).onclick = () => {
        sealLevel.value = `${parseInt(sealLevel.value) + 1}`;
        sealLevel.dispatchEvent(new Event("change"));
    };
    /** @type {SVGElement} */ (document.querySelector("#seal-down-arrow")).onclick = () => {
        sealLevel.value = `${parseInt(sealLevel.value) - 1}`;
        sealLevel.dispatchEvent(new Event("change"));
    };
}