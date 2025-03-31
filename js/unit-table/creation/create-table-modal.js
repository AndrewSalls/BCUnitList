export default function createTableOptionModal() {
    const modal = document.createElement("div");
    modal.id = "table-option-modal";
    modal.classList.add("modal-bg");
    modal.classList.add("hidden");

    const modalFill = document.createElement("div");
    modalFill.classList.add("modal-fill");

    const exit = document.createElement("div");
    exit.id = "table-option-cancel";
    exit.classList.add("modal-close");
    
    const closeX = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    closeX.setAttribute("viewBox", "0 0 64 64");
    closeX.innerHTML = '<polygon points="10,0 0,10 54,64 64,54" /><polygon points="54,0 64,10 10,64 0,54" />';
    exit.appendChild(closeX);

    const label = document.createElement("h2");
    const labelSpan = document.createElement("span");
    labelSpan.id = "table-option-label";
    label.append(labelSpan, " Options");

    const content = document.createElement("div");
    content.classList.add("v-align");
    content.append(createOptionSelection(), createFilterSelection());

    modalFill.append(exit, label, content);
    modal.appendChild(modalFill);
    return modal;
}

function createOptionSelection() {
    const wrapper = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = "Update Entire Table";

    const options = document.createElement("div");
    options.id = "table-update-options";

    const twoPaneToggle = document.createElement("div");
    twoPaneToggle.classList.add("two-pane");

    const panel1 = document.createElement("div");
    panel1.classList.add("h-align");
    const panel1Input = document.createElement("input");
    panel1Input.type = "checkbox";
    panel1Input.id = "update-owned-only";
    panel1Input.title = "Only update owned units (Level ≥ 1)";

    const panel1Label = document.createElement("label");
    panel1Label.htmlFor = "update-owned-only";
    panel1Label.textContent = "Only apply to owned units";
    panel1Label.title = "Only update owned units (Level ≥ 1)";

    panel1.append(panel1Input, panel1Label);

    const panel2 = document.createElement("div");
    panel2.classList.add("h-align");
    const panel2Input = document.createElement("input");
    panel2Input.type = "checkbox";
    panel2Input.id = "update-visible-only";
    panel2Input.title = "Only update units that aren't hidden by a filter or the unit's hide button";
    panel2Input.checked = true;

    const panel2Label = document.createElement("label");
    panel2Label.htmlFor = "update-visible-only";
    panel2Label.textContent = "Only apply to visible units";
    panel2Label.title = "Only update units that aren't hidden by a filter or the unit's hide button";

    panel2.append(panel2Input, panel2Label);
    twoPaneToggle.append(panel1, panel2);

    const optionButtonCollection = document.createElement("div");
    optionButtonCollection.id = "table-modal-modifer-options";
    optionButtonCollection.classList.add("h-align");

    optionButtonCollection.append(
        createModalButton("Show all Hidden Units", "unhide-all", "Unhide All"),
        createModalButton("Reset all Units to Default, Unowned State", "reset-all", "Reset All"),
        createModalButton("Obtain all Units (Set Lvl 0 to Lvl 1)", "own-all", "Own All"),
        createModalButton("Set all Units to Highest Available Evolution", "fully-evolve-all", "Fully Evolve All"),
        createModalButton("Increase all Levels to 30 (If Possible)", "level-30-all", "Level All to 30"),
        createModalButton("Increase all Levels to Maximum", "level-50-all", "Level All to Max"),
        createModalButton("Max Everything but Talent Orbs", "max-all", "Max All")
    );

    options.append(twoPaneToggle, optionButtonCollection);

    wrapper.append(title, options);
    return wrapper;
}

function createFilterSelection() {
    const wrapper = document.createElement("div");

    const label = document.createElement("h3");
    label.textContent = "Filter Table";

    const filterButtonCollection = document.createElement("div");
    filterButtonCollection.id = "table-filter-options";

    filterButtonCollection.appendChild(createModalButtonSuperGroup("Misc", [
        createModalButton("Units that haven't been released or are summons", "fake-filter", "Unreleased"),
        createModalButton("Collab Exclusive Units", "collab-filter", "Collab"),
        createModalButton("JP/KR/TW Exclusive Units", "version-filter", "Not in EN")
    ], [
        createModalButton("Unobtained Units", "unobtained-filter", "Unobtained"),
        createModalButton("Favorited Units", "favorite-filter", "Non-favorited")
    ]));

    filterButtonCollection.appendChild(createModalButtonSuperGroup("Unit Forms", [
        createModalButton("Normal Form Units", "normal-filter", "NF"),
        createModalButton("Evolved Form Units", "evolved-filter", "EF"),
        createModalButton("True Form Units", "true-filter", "TF"),
        createModalButton("Ultra Form Units", "ultra-filter", "UF")
    ], [
        createModalButton("Fully Evolved Units", "fully-evolved-filter", "Form MAX"),
        createModalButton("Not Fully Evolved Units", "not-fully-evolved-filter", "Form Not MAX")
    ]));

    filterButtonCollection.appendChild(createModalButtonSuperGroup("Unit Levels", [
        createModalButton("Max Regular Level", "max-lvl-filter", "Max Lvl"),
        createModalButton("Not Max Regular Level", "not-max-lvl-filter", "Not Max Lvl"),
        createModalButton("Max Level of 1", "lvl-1-filter", "Max Lvl 1")
    ], [
        createModalButton("Max Plus Level", "max-plus-filter", "Max + Lvl"),
        createModalButton("Not Max Plus Level", "not-max-plus-filter", "Not Max + Lvl"),
        createModalButton("Max Plus Level of 0", "plus-0-filter", "No + Lvls")
    ]));

    filterButtonCollection.appendChild(createModalButtonSuperGroup("Unit Talents", [
        createModalButton("Regular Talents Max Level", "max-talent-filter", "Max Talents"),
        createModalButton("Regular Talents not Max Level", "not-max-talent-filter", "Not Max Talents")
    ], [
        createModalButton("Ultra Talents Max Level", "max-ut-filter", "Max UT"),
        createModalButton("Ultra Talents not Max Level", "not-max-ut-filter", "Not Max UT")
    ], [
        createModalButton("Can Have Regular Talents", "has-talent-filter", "Can Have Talents"),
        createModalButton("Can Have Ultra Talents", "has-ut-filter", "Can Have UTs"),
        createModalButton("Cannot Have any Talents", "talentless-filter", "Can't Have Talents"),
        createModalButton("Cannot Have any Ultra Talents", "utless-filter", "Can't Have UTs")
    ]));

    filterButtonCollection.appendChild(createModalButtonSuperGroup("Talent Orbs", [
        createModalButton("Has Anti-Red Orb Equipped", "red-filter", "Red"),
        createModalButton("Has Anti-Floating Orb Equipped", "floating-filter", "Floating"),
        createModalButton("Has Anti-Black Orb Equipped", "black-filter", "Black"),
        createModalButton("Has Anti-Metal Orb Equipped", "metal-filter", "Metal"),
        createModalButton("Has Anti-Angel Orb Equipped", "angel-filter", "Angel"),
        createModalButton("Has Anti-Alien Orb Equipped", "alien-filter", "Alien"),
        createModalButton("Has Anti-Zombie Orb Equipped", "zombie-filter", "Zombie"),
        createModalButton("Has Anti-Relic Orb Equipped", "relic-filter", "Relic"),
        createModalButton("Has Anti-Aku Orb Equipped", "aku-filter", "Aku")
    ], [
        createModalButton("Has Attack Orb Equipped", "attack-filter", "Attack"),
        createModalButton("Has Defense Orb Equipped", "defense-filter", "Defense"),
        createModalButton("Has Massive Damage Orb Equipped", "massive-filter", "Massive Damage"),
        createModalButton("Has Resistant Orb Equipped", "resist-filter", "Resistant"),
        createModalButton("Has Tough Orb Equipped", "tough-filter", "Tough")
    ], [
        createModalButton("Has D Rank Orb Equipped", "d-rank-filter", "D"),
        createModalButton("Has C Rank Orb Equipped", "c-rank-filter", "C"),
        createModalButton("Has B Rank Orb Equipped", "b-rank-filter", "B"),
        createModalButton("Has A Rank Orb Equipped", "a-rank-filter", "A"),
        createModalButton("Has S Rank Orb Equipped", "s-rank-filter", "S")
    ]));

    wrapper.append(label, filterButtonCollection);
    return wrapper;
}

function createModalButton(title, id, text) {
    const button = document.createElement("button");
    button.classList.add("table-option-button");
    button.type = "button";
    button.textContent = text;
    button.id = id;
    button.title = title;

    return button;
}

function createModalButtonSuperGroup(title, ...buttonGroups) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("table-filter-group");

    const groupTitle = document.createElement("h4");
    groupTitle.textContent = title;
    wrapper.appendChild(groupTitle);

    for(const group of buttonGroups) {
        const groupWrapper = document.createElement("div");
        groupWrapper.classList.add("h-align");
        groupWrapper.append(...group);
        wrapper.appendChild(groupWrapper);
    }

    return wrapper;
}