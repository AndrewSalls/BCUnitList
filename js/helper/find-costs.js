const TALENT_NP_MAP = {
    "EX":  {
        "125": [10, 10, 10, 10, 10, 15, 15, 15, 15, 15],
        "165": [50, 10, 10, 10, 10, 15, 15, 15, 15, 15],
        "215": [75, 10, 10, 10, 10, 20, 20, 20, 20, 20],
        "75": [75]
    },
    "RR": {
        "75": [5, 5, 5, 5, 5, 10, 10, 10, 10, 10],
        "25": [5, 5, 5, 5, 5],
        "95": [25, 5, 5, 5, 5, 10, 10, 10, 10, 10],
        "50": [50]
    },
    "SR": {
        "125": [10, 10, 10, 10, 10, 15, 15, 15, 15, 15],
        "165": [50, 10, 10, 10, 10, 15, 15, 15, 15, 15],
        "75": [75]
    },
    "UR": {
        "175": [15, 15, 15, 15, 15, 20, 20, 20, 20, 20],
        "235": [75, 15, 15, 15, 15, 20, 20, 20, 20, 20],
        "285": [100, 15, 15, 15, 15, 25, 25, 25, 25, 25],
        "100": [100],
        "150": [150]
    }
}

const UT_NP_MAP = {
    "225": [20, 20, 20, 20, 20, 25, 25, 25, 25, 25],
    "285": [100, 15, 15, 15, 15, 25, 25, 25, 25, 25],
    "150": [150]
}

let levelingCost;

export function isInitialized() {
    return !!levelingCost;
}

export async function initializeLeveling() {
    levelingCost = await fetch("assets/unit_data/leveling_stats.csv")
        .then(r => r.text())
        .then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data)
        .catch(e => console.error(e));
}

export default async function getCostsFor(unitList) {    
    unitList.sort((a, b) => a.id - b.id);

    const tables = Object.groupBy(unitList, v => Math.floor(v.id / 100) * 100);
    const promises = [];
    
    const tableAllValues = {
        formXP: 0, lvl30XP: 0, lvlMaxXP: 0, maxNP: 0, sOrb: 0, catseye_EX: 0, catseye_RR: 0, catseye_SR: 0, catseye_UR: 0, catseye_LR: 0, catseye_dark: 0,
        green_fruit: 0, purple_fruit: 0, red_fruit: 0, blue_fruit: 0, yellow_fruit: 0, epic_fruit: 0, elder_fruit: 0, aku_fruit: 0, gold_fruit: 0,
        green_seed: 0, purple_seed: 0, red_seed: 0, blue_seed: 0, yellow_seed: 0, epic_seed: 0, elder_seed: 0, aku_seed: 0, gold_seed: 0,
        green_gem: 0, purple_gem: 0, red_gem: 0, blue_gem: 0, yellow_gem: 0,
        green_stone: 0, purple_stone: 0, red_stone: 0, blue_stone: 0, yellow_stone: 0, epic_stone: 0,
        has_units: true
    };
    const tableUltraValues = {...tableAllValues};
    
    if(unitList.length === 0) {
        tableAllValues.ultra = tableUltraValues;
        tableAllValues.has_units = false;
        return tableAllValues;
    }

    for(const key of Object.keys(tables)) {
        const numKey = parseInt(key);
        promises.push(fetch(`assets/unit_data/unit_costs_${numKey}.csv`)
            .then(r => r.text())
            .then(t => Papa.parse(t, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            }).data)
            .then(entries => {
                for(const unit of tables[key]) {
                    const row = entries[unit.id - numKey];
                    
                    // ------------------------------------- XP costs ------------------------------------- 
                    const xpTable = getLevelingCosts(unit, row.LevelFormat);
                    if(unit.max_form >= 2) {
                        tableAllValues.formXP += row.TrueXPCost;
                    }
                    if(unit.max_form >= 3) {
                        tableAllValues.formXP += row.UltraXPCost;
                        tableUltraValues.formXP += row.UltraXPCost;
                    }
                    const lvl30 = Math.min(30, unit.level_cap.MaxLevel);
                    if(unit.level < lvl30) {
                        tableAllValues.lvl30XP += getXPToLvl(xpTable, lvl30, unit.level);
                    }
                    if(unit.level < unit.level_cap.MaxLevel) {
                        tableAllValues.lvlMaxXP += getXPToLvl(xpTable, unit.level_cap.MaxLevel, unit.level);

                        if(unit.level_cap.MaxLevel > 50) {
                            tableUltraValues.lvlMaxXP += getXPToLvl(xpTable, unit.level_cap.MaxLevel, Math.max(unit.level, 50));
                        }
                    }

                    // ------------------------------------- NP costs ------------------------------------- 
                    if(unit.talents.length > 0) {
                        const talentNPCosts = `${row.TalentNP}`.split("-");
                        unit.talents.forEach((talent, i) => {
                            if(talent.value < talent.cap) {
                                tableAllValues.maxNP += getNPToLvl(TALENT_NP_MAP[unit.rarity][talentNPCosts[i]], talent.value);
                            }
                        });
                    }

                    if(unit.ultra_talents.length > 0) {
                        const ultraTalentNPCosts = `${row.UltraTalentNP}`.split("-");
                        unit.ultra_talents.forEach((talent, i) => {
                            if(talent.value < talent.cap) {
                                const npIncrease = getNPToLvl(UT_NP_MAP[ultraTalentNPCosts[i]], talent.value);
                                tableAllValues.maxNP += npIncrease;
                                tableUltraValues.maxNP += npIncrease;
                            }
                        });
                    }

                    // ------------------------------------- Non-S Rank Orb Count -------------------------------------
                    if(unit.orb.length > 0) { // Talent orb
                        tableAllValues.sOrb += !(unit.orb[0] !== null && unit.orb[0].rank === "s");
                    }
                    if(unit.orb.length > 1) { // UT orb
                        const isSRank = !(unit.orb[1] !== null && unit.orb[1].rank === "s");
                        tableAllValues.sOrb += isSRank;
                        tableUltraValues.sOrb += isSRank;
                    }

                    // ------------------------------------- Catseye costs ------------------------------------- 
                    if(unit.level_cap.MaxLevel > 30) {
                        tableAllValues[`catseye_${unit.rarity}`] += Math.min(25, Math.max(0, 45 - unit.level) + 2 * Math.max(0, 50 - unit.level));
                    }
                    if(unit.level_cap.MaxLevel > 50) {
                        const darkEyes = Math.min(15, Math.max(0, 55 - unit.level) + 2 * Math.max(0, 60 - unit.level));
                        tableAllValues.catseye_dark += darkEyes;
                        tableUltraValues.catseye_dark += darkEyes;
                    }

                    // ------------------------------------- Evolution Material costs ------------------------------------- 
                    for(let x = 1; x <= 5; x++) {
                        const material = row[`TrueMaterial${x}`];
                        if(material) {
                            tableAllValues[material] += parseInt(row[`TrueMaterialCount${x}`]);
                        }
                    }

                    for(let x = 1; x <= 5; x++) {
                        const material = row[`UltraMaterial${x}`];
                        if(material) {
                            const increase = parseInt(row[`UltraMaterialCount${x}`]);
                            tableAllValues[material] += increase;
                            tableUltraValues[material] += increase;
                        }
                    }
                }
            })
        );
    }

    await Promise.all(promises);
    
    tableAllValues.ultra = tableUltraValues;
    tableAllValues.hasUber = unitList.some(u => u.rarity === "UR");
    return tableAllValues;
}

function getXPToLvl(xpTable, targetLvl, lvl) {
    let sum = 0;

    for(let x = lvl + 1; x <= targetLvl; x++) {
        sum += xpTable[x];
    }

    return sum;
}

function getNPToLvl(npTable, lvl) {
    let sum = 0;

    for(let x = lvl; x < npTable.length; x++) {
        sum += npTable[x];
    }

    return sum;
}

function getLevelingCosts(unit, levelFormat) {
    if(levelFormat) {
        return levelingCost.find(c => c.Type === levelFormat);
    }

    switch(unit.rarity) {
        case "EX":
        case "RR":
            return levelingCost.find(c => c.Type === "GachaRare");
        case "SR":
            return levelingCost.find(c => c.Type === "GachaSR");
        case "UR":
        case "LR":
            return levelingCost.find(c => c.Type === "UR");
        case "N":
        default:
            console.error("Attempting to get standard leveling cost for invalid rarity.");
            return undefined;
    }
}