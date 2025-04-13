//@ts-check

/**
 * @typedef {{ [key: string]: { [subKey: string]: number[] }}|{}} CATEGORY_MAP
 * @typedef {{ [key: string]: string[] }|{}} CATEGORY_ORDER_MAP
 */

/**
 * A class containing all category data.
 */
export default class CategoryData {
    #categories;
    /** @type {CATEGORY_ORDER_MAP} */ #categoryOrdering;

    /**
     * Creates an object containing the provided category data.
     * @param {CATEGORY_MAP} categories 
     */
    constructor(categories) {
        this.#categories = categories;
        this.#categoryOrdering = {};
        
        for(const superKey of Object.keys(this.#categories)) {
            const sortedSubKeys = Object.keys(this.#categories[superKey]).sort((ka, kb) => this.#categories[superKey][ka][0] - this.#categories[superKey][kb][0]);
            this.#categoryOrdering[superKey] = sortedSubKeys;
        }
    }

    /**
     * Gets all categories.
     * @param {boolean} isFiltered Whether the returned categories should not include globally filtered categories.
     * @returns {CATEGORY_MAP} All unfiltered categories, or an empty object if all categories are filtered.
     */
    getCategories(isFiltered) {
        const clone = {};
        
        for(const superKey of Object.keys(this.#categories)) {
            const categoryFilterBitfield = window.localStorage.getItem(`gk-${superKey}`) ?? "";
            if(!(isFiltered && categoryFilterBitfield.charAt(0) === "0")) {
                const cloneSub = {};
                const subKeyOrder = this.#categoryOrdering[superKey];
                
                for(let x = 0; x < subKeyOrder.length; x++) {
                    if(!(isFiltered && categoryFilterBitfield.charAt(x + 1) === "0")) {
                        cloneSub[subKeyOrder[x]] = this.#categories[superKey][subKeyOrder[x]];
                    }
                }
    
                if(cloneSub) {
                    clone[superKey] = cloneSub;
                }
            }
        }
    
        return clone;
    }

    /**
     * Gets all categories' ordering.
     * @returns {CATEGORY_ORDER_MAP} All categories and their order within each super-category.
     */
    getCategoryOrders() {
        return this.#categoryOrdering;
    }
    
    /**
     * Creates or modifies a custom category.
     * @param {string} name The name of the category being initialized. 
     * @param {number[]} units A list of unit IDs included in the category.
     */
    setCustomCategory(name, units) {
        if(!this.#categories["custom"]) {
            this.#categories["custom"] = {};
            this.#categoryOrdering["custom"] = [];
        }

        this.#categories["custom"][name] = units.sort();
        this.#categoryOrdering["custom"].push(name);
        this.#recordCustomCategory(name, units);
    }
    
    /**
     * Removes a custom category.
     * @param {string} name The name of the category being removed.
     */
    removeCustomCategory(name) {
        delete this.#categories["custom"][name];
        this.#categoryOrdering["custom"].splice(this.#categoryOrdering["custom"].indexOf(name), 1);

    
        if(Object.keys(this.#categories["custom"]).length === 0) {
            delete this.#categories["custom"];
            delete this.#categoryOrdering["custom"];
        }
    
        this.#recordCustomCategory(name, []);
    }

    /**
     * Converts a category from JSON to an encoded string and saves it to localStorage.
     * @param {string} categoryName The name of the category.
     * @param {number[]} categoryValues The list of unit IDs for units in the category.
     */
    #recordCustomCategory(categoryName, categoryValues) {
        if(categoryValues.length === 0) {
            window.localStorage.removeItem(`_cc-${categoryName}`);
        } else {
            window.localStorage.setItem(`_cc-${categoryName}`, window.btoa(JSON.stringify({c:categoryName,v:categoryValues})));
        }
    }
}