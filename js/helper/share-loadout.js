const UNIT_COMPONENT_WIDTH = 400;
const UNIT_COMPONENT_HEIGHT = 120;
const UNIT_COMPONENT_PADDING = 2;
const IMAGE_PADDING_WIDTH = 8;
const IMAGE_PADDING_HEIGHT = 6;
const UNIT_LABEL_PADDING = 5;
const UNIT_TITLE_FONT = 40;
const UNIT_LEVEL_FONT = 20;
const UNIT_TALENT_FONT = 30;
const UNIT_MAIN_TEXT_PADDING = (85 - UNIT_TITLE_FONT - UNIT_LEVEL_FONT - UNIT_LABEL_PADDING) / 2;

const LEFT_COMPONENT_WIDTH = 420;
const BASE_LABEL_FONT = 30;
const BASE_LEVEL_LABEL_FONT = 20;
const BASE_LABEL_PADDING = 7.5;
const LOADOUT_IMAGE_SCALING = 65 / 85;
const LOADOUT_IMAGE_PADDING = 3;

export async function convertToImageAndDownload(loadoutData) {
    const canvas = document.createElement("canvas");
    canvas.width = 2 * UNIT_COMPONENT_WIDTH + UNIT_COMPONENT_PADDING + 3 * IMAGE_PADDING_WIDTH + LEFT_COMPONENT_WIDTH;
    canvas.height = 5 * UNIT_COMPONENT_HEIGHT + 4 * UNIT_COMPONENT_PADDING + 2 * IMAGE_PADDING_HEIGHT;
    const ctx = canvas.getContext("2d");

    const data = await makeRequest(REQUEST_TYPES.GET_MULTIPLE_DATA, loadoutData.units);
    const settings = await makeRequest(REQUEST_TYPES.GET_SETTINGS);

    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const leftVerticalOffset = (canvas.height - 1 * UNIT_LABEL_PADDING - 180 - 2 * 85 * LOADOUT_IMAGE_SCALING - LOADOUT_IMAGE_PADDING) / 2;
    const leftLoadoutOffset = IMAGE_PADDING_WIDTH + (LEFT_COMPONENT_WIDTH - 5 * 110 * LOADOUT_IMAGE_SCALING - 4 * LOADOUT_IMAGE_PADDING) / 2;
    for(let x = 0; x < 10; x++) {
        const image = document.createElement("img");
        if(settings.skipImages.includes(data[x].id)) {
            image.src = "./assets/img/unit_icon/unknown.png";
        } else {
            image.src = `./assets/img/unit_icon/${data[x].id}_${loadoutData.forms[x]}.png`;
        }
    
        ctx.drawImage(image, 9, 21, 110, 85,
            leftLoadoutOffset + (x % 5) * (LOADOUT_IMAGE_PADDING + 110 * LOADOUT_IMAGE_SCALING),
            leftVerticalOffset + (x > 4 ? 1 : 0) * (LOADOUT_IMAGE_PADDING + 85 * LOADOUT_IMAGE_SCALING),
            110 * LOADOUT_IMAGE_SCALING,
            85 * LOADOUT_IMAGE_SCALING);
    }

    drawBaseInfo(ctx, loadoutData.base, leftVerticalOffset + 2 * 85 * LOADOUT_IMAGE_SCALING + LOADOUT_IMAGE_PADDING + UNIT_LABEL_PADDING, settings.ototo.names);

    for(let x = 0; x < 10; x++) {
        drawUnitInfo(ctx, data[x],
            loadoutData.forms[x],
            LEFT_COMPONENT_WIDTH + 2 * IMAGE_PADDING_WIDTH + (x % 2 == 1 ? (UNIT_COMPONENT_WIDTH + UNIT_COMPONENT_PADDING) : 0), // alternate left and right
            IMAGE_PADDING_HEIGHT + (UNIT_COMPONENT_HEIGHT + UNIT_COMPONENT_PADDING) * (((x - x % 2) / 2) % 5), // every 2 images go down a step on y axis
            settings.skipImages.includes(data[x].id));
    }

    document.body.appendChild(canvas);
}

function drawBaseInfo(ctx, baseType, verticalOffset, baseTypeNames) {
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = `${BASE_LABEL_FONT}px Courier New Bold`;
    
    const foundation = document.createElement("img");
    foundation.src = `./assets/img/foundation/base_${baseType[2]}_foundation.png`;
    const cannon = document.createElement("img");
    cannon.src = `./assets/img/foundation/base_${baseType[0]}.png`;
    const style = document.createElement("img");
    style.src = `./assets/img/foundation/base_${baseType[1]}_style.png`;

    const maxTextWidth = Math.max(
        ctx.measureText(`${baseTypeNames[baseType[0]]} Cannon`).width,
        ctx.measureText(`${baseTypeNames[baseType[1]]} Style`).width,
        ctx.measureText(`${baseTypeNames[baseType[2]]} Foundation`).width);
    const offsetLeft = (LEFT_COMPONENT_WIDTH - 90 - maxTextWidth - UNIT_LABEL_PADDING) / 2;

    ctx.drawImage(foundation, 0, 0, 90, 180, IMAGE_PADDING_WIDTH + offsetLeft, verticalOffset, 90, 180);
    ctx.drawImage(cannon, 0, 0, 90, 180, IMAGE_PADDING_WIDTH + offsetLeft, verticalOffset, 90, 180);
    ctx.drawImage(style, 0, 0, 90, 180, IMAGE_PADDING_WIDTH + offsetLeft, verticalOffset, 90, 180);

    ctx.fillText(`${baseTypeNames[baseType[0]]} Cannon`,
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);
    ctx.fillText(`${baseTypeNames[baseType[1]]} Style`,
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset + BASE_LABEL_FONT + BASE_LABEL_PADDING + UNIT_LABEL_PADDING + BASE_LEVEL_LABEL_FONT,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);
    ctx.fillText(`${baseTypeNames[baseType[2]]} Foundation`,
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset + 2 * BASE_LABEL_FONT + 2 * BASE_LABEL_PADDING + 2 * UNIT_LABEL_PADDING + 2 * BASE_LEVEL_LABEL_FONT,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);

    ctx.font = `${BASE_LEVEL_LABEL_FONT}px Courier New Bold`;
    ctx.fillText(window.localStorage.getItem(`oo_${baseType[0]}`).split("-")[0],
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset + BASE_LABEL_FONT + UNIT_LABEL_PADDING,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);

    ctx.fillText(window.localStorage.getItem(`oo_${baseType[1]}`).split("-")[1],
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset + 2 * BASE_LABEL_FONT + BASE_LABEL_PADDING + 2 * UNIT_LABEL_PADDING + BASE_LEVEL_LABEL_FONT,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);

    ctx.fillText(window.localStorage.getItem(`oo_${baseType[2]}`).split("-")[2],
        90 + UNIT_LABEL_PADDING + IMAGE_PADDING_WIDTH + offsetLeft,
        verticalOffset + 3 * BASE_LABEL_FONT + 2 * BASE_LABEL_PADDING + 3 * UNIT_LABEL_PADDING + 2 * BASE_LEVEL_LABEL_FONT,
        LEFT_COMPONENT_WIDTH - 90 - UNIT_LABEL_PADDING);
}

function drawUnitInfo(ctx, unit, usedForm, offsetX, offsetY, noImage = false) {
    const image = document.createElement("img");
    if(noImage) {
        image.src = "./assets/img/unit_icon/unknown.png";
    } else {
        image.src = `./assets/img/unit_icon/${unit.id}_${usedForm}.png`;
    }

    ctx.drawImage(image, 9, 21, 110, 85, offsetX, offsetY, 110, 85);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = `${UNIT_TITLE_FONT}px Courier New Bold`;
    ctx.fillText([unit.normal_form, unit.evolved_form, unit.true_form, unit.ultra_form][usedForm],
        offsetX + 110 + UNIT_LABEL_PADDING,
        offsetY + UNIT_MAIN_TEXT_PADDING,
        UNIT_COMPONENT_WIDTH - 110 - UNIT_LABEL_PADDING);
    
    ctx.font = `${UNIT_LEVEL_FONT}px Courier New Bold`;
    ctx.fillText(`${unit.level}${unit.plus_level > 0 ? ` + ${unit.plus_level}` : ""}`,
        offsetX + 110 + UNIT_LABEL_PADDING,
        offsetY + UNIT_TITLE_FONT + UNIT_LABEL_PADDING + UNIT_MAIN_TEXT_PADDING,
        UNIT_COMPONENT_WIDTH - 110 - UNIT_LABEL_PADDING);
    
    if(unit.talents.length !== 0) {
        ctx.font = `${UNIT_TALENT_FONT}px Courier New Bold`;
        ctx.fillStyle = "#FFDD55";
        ctx.textAlign = "right";
        ctx.fillText("Talents", offsetX + 110, offsetY + 85 + UNIT_LABEL_PADDING, 110);
        ctx.textAlign = "left";
    }
}

export function encodeLink(loadoutData) {

}

export function decodeLink(link) {

}