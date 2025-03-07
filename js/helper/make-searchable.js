export default function makeSearchable(input, dataset, findCallback) {
    input.addEventListener("keyup", ev => {
        if(ev.key === "Enter") {
            let id = -1;
            if(!isNaN(input.value)) {
                id = parseInt(input.value);
                if(id < 0 || id > parseInt(dataset.dataset.max_count) || !dataset.querySelector(`option[data-target="${id}"]`)) {
                    return;
                }
            } else {
                const idEntry = dataset.querySelector(`option[value="${input.value}"]`);
                if(idEntry) {
                    id = parseInt(idEntry.dataset.target);
                } else {
                    return;
                }
            }

            findCallback(id);
            input.value = "";
        }
    });
}

export async function initializeDataset(dataset, finds_all = false) {
    await makeRequest(REQUEST_TYPES.GET_NAMES, null, finds_all).then(names => {
        for(let x = 0; x < names.length; x++) {
            createSearchSuggestions(names[x], dataset);
        }
        [...dataset.children].sort((a, b) => a.value > b.value ? 1 : -1).forEach(n => dataset.appendChild(n));
    });
}

export async function initializeDatasetLimited(dataset, finds_all = false) {
    await makeRequest(REQUEST_TYPES.GET_OWNED_FORM_NAMES, null, finds_all).then(names => {
        for(let x = 0; x < names.length; x++) {
            createSearchSuggestions(names[x], dataset);
        }
        [...dataset.children].sort((a, b) => a.value > b.value ? 1 : -1).forEach(n => dataset.appendChild(n));
    });
}

function createSearchSuggestions(data, searchSuggestions) {
    if(data[1]) {
        const dataNFOption = document.createElement("option");
        dataNFOption.value = data[1];
        dataNFOption.dataset.target = data[0];
        dataNFOption.dataset.form = 0;
        searchSuggestions.appendChild(dataNFOption);
    }
    if(data[2]) {
        const dataEFOption = document.createElement("option");
        dataEFOption.value = data[2];
        dataEFOption.dataset.target = data[0];
        dataEFOption.dataset.form = 1;
        searchSuggestions.appendChild(dataEFOption);
    }
    if(data[3]) {
        const dataTFOption = document.createElement("option");
        dataTFOption.value = data[3];
        dataTFOption.dataset.target = data[0];
        dataTFOption.dataset.form = 2;
        searchSuggestions.appendChild(dataTFOption);
    }
    if(data[4]) {
        const dataUFOption = document.createElement("option");
        dataUFOption.value = data[4];
        dataUFOption.dataset.target = data[0];
        dataUFOption.dataset.form = 3;
        searchSuggestions.appendChild(dataUFOption);
    }
}