export default function loadOtherInfo() {
    const brokenCheck = document.querySelector("#seal-broken");
    brokenCheck.checked = window.localStorage.getItem("akb") === "1";
    brokenCheck.onchange = () => window.localStorage.setItem("akb", brokenCheck.checked ? "1" : "0");

    const sealLevel = document.querySelector("#seal-level");
    sealLevel.value = window.localStorage.getItem("akl");
    sealLevel.onchange = () => {
        if(parseInt(sealLevel.value) < 0) {
            sealLevel.value = 0;
        } else if(parseInt(sealLevel.value) > 50) {
            sealLevel.value = 50;
        }

        window.localStorage.setItem("akl", sealLevel.value);
    };
    sealLevel.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            sealLevel.value = parseInt(sealLevel.value) + 1;
            sealLevel.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            sealLevel.value = parseInt(sealLevel.value) - 1;
            sealLevel.dispatchEvent(new Event("change"));
        }
    };
    document.querySelector("#seal-up-arrow").onclick = () => {
        sealLevel.value = parseInt(sealLevel.value) + 1;
        sealLevel.dispatchEvent(new Event("change"));
    };
    document.querySelector("#seal-down-arrow").onclick = () => {
        sealLevel.value = parseInt(sealLevel.value) - 1;
        sealLevel.dispatchEvent(new Event("change"));
    };
}