//@ts-check
import { RARITY } from "../helper/parse-file";

/**
 * @readonly
 */
export const REQUEST_TYPES = {
    UPDATE_ID: (/** @type {import("../helper/parse-file").UNIT_RECORD} */ unit, /** @type {boolean} */ ignoreFilters = false) => /** @type {Promise<import("../helper/parse-file").UNIT_DATA>} */ (makeRequest("update_id", unit, ignoreFilters)),
    GET_ID_DATA: (/** @type {number} */ id, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<import("../helper/parse-file").UNIT_DATA>} */ (makeRequest("get_id", id, ignoreFilters)),
    GET_MULTIPLE_DATA: (/** @type {number[]} */ idList, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<import("../helper/parse-file").UNIT_DATA[]>} */ (makeRequest("get_list", idList, ignoreFilters)),
    GET_RARITY_DATA: (/** @type {RARITY} */ rarity, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<import("../helper/parse-file").UNIT_DATA[]>} */ (makeRequest("get_rarity_list", rarity, ignoreFilters)),
    GET_FAVORITED_DATA: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<import("../helper/parse-file").UNIT_DATA[]>} */ (makeRequest("get_favorited", null, ignoreFilters)),
    GET_ALL_DATA: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<import("../helper/parse-file").UNIT_DATA[]>} */ (makeRequest("get_all", null, ignoreFilters)),
    GET_ID_COST: (/** @type {number} */ id, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_id_cost", id, ignoreFilters)),
    GET_MULTIPLE_COST: (/** @type {number[]} */ idList, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_cost_list", idList, ignoreFilters)),
    GET_RARITY_COST: (/** @type {RARITY} */ rarity, /** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_rarity_costs", rarity, ignoreFilters)),
    GET_FAVORITED_COST: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_favorited_costs", null, ignoreFilters)),
    GET_ALL_COST: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_all_costs", null, ignoreFilters)),
    
    GET_NAMES: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<[number, string|null, string|null, string|null, string|null][]>} */ (makeRequest("get_names", null, ignoreFilters)),
    GET_OWNED_FORM_NAMES: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<[number, string|null, string|null, string|null, string|null][]>} */ (makeRequest("get_owned_names", null, ignoreFilters)),
    GET_CATEGORY_NAMES: (/** @type {boolean} */ ignoreFilters = false) =>/** @type {Promise<Object>} */ (makeRequest("get_category_names", null, ignoreFilters)),
    GET_CATEGORY_ORDER: () =>/** @type {Promise<Object>} */ (makeRequest("get_category_orders", null, false)),
    GET_SETTINGS: () =>/** @type {Promise<Object>} */ (makeRequest("get_settings", null, false)),

    MODIFY_CUSTOM_CATEGORY: (/** @type {string} */ categoryName, /** @type {number[]} */ categoryValues) =>/** @type {Promise<Object>} */ (makeRequest("modify_custom_category", { target: categoryName, updates: categoryValues }, false)),
    REMOVE_CUSTOM_CATEGORY: (/** @type {string} */ categoryName) =>/** @type {Promise<number[]>} */ (makeRequest("remove_custom_category", categoryName, false)),

    GET_UPGRADE: (/** @type {number} */ index) =>/** @type {Promise<{ plus: number; level: number; }|number>} */ (makeRequest("get_upgrade", index, false)),
    GET_ALL_UPGRADE: () =>/** @type {Promise<[number, ...{ plus: number; level: number; }[]]>} */ (makeRequest("get_all_upgrades", null, false)),
    GET_UPGRADE_COST: () =>/** @type {Promise<number>} */ (makeRequest("get_upgrade_costs", null, false)),
    UPDATE_UPGRADE: (/** @type {number} */ index, /** @type {number} */ level, /** @type {number} */ plusLevel) =>/** @type {Promise<{ plus: number; level: number; }|number>} */ (makeRequest("update_upgrade", { id: index, level: level, plus: plusLevel }, false)),

    GET_ALL_LOADOUT: () =>/** @type {Promise<import("../helper/loadout-storage-manager").LOADOUT[]>} */ (makeRequest("get_all_loadouts", null, false)),
    MODIFY_LOADOUT: (/** @type {number} */ index, /** @type {import("../helper/loadout-storage-manager").LOADOUT} */ loadout) =>/** @type {Promise<import("../helper/loadout-storage-manager").LOADOUT>} */ (makeRequest("mutate_loadout_position", { position: index, loadout: loadout }, false)),
    DELETE_LOADOUT: (/** @type {number} */ index) =>/** @type {Promise<import("../helper/loadout-storage-manager").LOADOUT>} */ (makeRequest("delete_loadout", index, false)),

    SEND_ALERT: (/** @type {string} */ message, /** @type {boolean} */ isError) =>/** @type {Promise<null>} */ (makeRequest("send_alert", { message: message, isError: isError }, false)),
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
            callbacks.get(response.m_id)(res.data);
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
 * @param {string} requestType The type of request the main window should expect.
 * @param {Object} requestContents The contents of the request.
 * @param {boolean} [ignoreFilters = false] Whether the main window should respect the user's set global filters when responding.
 * @returns {Promise<Object>} A promise for a response from the main window.
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