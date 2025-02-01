export function allowSelection() {
    const categorySelector = document.querySelector("#category-selector");
    const categoryList = categorySelector.querySelector("#category-selector-access");
    const optionList = categorySelector.querySelector("#category-selector-options");
    categorySelector.classList.add("transitionless");
    categorySelector.style.transform = `translateY(${optionList.clientHeight}px)`;
    categorySelector.offsetHeight;
    categorySelector.classList.remove("transitionless");

    categoryList.onclick = () => {
        if(categorySelector.classList.toggle("raised")) {
            categorySelector.style.transform = "none";
        } else {
            categorySelector.style.transform = `translateY(${optionList.clientHeight}px)`;
        }
    };
    categorySelector.classList.remove("invisible");
}

export function createCategory(categoryName, categoryButtons) {
    const wrapper = document.createElement("div");
    const catTitle = document.createElement("h6");
    catTitle.textContent = categoryName;
    
    const row = document.createElement("div");
    row.classList.add("category-row");
    row.append(...categoryButtons);

    wrapper.append(catTitle, row);

    return wrapper;
}

export function createCategoryButton(buttonText, categoryObject) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = buttonText;

    button.onclick = () => {
        const toggle = document.querySelector("#jump-or-toggle");
        if(toggle.checked) {
            // Toggle category
            categoryObject.classList.toggle("hidden");
        } else {
            // Jump to category
            categoryObject.classList.toggle("hidden", false);
            window.scrollTo({ left: 0, top: window.scrollY + categoryObject.getBoundingClientRect().top, behavior: "smooth" });
        }
    };

    return button;
}

export function createCategorySelector() {
    const selector = document.createElement("div");
    selector.id = "category-selector";
    selector.classList.add("invisible");

    const selectorAccess = document.createElement("div");
    selectorAccess.classList.add("h-align");
    selectorAccess.id = "category-selector-access";

    const selectorArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    selectorArrow.setAttribute("viewBox", "0 0 32 32");
    selectorArrow.innerHTML = '<path d="M0 32 L16 0 L32 32"/>';
    const selectorLabel = document.createElement("h3");
    selectorLabel.textContent = "Select Categories";
    const secondSelectorArrow = selectorArrow.cloneNode(true);

    selectorAccess.append(selectorArrow, selectorLabel, secondSelectorArrow);

    const selectorOptions = document.createElement("div");
    selectorOptions.id = "category-selector-options";

    const optionSliderCentering = document.createElement("div");
    optionSliderCentering.id = "category-label-centering";

    const sliderLabel = document.createElement("label");
    sliderLabel.title = "Either jump to the position of a selected category on the page, or hide/show the selected category";
    sliderLabel.for = "jump-or-toggle";

    const leftText = document.createElement("p");
    leftText.textContent = "Jump to Category";

    const slider = document.createElement("span");
    slider.classList.add("slider");

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.id = "jump-or-toggle";

    const sliderBall = document.createElement("div");
    sliderBall.classList.add("slider-ball");

    slider.append(checkBox, sliderBall);

    const rightText = document.createElement("p");
    rightText.textContent = "Toggle category";

    sliderLabel.append(leftText, slider, rightText);

    optionSliderCentering.appendChild(sliderLabel);
    
    const builtinWrapper = document.createElement("div");
    builtinWrapper.classList.add("v-align");
    builtinWrapper.id = "builtin-categories";

    const baseCategories = document.createElement("div");
    baseCategories.id = "base-categories";

    const label = document.createElement("h6");
    label.textContent = "Generic";

    const row = document.createElement("div");
    row.classList.add("category-row");

    const defaultButtons = [];
    const defaultTables = [...document.querySelectorAll(".default-table")];
    defaultButtons.push(createCategoryButton("All Units", defaultTables[0]));
    defaultButtons.push(createCategoryButton("Normal", defaultTables[1]));
    defaultButtons[1].classList.add("normal-color");
    defaultButtons.push(createCategoryButton("Special", defaultTables[2]));
    defaultButtons[2].classList.add("special-color");
    defaultButtons.push(createCategoryButton("Rare", defaultTables[3]));
    defaultButtons[3].classList.add("rare-color");
    defaultButtons.push(createCategoryButton("Super Rare", defaultTables[4]));
    defaultButtons[4].classList.add("super-rare-color");
    defaultButtons.push(createCategoryButton("Uber Rare", defaultTables[5]));
    defaultButtons[5].classList.add("uber-rare-color");
    defaultButtons.push(createCategoryButton("Legend Rare", defaultTables[6]));
    defaultButtons[6].classList.add("legend-rare-color");
    defaultButtons[6].classList.add("legend-rare-animation");
    defaultButtons.push(createCategoryButton("Favorited", defaultTables[7]));

    row.append(...defaultButtons);
    baseCategories.append(label, row);
    builtinWrapper.appendChild(baseCategories);
    selectorOptions.append(optionSliderCentering, builtinWrapper);
    selector.append(selectorAccess, selectorOptions);
    return selector;
}