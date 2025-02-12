export default function createArrowNumberBox(cap, currentValue, changeCallback) {
    const labelInput = document.createElement("input");
    labelInput.type = "number";
    labelInput.value = currentValue;
    labelInput.min = 0;
    labelInput.max = cap;
    labelInput.step = 1;
    labelInput.dataset.lastValue = currentValue;

    labelInput.onchange = () => {
        if(parseInt(labelInput.value) < 0) {
            labelInput.value = 0;
        } else if(parseInt(labelInput.value) > cap) {
            labelInput.value = cap;
        }

        changeCallback(parseInt(labelInput.dataset.lastValue), parseInt(labelInput.value));
        labelInput.dataset.lastValue = labelInput.value;
    }

    labelInput.onwheel = ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            labelInput.value = parseInt(labelInput.value) + 1;
            labelInput.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            labelInput.value = parseInt(labelInput.value) - 1;
            labelInput.dispatchEvent(new Event("change"));
        }
    };

    if(window.localStorage.getItem("s1") === "1") {
        const labelInputWrapper = document.createElement("div");
        labelInputWrapper.classList.add("v-align");

        const upArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        upArrow.classList.add("upgrade-arrow");
        upArrow.setAttribute("viewBox", "0 0 32 24");
        upArrow.innerHTML = "<path d='M0 24 L16 8 L32 24'></path>";
        upArrow.onclick = () => {
            labelInput.value = parseInt(labelInput.value) + 1;
            labelInput.dispatchEvent(new Event("change"));
        };

        const downArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        downArrow.classList.add("upgrade-arrow");
        downArrow.setAttribute("viewBox", "0 0 32 24");
        downArrow.innerHTML = "<path d='M0 0 L16 16 L32 0'></path>";
        downArrow.onclick = () => {
            labelInput.value = parseInt(labelInput.value) - 1;
            labelInput.dispatchEvent(new Event("change"));
        };

        labelInputWrapper.append(upArrow, labelInput, downArrow);
        return [labelInputWrapper, labelInput];
    } else {
        return [labelInput, labelInput];
    }
}