//@ts-check

/**
 * Encodes a loadout containing unit IDs as a string, taking the full unit data from the user's stored values for those units.
 * @param {import("../data/loadout-data").LOADOUT} loadoutData The loadout data.
 * @param {import("../data/unit-data").UNIT_DATA[]} unitData The unit data for the units in the loadout.
 * @returns {Promise<string>} The encoded loadout.
 */
export async function encodeLink(loadoutData, unitData) {
    //@ts-ignore Not creating a whole new object to avoid typecasting
    loadoutData.units = unitData.map((/** @type {any} */ u) => encodeUnitEntry(u));
    loadoutData.baseLevels = [0, 0, 0];
    for(let x = 0; x < 3; x++) {
        //@ts-ignore All localStorage values are automatically initialized if not set.
        loadoutData.baseLevels[x] = window.localStorage.getItem(`oo_${loadoutData.base[x]}`).split("-")[x];
    }
    
    const doubleCompressed = window.btoa(JSON.stringify(loadoutData));
    return doubleCompressed;
}

/**
 * Encodes a loadout containing unit values as a string.
 * @param {import("../data/loadout-data").LOADOUT} loadoutData The loadout data, including full unit data instead of just IDs.
 * @returns {string} The encoded loadout.
 */
export function encodeDirectLink(loadoutData) {
    //@ts-ignore Not creating a whole new object to avoid typecasting
    loadoutData.units = loadoutData.units.map((/** @type {LOADOUT_UNIT_DATA} */ u) => encodeUnitEntry(u));
    return window.btoa(JSON.stringify(loadoutData));
}

/**
 * Converts a loadout's string encoding to it's JSON encoding.
 * @param {string} dataString The string encoding.
 * @returns {import("../data/loadout-data").LOADOUT} A JSON encoding of a loadout.
 */
export function decodeLink(dataString) {
    const loadoutObj = JSON.parse(window.atob(dataString));
    loadoutObj.units = loadoutObj.units.map((/** @type {any} */ u) => decodeUnit(u));

    return loadoutObj;
}

/**
 * Convert's a unit's full JSON encoding to the unit's string encoding, including all properties that can be changed by users.
 * @param {import("../data/unit-data").UNIT_RECORD} unitData JSON containing all modifiable unit data.
 * @returns {string} The string encoding.
 */
export function encodeUnitEntry(unitData) {
    let output = `I${unitData.id}${encodeUnit(unitData)}`;

    if(unitData.favorited) {
        output += "F";
    }
    if(unitData.hidden) {
        output += "H";
    }

    return output;
}

/**
 * Converts a unit's JSON encoding to the unit's string encoding.
 * @param {import("../data/unit-data").LOADOUT_UNIT_DATA} unitData The JSON encoding.
 * @returns {string} The string encoding.
 */
export function encodeUnit(unitData) {
    let output = "";

    if(unitData.current_form > 0) {
        output += `F${unitData.current_form}`;
    }
    if(unitData.level > 0) {
        output += `L${unitData.level}`;
    }
    if(unitData.plus_level > 0) {
        output += `+${unitData.plus_level}`;
    }
    if(unitData.talents.some((/** @type {number} */ t) => t > 0)) {
        output += `T${unitData.talents.join("-")}`;
    }
    if(unitData.ultra_talents.some((/** @type {number} */ t) => t > 0)) {
        output += `U${unitData.ultra_talents.join("-")}`;
    }
    if(unitData.orb.some((/** @type {import("../data/unit-data").ORB} */ o) => o !== null)) {
        output += `O${unitData.orb.map((/** @type {import("../data/unit-data").ORB} */ o) => encodeOrb(o)).join("&")}`
    }

    return output;
}

/**
 * Converts a unit's string encoding to the unit's JSON encoding.
 * @param {string|null} unitStr The string encoding of the unit, or null if the unit has no initial values.
 * @returns {import("../data/unit-data").UNIT_RECORD} A unit's JSON encoding.
 */
export function decodeUnit(unitStr) {
    let output = {
        id: 0,
        current_form: 0,
        level: 0,
        plus_level: 0,
        talents: /** @type {number[]} */ ([]),
        ultra_talents: /** @type {number[]} */ ([]),
        orb: /** @type {import("../data/unit-data").ORB[]} */ ([]),
        favorited: false,
        hidden: false
    };

    if(!unitStr) {
        return output;
    }

    let pos = 0;
    let segment;
    do {
        segment = getSegment(unitStr, pos);
        switch(segment.segmentType) {
            case "I":
                output.id = parseInt(unitStr.substring(pos + 1, pos + segment.length));
                break;
            case "F":
                output.current_form = parseInt(unitStr.substring(pos + 1, pos + segment.length));
                break;
            case "L":
                output.level = parseInt(unitStr.substring(pos + 1, pos + segment.length));
                break;
            case "+":
                output.plus_level = parseInt(unitStr.substring(pos + 1, pos + segment.length));
                break;
            case "T":
                output.talents = unitStr.substring(pos + 1, pos + segment.length).split("-").map((/** @type {string} */ t) => parseInt(t));
                break;
            case "U":
                output.ultra_talents = unitStr.substring(pos + 1, pos + segment.length).split("-").map((/** @type {string} */ u) => parseInt(u));
                break;
            case "O":
                output.orb = unitStr.substring(pos + 1, pos + segment.length).split("&").map((/** @type {string} */ o) => decodeOrb(o));
                break;
            case "F":
                output.favorited = true;
                break;
            case "H":
                output.hidden = true;
                break;
        }

        pos += segment.length;
    } while(pos < unitStr.length);

    return output;
}

/**
 * Finds the next segment of a unit's string encoding.
 * @param {string} unitStr The entire string encoding.
 * @param {number} startPos The position to start searching from in the encoding.
 * @return {{segmentType: string, length: number}} A character representing what the next segment is, and the length of the data within that segment, not including the character.
 */
function getSegment(unitStr, startPos) {
    const segmentType = unitStr.charAt(startPos);

    let offset;
    for(offset = 1; startPos + offset < unitStr.length && unitStr.charAt(startPos + offset).match("[0-9&X\\-]"); offset++);
    return {
        segmentType: segmentType,
        length: offset
    }
}

/**
 * Converts an orb's JSON encoding to a string encoding.
 * @param {import("../data/unit-data").ORB} orb An object encoding the orb, or null if the orb has not been set.
 * @returns {string} An orb's string encoding.
 */
export function encodeOrb(orb) {
    if(orb === null) {
        return "X";
    }

    return `${orb.trait}-${orb.type}-${orb.rank}`;
}

/**
 * Converts an orb's string encoding to a JSON encoding.
 * @param {string} orbStr An orb's string encoding.
 * @returns {import("../data/unit-data").ORB} An object encoding the orb, or null if the orb has not been set.
 */
export function decodeOrb(orbStr) {
    if(orbStr === "X") {
        return null;
    }

    const parts = orbStr.split("-");

    return {
        trait: parseInt(parts[0]),
        type: parseInt(parts[1]),
        rank: parseInt(parts[2])
    };
}