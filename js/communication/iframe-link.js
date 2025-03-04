const REQUEST_TYPES = {
    UPDATE_ID: "update_id",
    GET_ID_DATA: "get_id",
    GET_MULTIPLE_DATA: "get_list",
    GET_RARITY_DATA: "get_rarity_list",
    GET_FAVORITED_DATA: "get_favorited",
    GET_ALL_DATA: "get_all",
    GET_ID_COST: "get_id_cost",
    GET_MULTIPLE_COST: "get_cost_list",
    GET_RARITY_COST: "get_rarity_costs",
    GET_FAVORITED_COST: "get_favorited_costs",
    GET_ALL_COST: "get_all_costs",
    
    GET_NAMES: "get_names",
    GET_OWNED_FORM_NAMES: "get_owned_names",
    GET_CATEGORY_NAMES: "get_category_names",
    GET_SETTINGS: "get_settings",

    MODIFY_CUSTOM_CATEGORY: "modify_custom_category",
    REMOVE_CUSTOM_CATEGORY: "remove_custom_category",

    UPDATE_UPGRADE: "update_upgrade",
    GET_UPGRADE: "get_upgrade",
    GET_ALL_UPGRADE: "get_all_upgrades",

    GET_ALL_LOADOUT: "get_all_loadouts"
}

const MAX_POST_ID = 2 << 12;
let curPostID = 0;

let port = null;
const callbacks = new Map();

window.onmessage = ev => {
    if(ev.ports && ev.ports.length) {
        port = ev.ports[0];

        port.onmessage = res => {
            res = res.data;
            callbacks.get(res.m_id)(res.data);
            callbacks.delete(res.m_id);
        };

        window.dispatchEvent(new CustomEvent("portLoaded"));
    }
};

function checkPort() {
    return port !== null;
}

function makeRequest(requestType, requestContents, ignoreFilters = false) {
    const messageID = curPostID++;
    const output = new Promise((res, _) => {
        callbacks.set(messageID, res);
    });
    port?.postMessage({ context: requestType, content: requestContents, m_id: messageID, ignore_filters: ignoreFilters });
    curPostID %= MAX_POST_ID;

    return output;
}