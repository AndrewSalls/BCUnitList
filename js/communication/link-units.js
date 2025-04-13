//@ts-check
import { parseAllCategories } from "../category/category-parser.js";
import { getUnitData, parseLoadouts, parseUpgrades } from "../helper/parse-file.js";
import UserData from "../data/user-data.js";
import MESSAGE_RESPONSE, { RESPONSE_TYPES } from "./handle-message.js";
import initializeLocalStorage from "../initialize-localstorage.js";

let dataManager = new UserData([], { cgs: false, abilities: []}, {}, [], (_str, _isValid) => {});

/**
 * Initializes unit data and links to the provided iframe.
 * @param {HTMLIFrameElement} frame An iframe that needs access to site-persistant data.
 * @param {(message: string, isErrorMsg: boolean) => void} messageCallback A function to call when trying to display a message in the iframe.
 */
export default async function initializeData(frame, messageCallback) {
    await initializeUserData(messageCallback);

    registerFrame(frame);
}

/**
 * Registers a provided iframe, causing it to begin communication with this page's data.
 * @param {HTMLIFrameElement} frame The iframe to register.
 */
export function registerFrame(frame) {
    frame.onload = () => {
        const channel = new MessageChannel();
        channel.port1.onmessage = res => handleMessage(channel.port1, res);
        frame.contentWindow?.postMessage("loaded", "*", [channel.port2]);
    }
    if(frame.contentDocument && frame.contentDocument.readyState === "complete") {
        frame.onload(new Event("load"));
    }
}

/**
 * Handles a message recieved from the registered iframe and sends a response to confirm handling.
 * @param {MessagePort} port A link to the registered iframe.
 * @param {MessageEvent} res The message data recieved from the registered iframe.
 */
async function handleMessage(port, res) {
    if(res.data.context === RESPONSE_TYPES.DELETE_USER_DATA) {
        const sendMSG = MESSAGE_RESPONSE.get(RESPONSE_TYPES.DISPLAY_MESSAGE);
        if(sendMSG) {
            sendMSG(dataManager, { message: "Save deleted!", isError: false }, false);
        }
        window.localStorage.setItem("delete_flag", "1");
        return;
    } else if(window.localStorage.getItem("delete_flag") === "1") {
        await initializeUserData(dataManager.sendMessage);
    }

    const responseFunc = MESSAGE_RESPONSE.get(res.data.context);
    if(responseFunc) {
        const output = responseFunc(dataManager, res.data.content, res.data.ignore_filters);
        if(output && output.then) {
            port.postMessage({ m_id: res.data.m_id, data: await output });
        } else {
            port.postMessage({ m_id: res.data.m_id, data: output });
        }
    } else {
        console.error(`Unexpected context: "${res.data.context}", unable to finish communication`);
    }
}

let loadingEventExists = false;
let loadingEventListener = [];
/**
 * Initializes all user data.
 * @param {(message: string, isErrorMsg: boolean) => void} messageCallback A function to call when trying to display a message in the iframe.
 * @returns {Promise<void>} A promise that is invoked upon the user data being initialized.
 */
async function initializeUserData(messageCallback) {
    if(loadingEventExists) {
        const sync = new Promise(res => { loadingEventListener.push(res) });
        return sync;
    } else {
        loadingEventExists = true;
        const categories = await parseAllCategories();
        initializeLocalStorage(categories);
        const upgrades = parseUpgrades();
        const units = await getUnitData(categories);
        const loadouts = parseLoadouts();
        dataManager = new UserData(units, upgrades, categories, loadouts, messageCallback);

        window.localStorage.removeItem("delete_flag");
        const loadEventFuncs = loadingEventListener;
        loadingEventListener = [];
        loadingEventExists = false;

        for(const func of loadEventFuncs) {
            func();
        }
    }
}