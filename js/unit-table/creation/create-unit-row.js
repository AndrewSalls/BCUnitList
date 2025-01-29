import { createLevelInteractable, createOrbInteractable, createTalentInteractable } from "./create-row-interactable.js";

export default function createRow(entry) {
    const row = document.createElement("tr");
    row.dataset.is_collab = entry.collab;
    row.dataset.in_en = entry.in_EN;
    row.dataset.is_unobtainable = entry.unobtainable;
    row.classList.toggle("hidden", entry.hidden);

    const idBox = createIDBox(entry.id);
    const [nameBox, nameUpdate] = createNameBox([entry.normal_form, entry.evolved_form, entry.true_form, entry.ultra_form], entry.current_form);
    const [iconBox, iconReset, iconMax] = createIconBox(entry.id, entry.current_form, entry.max_form, nameUpdate);
    const [levelBox, levelReset, levelMax, plusLevelReset, plusLevelMax] = createLevelBox(entry.level_cap, entry.level, entry.plus_level);
    const [talentBox, talentReset, talentMax, ultraTalentReset, ultraTalentMax] = createTalentBox(entry.talents, entry.ultra_talents);
    const [orbBox, orbReset] = createOrbBox(entry.orb, entry.orb.length);
    const [favoriteBox, favoriteReset] = createFavoriteBox(entry.favorited);
    const optionsBox = createOptionsBox({
        reset: {
            icon: iconReset, level: levelReset, plusLevel: plusLevelReset, talent: talentReset, ultraTalent: ultraTalentReset, orb: orbReset, favorite: favoriteReset
        },
        max: {
            icon: iconMax, level: levelMax, plusLevel: plusLevelMax, talent: talentMax, ultratalent: ultraTalentMax
        },
        hide: () => {
            row.classList.add("hidden");
            document.querySelectorAll(`#unit-search-suggestions option[data-target='${entry.id}']`).forEach(o => o.disabled = true);
        }
    });

    row.append(idBox, iconBox, nameBox, levelBox, talentBox, orbBox, favoriteBox, optionsBox);
    return row;
}

export function createIDBox(id) {
    const rowID = document.createElement("td");
    rowID.classList.add("row-id");
    rowID.textContent = id;

    return rowID;
}

export function createIconBox(id, currentForm, maxForm, nameCallback) {
    const rowImage = document.createElement("td");
    rowImage.classList.add("row-image");
    rowImage.dataset.form = currentForm;
    rowImage.dataset.max_form = maxForm;

    const rowIMG = document.createElement("img");
    rowIMG.classList.add("unit-icon");
    rowIMG.src = `/assets/img/unit_icon/${id}_${currentForm}.png`;
    rowIMG.onerror = () => { rowIMG.onerror = null; rowIMG.src = "/assets/img/unit_icon/unknown.png"; }
    rowImage.appendChild(rowIMG);

    rowIMG.addEventListener("click", () => {
        if(rowImage.dataset.form === `${maxForm}`) {
            rowImage.dataset.form = 0;
        } else {
            rowImage.dataset.form = parseInt(rowImage.dataset.form) + 1;
        }

        if(!rowIMG.classList.contains("hidden")) {
            rowIMG.src = `/assets/img/unit_icon/${id}_${rowImage.dataset.form}.png`;
        }
        nameCallback(parseInt(rowImage.dataset.form));
    });

    return [rowImage,
        () => { rowImage.dataset.form = maxForm; rowIMG.click(); },
        () => { rowImage.dataset.form = maxForm - 1; rowIMG.click(); }];
}

export function createNameBox(names, currentForm) {
    const rowName = document.createElement("td");
    rowName.classList.add("row-name");
    rowName.dataset.normal_name = names[0];
    rowName.dataset.evolved_name = names[1];
    rowName.dataset.true_name = names[2];
    rowName.dataset.ultra_name = names[3];
    rowName.textContent = names[currentForm];

    return [rowName, form => rowName.textContent = names[form]];
}

export function createLevelBox(levelCapInfo, currentLevel, currentPlusLevel) {
    const rowLevel = document.createElement("td");
    rowLevel.classList.add("row-level");
    const horizontalAlign = document.createElement("span");
    horizontalAlign.classList.add("h-align");

    const maxLevel = createLevelInteractable(levelCapInfo.MaxLevel, currentLevel);
    horizontalAlign.appendChild(maxLevel);
    const maxLevelInput = maxLevel.querySelector(".level-select") ?? maxLevel;
    maxLevelInput.classList.add("max-level");

    let setPlusMin = null, setPlusMax = null;
    if(levelCapInfo.MaxPlusLevel > 0) {
        const plusText = document.createElement("p");
        plusText.classList.add("level-text");
        plusText.innerText = "+";
        horizontalAlign.appendChild(plusText);

        const maxPlusLevel = createLevelInteractable(levelCapInfo.MaxPlusLevel, currentPlusLevel);
        horizontalAlign.appendChild(maxPlusLevel);
        const maxPlusLevelInput = maxPlusLevel.querySelector(".level-select") ?? maxPlusLevel;
        maxPlusLevelInput.classList.add("max-plus-level");

        setPlusMin = () => maxPlusLevelInput.value = maxPlusLevelInput.min;
        setPlusMax = () => maxPlusLevelInput.value = maxPlusLevelInput.max;
    }

    rowLevel.appendChild(horizontalAlign);
    return [rowLevel,
        () => maxLevelInput.value = maxLevelInput.min,
        () => maxLevelInput.value = maxLevelInput.max,
        setPlusMin,
        setPlusMax];
}

export function createTalentBox(normalTalents, ultraTalents) {
    const rowTalents = document.createElement("td");
    rowTalents.classList.add("row-talent");
    const horizontalAlign = document.createElement("div");
    horizontalAlign.classList.add("h-align");

    if(normalTalents.length !== 0) {
        for(const talent of normalTalents) {
            horizontalAlign.appendChild(createTalentInteractable(talent.name, talent.cap, talent.value, false));
        }
    }

    if(ultraTalents.length !== 0) {
        for(const talent of ultraTalents) {
            horizontalAlign.appendChild(createTalentInteractable(talent.name, talent.cap, talent.value, true));
        }
    }

    rowTalents.appendChild(horizontalAlign);
    return [rowTalents,
        normalTalents.length !== 0 ? () => horizontalAlign.querySelectorAll(".regular-talent p").forEach(p => { p.innerText = 0; p.onchange(); }) : null,
        normalTalents.length !== 0 ? () => horizontalAlign.querySelectorAll(".regular-talent p").forEach(p => { p.innerText = p.parentElement.dataset.max; p.onchange(); }) : null,
        ultraTalents.length !== 0 ? () => horizontalAlign.querySelectorAll(".ultra-talent p").forEach(p => { p.innerText = 0; p.onchange(); }) : null,
        ultraTalents.length !== 0 ? () => horizontalAlign.querySelectorAll(".ultra-talent p").forEach(p => { p.innerText = p.parentElement.dataset.max; p.onchange(); }) : null];
}

export function createOrbBox(existingOrbs, orbAmount) {
    const rowOrb = document.createElement("td");
    rowOrb.classList.add("row-orb");
    let horizontalAlign = null;

    if(orbAmount > 0) {
        horizontalAlign = document.createElement("div");
        horizontalAlign.classList.add("h-align");
        for(let x = 0; x < orbAmount; x++) {
            horizontalAlign.appendChild(createOrbInteractable(existingOrbs[x]));
        }

        rowOrb.appendChild(horizontalAlign);
    }

    return [rowOrb, orbAmount > 0 ? () => {
        horizontalAlign.querySelectorAll(".orb-color").forEach(oc => { oc.dataset.trait = "none"; oc.src = "/assets/img/orb/empty-orb.png"; });
        horizontalAlign.querySelectorAll(".orb-type").forEach(ot => { ot.dataset.type = "none"; ot.src = ""; ot.classList.add("invisible"); });
        horizontalAlign.querySelectorAll(".orb-rank").forEach(or => { or.dataset.rank = "none"; or.src = ""; or.classList.add("invisible"); });
    } : null];
}

export function createFavoriteBox(isFavorited) {
    const rowFavorite = document.createElement("td");
    rowFavorite.classList.add("row-favorite");
    const favWrapper = document.createElement("div");
    favWrapper.classList.add("fav-wrapper");

    const favIcon = document.createElement("img");
    favIcon.classList.add("fav-icon");
    favIcon.src = "/assets/img/fav-empty.png";
    favWrapper.dataset.favorited = isFavorited ? 0 : 1; // Inverted since a click event gets called to update image

    favIcon.onclick = () => {
        if(favWrapper.dataset.favorited === "0") {
            favIcon.src = "/assets/img/fav-full.png";
            favWrapper.dataset.favorited = 1;
        } else {
            favIcon.src = "/assets/img/fav-empty.png";
            favWrapper.dataset.favorited = 0;
        }
    };
    favIcon.click();

    favWrapper.appendChild(favIcon);
    rowFavorite.appendChild(favWrapper);

    return [rowFavorite,
        () => { favWrapper.dataset.favorited = 1; favIcon.click(); }];
}

export function createOptionsBox(optionCallbacks) {
    const rowOptions = document.createElement("td");
    rowOptions.classList.add("row-option");
    const rowOptionAlign = document.createElement("div");
    rowOptionAlign.classList.add("row-option-wrapper");

    const includedInMax = [];

    const reset = createOptionButton("R", "Reset Unit", "reset-option", () => Object.values(optionCallbacks.reset).forEach(f => f !== null && f()));
    rowOptionAlign.appendChild(reset);

    const maxLevel = createOptionButton("L", "Max Regular Level", "level-option", optionCallbacks.max.level);
    rowOptionAlign.appendChild(maxLevel);
    includedInMax.push(maxLevel);

    if(optionCallbacks.max.plusLevel) {
        const maxPlusLevel = createOptionButton("+", "Max + Level", "plus-level-option", optionCallbacks.max.plusLevel);
        rowOptionAlign.appendChild(maxPlusLevel);
        includedInMax.push(maxPlusLevel);
    }
    if(optionCallbacks.max.talent) {
        const maxTalents = createOptionButton("T", "Max Regular Talents", "talent-option", optionCallbacks.max.talent);
        rowOptionAlign.appendChild(maxTalents);
        includedInMax.push(maxTalents);
    }
    if(optionCallbacks.max.ultraTalent) {
        const maxUltraTalents = createOptionButton("U", "Max Ultra Talents", "ultra-talent-option", optionCallbacks.max.ultraTalent);
        rowOptionAlign.appendChild(maxUltraTalents);
        includedInMax.push(maxUltraTalents);
    }

    const maxAll = createOptionButton("M", "Max Everything", "max-option", () => Object.values(optionCallbacks.max).forEach(f => f !== null && f()));
    rowOptionAlign.appendChild(maxAll);

    const hideUnit = createOptionButton("H", "Hide Unit", "hide-option", optionCallbacks.hide);
    rowOptionAlign.appendChild(hideUnit);

    rowOptions.appendChild(rowOptionAlign);

    return rowOptions;
}

function createOptionButton(text, description, className, effect) {
    const button = document.createElement("button");
    button.textContent = text;
    button.title = description;
    button.classList.add(className);
    button.classList.add("option-button");
    button.onclick = effect;

    return button;
}