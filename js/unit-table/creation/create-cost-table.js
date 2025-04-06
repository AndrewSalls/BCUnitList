//@ts-check
/**
 * Creates a cost table based on the provided data.
 * @param {Object} costData The cost data to use for the table.
 * @param {string} name The name of the table.
 * @returns {HTMLDivElement} The created table.
 */
export default function createTableFromData(costData, name) {
    const hasUbers = costData.hasUber;

    const wrapper = document.createElement("div");
    wrapper.classList.add("evo-table");

    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("table-title-wrapper");

    const collapsible = document.createElement("div");
    collapsible.classList.add("collapsible");

    const collapseBox = document.createElement("div");
    collapseBox.classList.add("table-title-collapser");
    collapseBox.onclick = () => collapsible.classList.toggle("hidden");
    titleWrapper.appendChild(collapseBox);

    const title = document.createElement("h5");
    title.classList.add("table-title");
    title.textContent = name;
    titleWrapper.appendChild(title);

    if(hasUbers) {
        const uberToggleFilter = document.createElement("input");
        uberToggleFilter.classList.add("ut-uf-included");
        uberToggleFilter.title = "Exclude evolution materials that require dark catseyes to use";
        uberToggleFilter.type = "checkbox";
        uberToggleFilter.checked = true;
        uberToggleFilter.onchange = () => {
            wrapper.querySelectorAll(".evo-mat-wrapper").forEach(w => w.dispatchEvent(new CustomEvent("toggle-dark")));
        };

        const uberToggleLabel = document.createElement("label");
        uberToggleLabel.classList.add("included-label");
        uberToggleLabel.textContent = "Include Dark Catseye/UT/UF?";
        uberToggleLabel.title = "Whether evolution materials that require dark catseyes to use should be included in the totals";
        uberToggleLabel.appendChild(uberToggleFilter);
        titleWrapper.append(uberToggleLabel);
    }

    const xpNPWrapper = document.createElement("div");
    xpNPWrapper.append(
        createLabelledImageEvoBox("./assets/img/evo_mats/xp.png", "XP needed to perform all evolutions", "p-img", "EVO", costData.formXP, costData.ultra.formXP, hasUbers),
        createLabelledImageEvoBox("./assets/img/evo_mats/xp.png", "XP needed to level all units up to level 30", "p-img", "30", costData.lvl30XP, costData.ultra.lvl30XP),
        createLabelledImageEvoBox("./assets/img/evo_mats/xp.png", "XP needed to level all units to their maximum level", "p-img", "MAX", costData.lvlMaxXP, costData.ultra.lvlMaxXP, hasUbers),
        createEvoBox("./assets/img/evo_mats/np.png", "NP needed for all talents", "p-img", costData.maxNP, costData.ultra.maxNP, hasUbers),
        createEvoBox("./assets/img/orb/empty-orb.png", "S-rank orbs needed to fill all talent orb slots", "s-rank", costData.sOrb, costData.ultra.sOrb, hasUbers)
    );

    const catseyeWrapper = document.createElement("div");
    catseyeWrapper.append(
        createEvoBox("./assets/img/evo_mats/special_catseye.png", "Special catseyes needed to fully level all units", "catseye", costData.catseye_EX, costData.ultra.catseye_EX),
        createEvoBox("./assets/img/evo_mats/rare_catseye.png", "Rare catseyes needed to fully level all units", "catseye", costData.catseye_RR, costData.ultra.catseye_RR),
        createEvoBox("./assets/img/evo_mats/super_rare_catseye.png", "Super Rare catseyes needed to fully level all units", "catseye", costData.catseye_SR, costData.ultra.catseye_SR),
        createEvoBox("./assets/img/evo_mats/uber_rare_catseye.png", "Uber Rare catseyes needed to fully level all units", "catseye", costData.catseye_UR, costData.ultra.catseye_UR),
        createEvoBox("./assets/img/evo_mats/legend_catseye.png", "Legend Rare catseyes needed to fully level all units", "catseye", costData.catseye_LR, costData.ultra.catseye_LR),
        createEvoBox("./assets/img/evo_mats/dark_catseye.png", "Dark catseyes needed to reach level 60 on all units", "catseye", costData.catseye_dark, costData.ultra.catseye_dark, hasUbers)
    );

    const catfruitWrapper = document.createElement("div");
    catfruitWrapper.append(
        createEvoBox("./assets/img/evo_mats/green_fruit.png", "Green Catfruit needed to fully evolve all units", "big-fruit", costData.green_fruit, costData.ultra.green_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/purple_fruit.png", "Purple Catfruit needed to fully evolve all units", "big-fruit", costData.purple_fruit, costData.ultra.purple_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/red_fruit.png", "Red Catfruit needed to fully evolve all units", "big-fruit", costData.red_fruit, costData.ultra.red_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/blue_fruit.png", "Blue Catfruit needed to fully evolve all units", "big-fruit", costData.blue_fruit, costData.ultra.blue_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/yellow_fruit.png", "Yellow Catfruit needed to fully evolve all units", "big-fruit", costData.yellow_fruit, costData.ultra.yellow_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/epic_fruit.png", "Epic Catfruit needed to fully evolve all units", "big-fruit", costData.epic_fruit, costData.ultra.epic_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/elder_fruit.png", "Elder Catfruit needed to fully evolve all units", "big-fruit", costData.elder_fruit, costData.ultra.elder_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/aku_fruit.png", "Aku Catfruit needed to fully evolve all units", "big-fruit", costData.aku_fruit, costData.ultra.aku_fruit, hasUbers),
        createEvoBox("./assets/img/evo_mats/gold_fruit.png", "Gold Catfruit needed to fully evolve all units", "big-fruit", costData.gold_fruit, costData.ultra.gold_fruit, hasUbers)
    );

    const seedWrapper = document.createElement("div");
    seedWrapper.append(
        createEvoBox("./assets/img/evo_mats/green_seed.png", "Green Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.green_seed, costData.ultra.green_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/purple_seed.png", "Purple Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.purple_seed, costData.ultra.purple_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/red_seed.png", "Red Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.red_seed, costData.ultra.red_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/blue_seed.png", "Blue Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.blue_seed, costData.ultra.blue_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/yellow_seed.png", "Yellow Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.yellow_seed, costData.ultra.yellow_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/epic_seed.png", "Epic Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.epic_seed, costData.ultra.epic_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/elder_seed.png", "Elder Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.elder_seed, costData.ultra.elder_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/aku_seed.png", "Aku Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.aku_seed, costData.ultra.aku_seed, hasUbers),
        createEvoBox("./assets/img/evo_mats/gold_seed.png", "Gold Catfruit Seeds needed to fully evolve all units", "small-fruit", costData.gold_seed, costData.ultra.gold_seed, hasUbers)
    );

    const gemWrapper = document.createElement("div");
    const epicGap = document.createElement("span");
    epicGap.classList.add("evo-mat-wrapper");

    gemWrapper.append(
        createEvoBox("./assets/img/evo_mats/green_gem.png", "Green Behemoth Gems needed to fully evolve all units", "big-rock", costData.green_gem, costData.ultra.green_gem, hasUbers),
        createEvoBox("./assets/img/evo_mats/purple_gem.png", "Purple Behemoth Gems needed to fully evolve all units", "big-rock", costData.purple_gem, costData.ultra.purple_gem, hasUbers),
        createEvoBox("./assets/img/evo_mats/red_gem.png", "Red Behemoth Gems needed to fully evolve all units", "big-rock", costData.red_gem, costData.ultra.red_gem, hasUbers),
        createEvoBox("./assets/img/evo_mats/blue_gem.png", "Blue Behemoth Gems needed to fully evolve all units", "big-rock", costData.blue_gem, costData.ultra.blue_gem, hasUbers),
        createEvoBox("./assets/img/evo_mats/yellow_gem.png", "Yellow Behemoth Gems needed to fully evolve all units", "big-rock", costData.yellow_gem, costData.ultra.yellow_gem, hasUbers),
        epicGap
    );

    const stoneWrapper = document.createElement("div");
    stoneWrapper.append(
        createEvoBox("./assets/img/evo_mats/green_stone.png", "Green Behemoth Stones needed to fully evolve all units", "small-rock", costData.green_stone, costData.ultra.green_stone, hasUbers),
        createEvoBox("./assets/img/evo_mats/purple_stone.png", "Purple Behemoth Stones needed to fully evolve all units", "small-rock", costData.purple_stone, costData.ultra.purple_stone, hasUbers),
        createEvoBox("./assets/img/evo_mats/red_stone.png", "Red Behemoth Stones needed to fully evolve all units", "small-rock", costData.red_stone, costData.ultra.red_stone, hasUbers),
        createEvoBox("./assets/img/evo_mats/blue_stone.png", "Blue Behemoth Stones needed to fully evolve all units", "small-rock", costData.blue_stone, costData.ultra.blue_stone, hasUbers),
        createEvoBox("./assets/img/evo_mats/yellow_stone.png", "Yellow Behemoth Stones needed to fully evolve all units", "small-rock", costData.yellow_stone, costData.ultra.yellow_stone, hasUbers),
        createEvoBox("./assets/img/evo_mats/epic_stone.png", "Epic Behemoth Stones needed to fully evolve all units", "small-rock", costData.epic_stone, costData.ultra.epic_stone, hasUbers)
    );

    collapsible.append(xpNPWrapper, catseyeWrapper, catfruitWrapper, seedWrapper, gemWrapper, stoneWrapper);
    wrapper.append(titleWrapper, collapsible);

    if(window.localStorage.getItem("s2") === "1") {
        collapseBox.click();
    }

    return wrapper;
}

/**
 * Creates an element representing an evolution material.
 * @param {string} img The image path as a string.
 * @param {string} title The title of the image.
 * @param {string} imgClass A class to assign to the image.
 * @param {number} baseAmt The base amount of this evolution material needed to max all units.
 * @param {number} ultraShift The amount of this evolution material needed only for things that require dark catseyes.
 * @returns {HTMLDivElement} The created element.
 */
function createEvoBox(img, title, imgClass, baseAmt, ultraShift, hasToggle = false) {
    const evoWrapper = document.createElement("div");
    evoWrapper.classList.add("evo-mat-wrapper");

    const imgBox = document.createElement("span");
    imgBox.classList.add("evo-img-spacer");

    const evoIMG = document.createElement("img");
    evoIMG.classList.add(imgClass);
    evoIMG.src = img;
    evoIMG.title = title;

    imgBox.appendChild(evoIMG);

    const evoTotal = document.createElement("p");
    evoTotal.classList.add("evo-mat-needed");
    evoTotal.textContent = baseAmt.toLocaleString();
    if(hasToggle) {
        evoWrapper.addEventListener("toggle-dark", () => {
            evoTotal.classList.toggle("lightened");
            const numberDisplay = evoTotal.classList.contains("lightened") ? (baseAmt - ultraShift) : baseAmt;
            evoTotal.textContent = numberDisplay.toLocaleString();
        });
    }

    evoWrapper.append(imgBox, evoTotal);
    return evoWrapper;
}

/**
 * Creates an element representing an evolution material whose image has text appended.
 * @param {string} img The image path as a string.
 * @param {string} title The title of the image.
 * @param {string} imgClass A class to assign to the image.
 * @param {string} imgSubtext The text to append to the image.
 * @param {number} baseAmt The base amount of this evolution material needed to max all units.
 * @param {number} ultraShift The amount of this evolution material needed only for things that require dark catseyes.
 * @returns {HTMLDivElement} The created element.
 */
function createLabelledImageEvoBox(img, title, imgClass, imgSubtext, baseAmt, ultraShift, hasToggle = false) {
    const evoWrapper = document.createElement("div");
    evoWrapper.classList.add("evo-mat-wrapper");

    const imgBox = document.createElement("span");
    imgBox.classList.add("evo-img-spacer");
    imgBox.classList.add("table-img-label");

    const evoIMG = document.createElement("img");
    evoIMG.classList.add(imgClass);
    evoIMG.src = img;
    evoIMG.title = title;

    const imgLabel = document.createElement("p");
    imgLabel.classList.add("evo-img-label");
    imgLabel.textContent = imgSubtext;

    imgBox.append(evoIMG, imgLabel);

    const evoTotal = document.createElement("p");
    evoTotal.classList.add("evo-mat-needed");
    evoTotal.textContent = baseAmt.toLocaleString();
    if(hasToggle) {
        evoWrapper.addEventListener("toggle-dark", () => {
            evoTotal.classList.toggle("lightened");
            const numberDisplay = evoTotal.classList.contains("lightened") ? (baseAmt - ultraShift) : baseAmt;
            evoTotal.textContent = numberDisplay.toLocaleString();
        });
    }

    evoWrapper.append(imgBox, evoTotal);
    return evoWrapper;
}

/**
 * Creates an ability cost table.
 * @param {number} xpAmt The amount of XP needed to fully upgrade all abilities.
 * @return {HTMLDivElement} A cost table modified to only contain the total XP tracker.
 */
export function createAbilityTableFromData(xpAmt) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("evo-table");
    wrapper.classList.add("ability-upgrade-color");

    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("table-title-wrapper");

    const collapsible = document.createElement("div");
    collapsible.classList.add("collapsible");

    const collapseBox = document.createElement("div");
    collapseBox.classList.add("table-title-collapser");
    collapseBox.onclick = () => collapsible.classList.toggle("hidden");
    titleWrapper.appendChild(collapseBox);

    const title = document.createElement("h5");
    title.classList.add("table-title");
    title.textContent = "Abilities";
    titleWrapper.appendChild(title);

    const xpRow = document.createElement("div");

    xpRow.appendChild(createLabelledImageEvoBox("./assets/img/evo_mats/xp.png", "XP needed to level all units to their maximum level", "p-img", "MAX", xpAmt, 0, false));
    collapsible.appendChild(xpRow);
    wrapper.append(titleWrapper, collapsible);

    if(window.localStorage.getItem("s2") === "1") {
        collapseBox.click();
    }

    return wrapper;
}