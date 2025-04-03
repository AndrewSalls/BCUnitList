export async function encodeLink(loadoutData) {
    const units = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, loadoutData.units);

    loadoutData.units = units.map((u, i) => {
        const data = {
            id: loadoutData.units[i],
            current_form: loadoutData.forms[i],
            level: u.level,
            plus_level: u.plus_level,
            orb: u.orb,
            talents: u.talents,
            ultra_talents: u.ultra_talents
        };
        return window.btoa(JSON.stringify(data));
    });
    loadoutData.baseLevels = [];
    for(let x = 0; x < 3; x++) {
        loadoutData.baseLevels[x] = window.localStorage.getItem(`oo_${loadoutData.base[x]}`).split("-")[x];
    }
    
    const doubleCompressed = window.btoa(JSON.stringify(loadoutData));
    return doubleCompressed;
}

export function encodeDirectLink(loadoutData) {
    loadoutData.units = loadoutData.units.map(u => window.btoa(JSON.stringify(u)));
    return window.btoa(JSON.stringify(loadoutData));
}

export function decodeLink(dataString) {
    const loadoutObj = JSON.parse(window.atob(dataString));
    loadoutObj.units = loadoutObj.units.map(u => JSON.parse(window.atob(u)));

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
    if(unitData.talents.some(t => t.value > 0)) {
        output += `T${"-".join(unitData.talents.map(t => t.value))}`;
    }
    if(unitData.ultra_talents.some(t => t.value > 0)) {
        output += `T${"-".join(unitData.ultra_talents.map(t => t.value))}`;
    }
    if(unitData.orb.some(o => o !== null)) {
        output += `O${"&".join(unitData.orb.map(o => encodeOrb(o)))}`
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

    if(unitStr[0] === "I") {
        
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
        trait: parts[0],
        type: parts[1],
        rank: parts[2]
    };
}