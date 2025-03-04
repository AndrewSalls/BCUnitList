async function getLevelCaps() {
    return fetch("./assets/unit_data/level_cap_stats.csv").then(r => r.text()).then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data).catch(e => console.error(e));
}

export async function getUnitData(categories, settings) {
    const unitCount = settings.unitCount;
    const levelingCaps = await getLevelCaps();
    const collabUnits = [...Object.values(categories["collabs"]).flat(), ...Object.values(categories["small_collabs"]).flat()];
    const unobtainableUnits = categories["other"]["Unobtainable"];
    let totalLevel = 0;

    const awaitFinish = [];
    for(let x = 0; x <= Math.floor(unitCount / 100); x++) {
        awaitFinish.push(fetch(`./assets/unit_data/units_${x * 100}.csv`)
            .then(r => r.text())
            .then(t => Papa.parse(t, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            }).data)
            .then(entries => entries.map(entry => {
                    let levelType = levelingCaps.find(t => t.Type === entry.LevelCapFormat);
                    if(!levelType) {
                        levelType = levelingCaps.find(t => t.Type === "Default");
                    }

                    const unitData = {
                        id: entry.ID,
                        rarity: entry.Rarity,
                        in_EN: entry.InEN,
                        collab: collabUnits.includes(entry.ID) ? "Y" : "N",
                        unobtainable: unobtainableUnits.includes(entry.ID) ? "Y" : "N",
                        normal_form: entry.NF,
                        evolved_form: entry.EF,
                        true_form: entry.TF,
                        ultra_form: entry.UF,
                        max_form: (-1 + !!(entry.NF) + !!(entry.EF) + !!(entry.TF) + !!(entry.UF)), // -1, adds 1 for each form with a valid string name (there is no unit without any form, so min value is 0)
                        level_cap: levelType,
                        talents: parseTalents(entry.Talents),
                        ultra_talents: parseTalents(entry.UltraTalents),
                        orb: new Array(parseInt(entry.OrbCount)).fill(null),
                        favorited: false,
                        level: 0,
                        plus_level: 0,
                        current_form: 0, // 0 - 3 are NF, EF, TF, UF
                        hidden: false
                    };

                    
                    if(window.localStorage.getItem(entry.ID)) {
                        const decompressed = JSON.parse(window.atob(window.localStorage.getItem(entry.ID)));
                        unitData.current_form = decompressed.current_form;
                        unitData.favorited = decompressed.favorited;
                        unitData.hidden = decompressed.hidden;
                        unitData.level = decompressed.level;
                        unitData.plus_level = decompressed.plus_level;
                        for(let x = 0; x < decompressed.orb.length; x++) {
                            unitData.orb[x] = decompressed.orb[x];
                        }
                        for(let x = 0; x < decompressed.talents.length; x++) {
                            unitData.talents[x].value = decompressed.talents[x];
                        }
                        for(let x = 0; x < decompressed.ultra_talents.length; x++) {
                            unitData.ultra_talents[x].value = decompressed.ultra_talents[x];
                        }
                    } else if(entry.ID === 0) { // Cat must be at least level 1, ensures no weirdness with not owning any units
                        unitData.level = 1;
                    }

                    totalLevel += unitData.level + unitData.plus_level;
                    return unitData;
                })
            ));
    }

    return {
        units: (await Promise.all(awaitFinish)).flat(),
        ur: totalLevel
    };
}

function parseTalents(talentString) {
    if(!talentString) {
        return [];
    }

    const talents = talentString.split("-");

    return talents.map(e => { return {
        name: e.replace(/[0-9]+/i, ""),
        cap: e.replace(/[^0-9]+/i, ""),
        value: 0
    }});
}

export function parseUpgrades(settings) {
    const abilityIconLevels = window.localStorage.getItem("abo");
    let upgradeData, upgradeUR = 0;

    if(!abilityIconLevels) {
        upgradeData = settings.abilities.abilityNames.map(_ => { return {
            level: 0,
            plus: 0
        }});
    } else {
        upgradeData = abilityIconLevels.split("-").map(s => {
            const parts = s.split("+");

            const output = {
                level: parseInt(parts[0]),
                plus: parseInt(parts[1])
            };
            upgradeUR += output.level + output.plus;

            return output;
        });
    }

    return { upData: [parseInt(window.localStorage.getItem("cgs") ?? "0"), ...upgradeData], upUR: upgradeUR };
}