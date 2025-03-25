export async function encodeLink(loadoutData) {
    const units = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, loadoutData.units);
    loadoutData.units = units.map((u, i) => {
        const data = {
            current_form: loadoutData.forms[i],
            level: u.level,
            plus_level: u.plus_level,
            orb: u.orb,
            talents: u.talents,
            ultra_talents: u.ultra_talents
        };
        return window.btoa(JSON.stringify(data));
    });
    
    const doubleCompressed = window.btoa(JSON.stringify(loadoutData));
    return doubleCompressed;
}

export function decodeLink(dataString) {
    const loadoutObj = JSON.parse(window.atob(dataString));
    loadoutObj.units = loadoutObj.units.map(u => JSON.parse(window.atob(u)));

    return loadoutObj;
}