const ORB_TIER_RANKING = ["none", "D", "C", "B", "A", "S"];

export default function attachUnitTableColumnSort(table) {
    const thead = table.querySelector("thead");

    const sortID = thead.querySelector(".sort-id");
    const sortForm = thead.querySelector(".sort-form");
    const sortName = thead.querySelector(".sort-name");
    const sortLevel = thead.querySelector(".sort-level");
    const sortTalent = thead.querySelector(".sort-talent");
    const sortOrb = thead.querySelector(".sort-orb");
    const sortFavorite = thead.querySelector(".sort-favorite");
    const allSort = [sortID, sortForm, sortName, sortLevel, sortTalent, sortOrb, sortFavorite];

    const data = table.querySelector("tbody");

    attachSort(sortID, idSortLambda, allSort, data);
    attachSort(sortForm,
        (a, b) => {
            const res = parseInt(b.querySelector("td.row-name").dataset.form) - parseInt(a.querySelector("td.row-name").dataset.form);
            return res !== 0 ? res : idSortLambda(a, b);
        }, allSort, data);
    attachSort(sortName, (a, b) => a.querySelector("td.row-name").innerText < b.querySelector("td.row-name").innerText ? -1 : 1, allSort, data);
    attachSort(sortLevel, levelSortLambda, allSort, data);
    attachSort(sortTalent, talentSortLambda, allSort, data);
    attachSort(sortOrb, orbSortLambda, allSort, data);
    attachSort(sortFavorite, (a, b) => {
        const res = parseInt(b.querySelector("td.row-favorite div").dataset.favorited) - parseInt(a.querySelector("td.row-favorite div").dataset.favorited);
        return res !== 0 ? res : idSortLambda(a, b);
    }, allSort, data);
}

function attachSort(sortTarget, sort, allSort, tbody) {
    sortTarget.onclick = () => {
        if(sortTarget.classList.contains("ascending")) {
            sortRows(tbody, sort, false);
            allSort.forEach(s => { s.classList.remove("descending"); s.classList.remove("ascending"); });
            sortTarget.classList.add("descending");
        } else {
            sortRows(tbody, sort, true);
            allSort.forEach(s => { s.classList.remove("descending"); s.classList.remove("ascending"); });
            sortTarget.classList.add("ascending");
        }
    };
}

function sortRows(tbody, comparator, isAscending) {
    var rows = [...tbody.rows];
    
    rows.sort(comparator);

    var fragment = document.createDocumentFragment();
    if(isAscending) {
        rows.forEach(r => fragment.appendChild(r));
    } else {
        for(let i = rows.length - 1; i >= 0; i--) {
            fragment.appendChild(rows[i]);
        }
    }
    tbody.appendChild(fragment);
}

function idSortLambda(a, b) {
    return parseInt(a.querySelector("td.row-id").innerText) - parseInt(b.querySelector("td.row-id").innerText);
}

function levelSortLambda(a, b) {
    const aCell = a.querySelector("td.row-level");
    const bCell = b.querySelector("td.row-level");
    const maxLevelA = aCell.querySelector(".max-level");
    const maxLevelB = bCell.querySelector(".max-level");
    const res1 = parseInt(maxLevelB?.value ?? "1") - parseInt(maxLevelA?.value ?? "1");
    if(res1 !== 0) return res1;

    const maxPlusLevelA = aCell.querySelector(".max-plus-level");
    const maxPlusLevelB = bCell.querySelector(".max-plus-level");
    const res2 = parseInt(maxPlusLevelB?.value ?? "0") - parseInt(maxPlusLevelA?.value ?? "0");
    return res2 !== 0 ? res2 : idSortLambda(a, b);
}

function talentSortLambda(a, b) {
    const aCell = a.querySelector("td.row-talent");
    const bCell = b.querySelector("td.row-talent");
    const cappedCount = bCell.querySelectorAll(".maxed-talent").length - aCell.querySelectorAll(".maxed-talent").length;
    if(cappedCount !== 0) return cappedCount;

    const talentSum = [...bCell.querySelectorAll(".talent-box p")].reduce((sum, v) => sum + parseInt(v.innerText), 0) - [...aCell.querySelectorAll(".talent-box p")].reduce((sum, v) => sum + parseInt(v.innerText), 0);
    if(talentSum !== 0) return talentSum;

    const talentCount = bCell.querySelectorAll(".talent-box").length - aCell.querySelectorAll(".talent-box").length;
    return talentCount !== 0 ? talentCount : idSortLambda(a, b);
}

function orbSortLambda(a, b) {
    const aCell = a.querySelector("td.row-orb");
    const bCell = b.querySelector("td.row-orb");

    const ranksA = [...aCell.querySelectorAll('.orb-selector .orb-rank')].map(v => ORB_TIER_RANKING.indexOf(v.dataset.rank), 0).sort();
    const ranksB = [...bCell.querySelectorAll('.orb-selector .orb-rank')].map(v => ORB_TIER_RANKING.indexOf(v.dataset.rank), 0).sort();

    while(ranksA.length > 0 && ranksB.length > 0) {
        const rankAMax = ranksA.pop();
        const rankBMax = ranksB.pop();

        if(rankBMax - rankAMax !== 0) return rankBMax - rankAMax;
    }

    if(ranksB.length - ranksA.length !== 0) return ranksB.length - ranksA.length;

    const orbSlotCount = bCell.querySelectorAll(".orb-selector").length - aCell.querySelectorAll(".orb-selector").length;
    return orbSlotCount !== 0 ? orbSlotCount : idSortLambda(a, b);
}