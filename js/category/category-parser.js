export async function parseCategoryFile(file) {
    return fetch(`assets/unit_data/category/${file}.json`)
    .then(r => r.json())
    .then(async j => {
        for(const key of Object.keys(j)) {
            j[key] = await flatten(j[key]);
        }

        return j;
    });
}

export async function parseCategory(file, name) {
    return fetch(`assets/unit_data/category/${file}.json`)
    .then(r => r.json())
    .then(j => flatten(j[name]));
}

async function flatten(arr) {
    for(let x = 0; x < arr.length; x++) {
        if(Array.isArray(arr[x])) {
            arr[x] = await parseCategory(arr[x][0], arr[x][1]);
        }
    }

    return arr.flat();
}

export async function parseAllCategories() {
    return fetch("assets/unit_data/category/types.txt")
    .then(t => t.text())
    .then(t => t.split(" ").map(async p => {return {[p]: await parseCategoryFile(p)}}))
    .then(pl => Promise.all(pl))
    .then(res => res.reduce((acc, obj) => { return {...acc, ...obj}}));
}