async function getLevelCaps() {
    return fetch("../assets/unit_data/level_cap_stats.csv").then(r => r.text()).then(t => Papa.parse(t, { header: true, dynamicTyping: true, skipEmptyLines: true }).data).catch(e => console.error(e));
}

export async function getUnitData(categories, settings) {
    const unitCount = settings.unitCount;
    const levelingCaps = await getLevelCaps();
    const collabUnits = [...Object.values(categories["collabs"]).flat(), ...Object.values(categories["small_collabs"]).flat()];
    const unobtainableUnits = categories["other"]["Unobtainable"];

    const awaitFinish = [];
    for(let x = 0; x <= Math.floor(unitCount / 100); x++) {
        awaitFinish.push(fetch(`../assets/unit_data/units_${x * 100}.csv`)
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

                    return {
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
                        current_form: 0, // 0 - 4 are unobtained, NF, EF, TF, UF
                        hidden: false
                    };
                })
            ));
    }

    return (await Promise.all(awaitFinish)).flat();
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