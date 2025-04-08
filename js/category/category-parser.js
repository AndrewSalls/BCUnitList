//@ts-check

/**
 * @typedef {(number | CategoryArray)[]} CategoryArray
 */

/**
 * Parses all categories in a specific file.
 * @param {string} file The name of the file to parse.
 * @returns {Promise<{[category: string]: number[]}>} An object containing the category names as keys, and the unit IDs in each category as values.
 */
export async function parseCategoryFile(file) {
    return fetch(`./assets/unit_data/category/${file}.json`)
    .then(r => r.json())
    .then(async j => {
        for(const key of Object.keys(j)) {
            j[key] = await flattenCategory(j[key]);
        }

        return j;
    });
}

/**
 * Attempts to parse a single category from a file.
 * @param {string} file The file to parse.
 * @param {string} name The name of the specific category to parse from the file.
 */
export async function parseCategory(file, name) {
    return fetch(`./assets/unit_data/category/${file}.json`)
    .then(r => r.json())
    .then(j => flattenCategory(j[name]));
}

/**
 * Flattens an array of category IDs.
 * @param {CategoryArray} arr An array of IDs contained within a category, potentially containing recursive arrays if the category contains references to other categories.
 * @returns {Promise<number[]>} The IDs contained within a category, including any referenced categories.
 */
async function flattenCategory(arr) {
    for(let x = 0; x < arr.length; x++) {
        if(Array.isArray(arr[x])) {
            arr[x] = await parseCategory(arr[x][0], arr[x][1]);
        }
    }

    return /** @type {(number|number[])[]} */ (arr).flat();
}

/**
 * Parses all categories from assets based on the file names listed in ./category/types.txt , and from the custom category stored in localStorage, converting them to JSON.
 * @returns {Promise<import("../data/category-data").CATEGORY_MAP>} An object containing all categories, with keys being the super-categories, and objects being the parsed categories.
 */
export async function parseAllCategories() {
    return fetch("./assets/unit_data/category/types.txt")
    .then(t => t.text())
    .then(t => t.split(" ").map(async p => {return {[p]: await parseCategoryFile(p)}}))
    .then(pl => Promise.all(pl))
    .then(res => res.reduce((acc, obj) => {
        const parsed = {...acc, ...obj};

        const toParse = Object.keys(window.localStorage).filter(k => k.startsWith("_cc-"));
        if(toParse.length > 0) {
            parsed["custom"] = {};
            for(const key of toParse) {
                //@ts-ignore keys must exist because toParse is created from localStorage.
                const data = JSON.parse(window.atob(window.localStorage.getItem(key)));
                parsed["custom"][data.c] = data.v;
            }
        }

        return parsed;
    }));
}