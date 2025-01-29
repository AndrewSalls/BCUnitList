export function observeRowChange(row, observerCallback) {
    row.querySelector(".unit-icon").addEventListener("click", observerCallback);
    row.querySelectorAll(".level-select").forEach(l => l.addEventListener("change", observerCallback));
    row.querySelectorAll(".talent-box .talent-level").forEach(t => t.addEventListener("change", observerCallback));
    row.querySelectorAll(".orb-selector").forEach(o => o.addEventListener("change", observerCallback));
    row.querySelector(".fav-icon").addEventListener("click", observerCallback);
    row.querySelectorAll(".row-option .option-button").forEach(o => o.addEventListener("click", observerCallback));
    row.addEventListener("generic-update", observerCallback);
}

export function getValuesFromRow(row) {
    const output = {
        id: parseInt(row.querySelector(".row-id").textContent),
        current_form: parseInt(row.querySelector(".row-image").getAttribute("data-form")),
        level: parseInt(row.querySelector(".max-level.level-select").value),
        plus_level: 0,
        talents: [],
        ultra_talents: [],
        orb: [],
        favorited: row.querySelector(".row-favorite .fav-wrapper").getAttribute("data-favorited") === "1",
        hidden: row.classList.contains("hidden")
    };

    const plusLevel = row.querySelector(".max-plus-level.level-select");
    if(plusLevel) {
        output.plus_level = parseInt(plusLevel.value);
    }

    const talents = [...row.querySelectorAll(".talent-box.regular-talent")];
    if(talents.length > 0) {
        output.talents = talents.map(t => parseInt(t.querySelector(".talent-level").innerText));
    }
    const ultraTalents = [...row.querySelectorAll(".talent-box.ultra-talent")];
    if(ultraTalents.length > 0) {
        output.ultra_talents = ultraTalents.map(t => parseInt(t.querySelector(".talent-level").innerText));
    }

    const orbs = [...row.querySelectorAll(".orb-selector")];
    if(orbs.length > 0) {
        output.orb = orbs.map(o => {
            if(o.querySelector(".orb-color").dataset.trait === "none") {
                return null;
            }

            return {
                trait: o.querySelector(".orb-color").dataset.trait,
                type: o.querySelector(".orb-type").dataset.type,
                rank: o.querySelector(".orb-rank").dataset.rank
            };
        });
    }

    return output;
}