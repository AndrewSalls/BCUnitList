export async function encodeLink(loadoutData) {
    const units = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, loadoutData.units);

    loadoutData.units = units.map(u => encodeUnitEntry(u));
    loadoutData.baseLevels = [];
    for(let x = 0; x < 3; x++) {
        loadoutData.baseLevels[x] = window.localStorage.getItem(`oo_${loadoutData.base[x]}`).split("-")[x];
    }
    
    const doubleCompressed = window.btoa(JSON.stringify(loadoutData));
    return doubleCompressed;
}

export function encodeDirectLink(loadoutData) {
    loadoutData.units = loadoutData.units.map(u => encodeUnitEntry(u));
    return window.btoa(JSON.stringify(loadoutData));
}

export function decodeLink(dataString) {
    const loadoutObj = JSON.parse(window.atob(dataString));
    loadoutObj.units = loadoutObj.units.map(u => decodeUnit(u));

    return loadoutObj;
}

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
    if(unitData.talents.some(t => t > 0)) {
        output += `T${unitData.talents.join("-")}`;
    }
    if(unitData.ultra_talents.some(t => t > 0)) {
        output += `U${unitData.ultra_talents.join("-")}`;
    }
    if(unitData.orb.some(o => o !== null)) {
        output += `O${unitData.orb.map(o => encodeOrb(o)).join("&")}`
    }

    return output;
}

export function decodeUnit(unitStr) {
    let output = {
        id: 0,
        current_form: 0,
        level: 0,
        plus_level: 0,
        talents: [],
        ultra_talents: [],
        orb: [],
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
                output.talents = unitStr.substring(pos + 1, pos + segment.length).split("-").map(t => parseInt(t));
                break;
            case "U":
                output.ultra_talents = unitStr.substring(pos + 1, pos + segment.length).split("-").map(u => parseInt(u));
                break;
            case "O":
                output.orb = unitStr.substring(pos + 1, pos + segment.length).split("&").map(o => decodeOrb(o));
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

function getSegment(unitStr, startPos) {
    const segmentType = unitStr.charAt(startPos);

    let offset;
    for(offset = 1; startPos + offset < unitStr.length && unitStr.charAt(startPos + offset).match("[0-9&X\\-]"); offset++);
    return {
        segmentType: segmentType,
        length: offset
    }
}

export function encodeOrb(orb) {
    if(orb === null) {
        return "X";
    }

    return `${orb.trait}-${orb.type}-${orb.rank}`;
}

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