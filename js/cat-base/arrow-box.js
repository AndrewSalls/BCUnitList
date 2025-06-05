//@ts-check

/**
 * Creates a number input, with arrows above and below if the corresponding setting is enabled in localStorage.
 * @param {number} cap The maximum value of the number input.
 * @param {number} currentValue The initial value of the number input.
 * @param {(prev: number, curr: number) => void} changeCallback A function to call when the number input's value changes.
 * @param {number} [min = 0] The minimum allowed value for the number input.
 * @returns {[HTMLDivElement, HTMLInputElement]} An HTML element representing the input, and the specific input element that can be queried for its value.
 */
export default function createArrowNumberBox(cap, currentValue, changeCallback, min = 0) {
    const labelInput = document.createElement("input");
    labelInput.type = "number";
    labelInput.value = `${currentValue}`;
    labelInput.min = `${min}`;
    labelInput.max = `${cap}`;
    labelInput.step = "1";
    labelInput.dataset.lastValue = `${currentValue}`;

    labelInput.onchange = () => {
        if(parseInt(labelInput.value) < parseInt(labelInput.min)) {
            labelInput.value = labelInput.min;
        } else if(parseInt(labelInput.value) > parseInt(labelInput.max)) {
            labelInput.value = labelInput.max;
        }

        changeCallback(parseInt(labelInput.dataset.lastValue ?? "0"), parseInt(labelInput.value));
        labelInput.dataset.lastValue = labelInput.value;
    }

    labelInput.addEventListener("wheel", ev => {
        ev.preventDefault();
        if(ev.deltaY < 0) {
            labelInput.value = `${parseInt(labelInput.value) + 1}`;
            labelInput.dispatchEvent(new Event("change"));
        } else if(ev.deltaY > 0) {
            labelInput.value = `${parseInt(labelInput.value) - 1}`;
            labelInput.dispatchEvent(new Event("change"));
        }
    }, { passive: false });

    if(window.localStorage.getItem("s1") === "1") {
        const labelInputWrapper = document.createElement("div");
        labelInputWrapper.classList.add("v-align");

        const upArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        upArrow.classList.add("upgrade-arrow");
        upArrow.setAttribute("viewBox", "0 0 32 24");
        upArrow.innerHTML = "<path d='M0 24 L16 8 L32 24'></path>";
        upArrow.onclick = () => {
            labelInput.value = `${(parseInt(labelInput.value) + 1)}`;
            labelInput.dispatchEvent(new Event("change"));
        };

        const downArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        downArrow.classList.add("upgrade-arrow");
        downArrow.setAttribute("viewBox", "0 0 32 24");
        downArrow.innerHTML = "<path d='M0 0 L16 16 L32 0'></path>";
        downArrow.onclick = () => {
            labelInput.value = `${(parseInt(labelInput.value) - 1)}`;
            labelInput.dispatchEvent(new Event("change"));
        };

        labelInputWrapper.append(upArrow, labelInput, downArrow);
        return [labelInputWrapper, labelInput];
    } else {
        return [labelInput, labelInput];
    }
}