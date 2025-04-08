//@ts-check
import { UNIT_DATA_TYPE } from "../data/unit-data.js";
import UserData from "../data/user-data.js";

/**
 * @readonly
 * @enum {string}
 */
export const RESPONSE_TYPES = {
    GET_UNIT: "get_id",
    GET_UNIT_LIST: "get_list",
    GET_ALL_OF_RARITY: "get_rarity_list",
    GET_ALL_FAVORITED: "get_favorited",
    GET_ALL: "get_all",
    UPDATE_UNIT: "update_id",
    GET_UNIT_NAMES: "get_names",

    GET_ABILITY: "get_ability",
    GET_ALL_ABILITY: "get_all_ability",
    GET_CGS: "get_cgs",
    GET_UPGRADE_COSTS: "get_upgrade_cost",
    UPDATE_ABILITY: "update_ability",
    UPDATE_CGS: "update_cgs",

    GET_CATEGORIES: "get_category_names",
    GET_CATEGORIES_ORDER: "get_category_names_order",
    MODIFY_CUSTOM_CATEGORY: "modify_custom_category",
    DELETE_CUSTOM_CATEGORY: "delete_custom_category",

    GET_LOADOUTS: "get_loadouts",
    MODIFY_LOADOUT: "modify_loadout",
    DELETE_LOADOUT: "delete_loadout",

    DISPLAY_MESSAGE: "send_alert",
    REFRESH_DATA: "REBOOT"
}

/**
 * @type {Map<string, (dataManager: UserData, content: any, ignore_filters: boolean) => (any|null)>}
 */
const MESSAGE_RESPONSE = new Map();

/* -------------------------------------- UNIT DATA REQUESTS -------------------------------------- */
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_UNIT, (dataManager, content, ignore_filters) => dataManager.unitData.getUnitData(content.target, content.dataType, ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_UNIT_LIST, (dataManager, content, ignore_filters) => dataManager.unitData.getUnitListData(content.target, content.dataType, ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_ALL_OF_RARITY, (dataManager, content, ignore_filters) => dataManager.unitData.getAllUnitData(u => u.rarity === content.target, content.dataType, ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_ALL_FAVORITED, (dataManager, content, ignore_filters) => dataManager.unitData.getAllUnitData(u => u.favorited, content, ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_ALL, (dataManager, content, ignore_filters) => dataManager.unitData.getAllUnitData(null, content, ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.UPDATE_UNIT, (dataManager, content, _ignore_filters) => dataManager.unitData.updateUnit(content));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_UNIT_NAMES, (dataManager, content, _ignore_filters) => dataManager.unitData.getAllUnitData((content === UNIT_DATA_TYPE.OWNED_FORM_NAMES) ? (u => u.level > 0) : null, content, false));

/* -------------------------------------- UPGRADE (ABILITY) REQUESTS -------------------------------------- */
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_ABILITY, (dataManager, content, _ignore_filters) => dataManager.upgradeData.getAbility(content));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_ALL_ABILITY, (dataManager, _content, _ignore_filters) => dataManager.upgradeData.getAllAbilities());
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_CGS, (dataManager, _content, _ignore_filters) => dataManager.upgradeData.getCGS());
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_UPGRADE_COSTS, (dataManager, _content, _ignore_filters) => dataManager.upgradeData.getUpgradeCosts());
MESSAGE_RESPONSE.set(RESPONSE_TYPES.UPDATE_ABILITY, (dataManager, content, _ignore_filters) => dataManager.upgradeData.updateAbility(content.id, content.level, content.plus));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.UPDATE_CGS, (dataManager, content, _ignore_filters) => dataManager.upgradeData.updateCGS(content));

/* -------------------------------------- CATEGORY REQUESTS -------------------------------------- */
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_CATEGORIES, (dataManager, _content, ignore_filters) => dataManager.categories.getCategories(ignore_filters));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_CATEGORIES_ORDER, (dataManager, _content, _ignore_filters) => dataManager.categories.getCategoryOrders());
MESSAGE_RESPONSE.set(RESPONSE_TYPES.MODIFY_CUSTOM_CATEGORY, (dataManager, content, _ignore_filters) => dataManager.categories.setCustomCategory(content.category, content.newUnits));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.DELETE_CUSTOM_CATEGORY, (dataManager, content, _ignore_filters) => dataManager.categories.removeCustomCategory(content));

/* -------------------------------------- LOADOUT REQUESTS -------------------------------------- */
MESSAGE_RESPONSE.set(RESPONSE_TYPES.GET_LOADOUTS, (dataManager, _content, _ignore_filters) => dataManager.loadouts.getLoadouts());
MESSAGE_RESPONSE.set(RESPONSE_TYPES.MODIFY_LOADOUT, (dataManager, content, _ignore_filters) => dataManager.loadouts.updateLoadout(content.position, content.loadout));
MESSAGE_RESPONSE.set(RESPONSE_TYPES.DELETE_LOADOUT, (dataManager, content, _ignore_filters) => dataManager.loadouts.removeLoadout(content));

/* -------------------------------------- OTHER REQUESTS -------------------------------------- */
MESSAGE_RESPONSE.set(RESPONSE_TYPES.DISPLAY_MESSAGE, (dataManager, content, _ignore_filters) => dataManager.sendMessage(content.message, content.isError));

export default MESSAGE_RESPONSE;