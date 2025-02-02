import { parseAllCategories, recordCustomCategory } from "../category/category-parser.js";
import getCostsFor, { isInitialized, initializeLeveling } from "../helper/find-costs.js";
import { getUnitData } from "../helper/parse-file.js";

let unitData = [];
let categories = {};
let settings = {};

export default async function initializeData() {
    return new Promise(async (res, _) => {
        settings = await fetch("./assets/settings.json").then(res => res.json());
        categories = await parseAllCategories();
        unitData = await getUnitData(categories, settings);
        res({ settings: settings, categories: categories, unitData: unitData });

        const frame = document.querySelector("#content-page");
        frame.onload = loadFrame;
        if(frame.contentDocument && frame.contentDocument.readyState === "complete") {
            frame.onload();
        }
    });
}

function loadFrame() {
    const frame = document.querySelector("#content-page");
    const channel = new MessageChannel();
    channel.port1.onmessage = res => handleMessage(channel.port1, unitData, res);
    frame.contentWindow.postMessage("loaded", "*", [channel.port2]);
}

function handleMessage(port, unitData, res) {
    res = res.data;
    
    switch(res.context) {
        case "get_id":
            port.postMessage({ m_id: res.m_id, data: (!testGlobalFilters(unitData[res.content], res.ignore_filters) && unitData[res.content]) || null });
            break;
        case "update_id":
            updateFromData(res.content);
            port.postMessage({ m_id: res.m_id, data: unitData[res.content.id] });
            break;
        case "get_list":
            port.postMessage({ m_id: res.m_id, data: res.content.filter(i => !testGlobalFilters(unitData[i], res.ignore_filters)).map(i => unitData[i]) });
            break;
        case "get_rarity_list":
            port.postMessage({ m_id: res.m_id, data: unitData.filter(u => u.rarity === res.content && !testGlobalFilters(u, res.ignore_filters)) });
            break;
        case "get_favorited":
            port.postMessage({ m_id: res.m_id, data: unitData.filter(u => u.favorited && !testGlobalFilters(u, res.ignore_filters)) });
            break;
        case "get_all":
            port.postMessage({ m_id: res.m_id, data: unitData.filter(u => !testGlobalFilters(u, res.ignore_filters)) });
            break;
        case "get_id_cost":
            getCostsForSafely([unitData[res.content]]).then(d => port.postMessage({ m_id: res.m_id, data: d }));
            break;
        case "get_cost_list":
            getCostsForSafely(res.content.filter(i => !testGlobalFilters(unitData[i], res.ignore_filters)).map(i => unitData[i])).then(d => port.postMessage({ m_id: res.m_id, data: d }));
            break;
        case "get_rarity_costs":
            getCostsForSafely(unitData.filter(u => u.rarity === res.content && !testGlobalFilters(u, res.ignore_filters))).then(d => port.postMessage({ m_id: res.m_id, data: d }));
            break;
        case "get_favorited_costs":
            getCostsForSafely(unitData.filter(u => u.favorited && !testGlobalFilters(u, res.ignore_filters))).then(d => port.postMessage({ m_id: res.m_id, data: d }));
            break;
        case "get_all_costs":
            getCostsForSafely(unitData.filter(u => !testGlobalFilters(u, res.ignore_filters))).then(d => port.postMessage({ m_id: res.m_id, data: d }));
            break;
        case "get_names":
            port.postMessage({ m_id: res.m_id, data: unitData.filter(u => !testGlobalFilters(u, res.ignore_filters)).map(d => [d.id, d.normal_form, d.evolved_form, d.true_form, d.ultra_form]) });
            break;
        case "get_category_names":
            port.postMessage({ m_id: res.m_id, data: getUnfiltedCategories(res.ignore_filters) });
            break;
        case "get_settings":
            port.postMessage({ m_id: res.m_id, data: settings });
            break;
        case "modify_custom_category":
            if(!categories["custom"]) {
                categories["custom"] = {};
            }

            categories["custom"][res.content.target] = res.content.updates;
            recordCustomCategory(res.content.target, res.content.updates);
            port.postMessage({ m_id: res.m_id, data: categories["custom"] });
            break;
        case "remove_custom_category":
            const removing = categories["custom"][res.content];
            delete categories["custom"][res.content];

            if(Object.keys(categories["custom"]).length === 0) {
                delete categories["custom"];
            }

            recordCustomCategory(res.content, []);
            port.postMessage({ m_id: res.m_id, data: removing });
            break;
        default:
            console.error(`Unexpected context: ${res.context}`);
            break;
    }
}

async function getCostsForSafely(unitData) {
    if(!isInitialized()) {
        return initializeLeveling().then(_ => getCostsFor(unitData));
    } else {
        return getCostsFor(unitData);
    }
}

function testGlobalFilters(unit, ignore) {
    if(ignore) {
        return false;
    }

    let shouldBeHidden = (window.localStorage.getItem("f1") === "0") && unit.unobtainable === "Y";
    shouldBeHidden ||= (window.localStorage.getItem("f2") === "0") && unit.collab === "Y";
    shouldBeHidden ||= (window.localStorage.getItem("f3") === "0") && unit.in_EN === "N";
    shouldBeHidden ||= (window.localStorage.getItem("f4") === "0") && unit.level === 0;
    shouldBeHidden ||= (window.localStorage.getItem("f5") === "0") && !unit.favorited;

    return shouldBeHidden;
}

async function updateFromData(data) {
    const id = data.id;

    unitData[id].current_form = data.current_form ?? unitData[id].current_form;
    unitData[id].level = data.level ?? unitData[id].level;
    unitData[id].plus_level = data.plus_level ?? unitData[id].plus_level;
    if(data.talents) {
        for(let i = 0; i < unitData[id].talents.length; i++) {
            unitData[id].talents[i].value = data.talents[i];
        }
    }
    if(data.ultra_talents) {
        for(let i = 0; i < unitData[id].ultra_talents.length; i++) {
            unitData[id].ultra_talents[i].value = data.ultra_talents[i];
        }
    }
    unitData[id].orb = data.orb ?? unitData[id].orb;
    unitData[id].favorited = data.favorited ?? unitData[id].favorited;
    unitData[id].hidden = data.hidden ?? unitData[id].hidden;

    if(data.current_form === 0 &&
        data.level === 0 && data.plus_level === 0 &&
        data.talents.every(t => t === 0) && data.ultra_talents.every(t => t === 0) &&
        data.orb.every(o => !o) &&
        !data.hidden && !data.favorited && window.localStorage.getItem(data.id)) {
            window.localStorage.removeItem(data.id);
    }

    window.localStorage.setItem(data.id, window.btoa(JSON.stringify(data)));
}

function getUnfiltedCategories(ignoreFilters) {
    if(ignoreFilters) {
        return categories;
    }

    const clone = {};
    
    for(const superKey of Object.keys(categories).sort()) {
        if(window.localStorage.getItem(`gk-${superKey}`) === "0") {
            continue;
        }

        const cloneSub = {};
        for(const subKey of Object.keys(categories[superKey]).sort()) {
            if(window.localStorage.getItem(`${superKey}-${subKey}`) === "0") {
                continue;
            }

            cloneSub[subKey] = categories[superKey][subKey];
        }

        if(cloneSub) {
            clone[superKey] = cloneSub;
        }
    }

    return clone;
}