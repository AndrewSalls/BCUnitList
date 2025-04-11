//@ts-check
import { RARITY, UNIT_DATA_TYPE } from "../data/unit-data.js";
import { RESPONSE_TYPES } from "./handle-message.js";

/**
 * @readonly
 */
export const REQUEST_TYPES = {
    UPDATE_ID: (/** @type {import("../data/unit-data").UNIT_RECORD} */ unit) => /** @type {Promise<number>} */ (makeRequest(RESPONSE_TYPES.UPDATE_UNIT, unit)),
    GET_ID_DATA: (/** @type {number} */ id, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/unit-data").UNIT_DATA|null>} */ (makeRequest(RESPONSE_TYPES.GET_UNIT, { target: id, dataType: UNIT_DATA_TYPE.UNIT }, ignoreFilters).then(u => u.length > 0 ? u[0] : null)),
    GET_MULTIPLE_DATA: (/** @type {number[]} */ idList, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/unit-data").UNIT_DATA[]>} */ (makeRequest(RESPONSE_TYPES.GET_UNIT_LIST, { target: idList, dataType: UNIT_DATA_TYPE.UNIT }, ignoreFilters)),
    GET_RARITY_DATA: (/** @type {RARITY} */ rarity, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/unit-data").UNIT_DATA[]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL_OF_RARITY, { target: rarity, dataType: UNIT_DATA_TYPE.UNIT }, ignoreFilters)),
    GET_FAVORITED_DATA: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/unit-data").UNIT_DATA[]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL_FAVORITED, UNIT_DATA_TYPE.UNIT, ignoreFilters)),
    GET_ALL_DATA: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/unit-data").UNIT_DATA[]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL, UNIT_DATA_TYPE.UNIT, ignoreFilters)),
    GET_ID_COST: (/** @type {number} */ id, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/find-costs.js").MATERIAL_COSTS>} */ (makeRequest(RESPONSE_TYPES.GET_UNIT, { target: id, dataType: UNIT_DATA_TYPE.COST }, ignoreFilters)),
    GET_MULTIPLE_COST: (/** @type {number[]} */ idList, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/find-costs.js").MATERIAL_COSTS>} */ (makeRequest(RESPONSE_TYPES.GET_UNIT_LIST, { target: idList, dataType: UNIT_DATA_TYPE.COST }, ignoreFilters)),
    GET_RARITY_COST: (/** @type {RARITY} */ rarity, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/find-costs.js").MATERIAL_COSTS>} */ (makeRequest(RESPONSE_TYPES.GET_ALL_OF_RARITY, { target: rarity, dataType: UNIT_DATA_TYPE.COST }, ignoreFilters)),
    GET_FAVORITED_COST: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/find-costs.js").MATERIAL_COSTS>} */ (makeRequest(RESPONSE_TYPES.GET_ALL_FAVORITED, UNIT_DATA_TYPE.COST, ignoreFilters)),
    GET_ALL_COST: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/find-costs.js").MATERIAL_COSTS>} */ (makeRequest(RESPONSE_TYPES.GET_ALL, UNIT_DATA_TYPE.COST, ignoreFilters)),
    
    GET_NAMES: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<[number, string|null, string|null, string|null, string|null][]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL, UNIT_DATA_TYPE.FORM_NAMES, ignoreFilters)),
    GET_OWNED_FORM_NAMES: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<[number, string|null, string|null, string|null, string|null][]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL, UNIT_DATA_TYPE.OWNED_FORM_NAMES, ignoreFilters)),
    GET_CATEGORIES: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/category-data.js").CATEGORY_MAP>} */ (makeRequest(RESPONSE_TYPES.GET_CATEGORIES, null, ignoreFilters)),
    GET_CATEGORIES_ORDER: (/** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../data/category-data.js").CATEGORY_ORDER_MAP>} */ (makeRequest(RESPONSE_TYPES.GET_CATEGORIES_ORDER, null, ignoreFilters)),

    MODIFY_CUSTOM_CATEGORY: (/** @type {string} */ categoryName, /** @type {number[]} */ categoryValues) => /** @type {Promise<void>} */ (makeRequest(RESPONSE_TYPES.MODIFY_CUSTOM_CATEGORY, { category: categoryName, newUnits: categoryValues })),
    REMOVE_CUSTOM_CATEGORY: (/** @type {string} */ categoryName) => /** @type {Promise<void>} */ (makeRequest(RESPONSE_TYPES.DELETE_CUSTOM_CATEGORY, categoryName)),

    GET_ABILITY: (/** @type {number} */ index) => /** @type {Promise<import("../data/upgrade-data.js").ABILITY_LEVEL>} */ (makeRequest(RESPONSE_TYPES.GET_ABILITY, index)),
    GET_ALL_ABILITY: () => /** @type {Promise<import("../data/upgrade-data.js").ABILITY_LEVEL[]>} */ (makeRequest(RESPONSE_TYPES.GET_ALL_ABILITY, null)),
    GET_CGS: () => /** @type {Promise<boolean>} */ (makeRequest(RESPONSE_TYPES.GET_CGS, null)),
    GET_UPGRADE_COST: () => /** @type {Promise<number>} */ (makeRequest(RESPONSE_TYPES.GET_UPGRADE_COSTS, null)),
    UPDATE_ABILITY: (/** @type {number} */ index, /** @type {number} */ level, /** @type {number} */ plusLevel) => /** @type {Promise<number>} */ (makeRequest(RESPONSE_TYPES.UPDATE_ABILITY, { id: index, level: level, plus: plusLevel })),
    UPDATE_CGS: (/** @type {boolean} */ owned) => /** @type {Promise<void>} */ (makeRequest(RESPONSE_TYPES.UPDATE_CGS, owned)),

    GET_ALL_LOADOUT: () => /** @type {Promise<import("../data/loadout-data.js").LOADOUT[]>} */ (makeRequest(RESPONSE_TYPES.GET_LOADOUTS, null)),
    MODIFY_LOADOUT: (/** @type {number} */ index, /** @type {import("../data/loadout-data.js").LOADOUT} */ loadout) => /** @type {Promise<void>} */ (makeRequest(RESPONSE_TYPES.MODIFY_LOADOUT, { position: index, loadout: loadout })),
    DELETE_LOADOUT: (/** @type {number} */ index) => /** @type {Promise<void>} */ (makeRequest(RESPONSE_TYPES.DELETE_LOADOUT, index)),

    SEND_ALERT: (/** @type {string} */ message, /** @type {boolean} */ isError) => /** @type {Promise<void>} */ (makeRequest("send_alert", { message: message, isError: isError })),
}

const MAX_POST_ID = 2 << 12;
let curPostID = 0;

let port = null;
const callbacks = new Map();

/**
 * Listens for responses from the main window and forwards the response data to a registered callback.
 * @param {MessageEvent} ev The message event sent upon receiving a message.
 */
window.onmessage = (/** @type {MessageEvent} */ ev) => {
    if(ev.ports && ev.ports.length) {
        port = ev.ports[0];

        port.onmessage = (/** @type {MessageEvent} */ res) => {
            const response = res.data;
            callbacks.get(response.m_id)(response.data);
            callbacks.delete(response.m_id);
        };

        if(window.localStorage.getItem("delete_flag") === "1") {
            window.localStorage.removeItem("delete_flag");
            port.postMessage({ context: "REBOOT" });
        }
        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
};

/**
 * Gets whether the port is connected to the main window.
 * @returns {boolean} Whether the port is connected to the main window.
 */
export function checkPort() {
    return port !== null;
}

/**
 * Sends a request to the main window.
 * @param {RESPONSE_TYPES} requestType The type of request the main window should expect.
 * @param {any} requestContents The contents of the request.
 * @param {boolean} [ignoreFilters = false] Whether the main window should respect the user's set global filters when responding.
 * @returns {Promise<any>} A promise for a response from the main window.
 */
function makeRequest(requestType, requestContents, ignoreFilters = false) {
    const messageID = curPostID++;
    const output = new Promise((res, _) => {
        callbacks.set(messageID, res);
    });
    port?.postMessage({ context: requestType, content: requestContents, m_id: messageID, ignore_filters: ignoreFilters });
    curPostID %= MAX_POST_ID;

    return output;
}