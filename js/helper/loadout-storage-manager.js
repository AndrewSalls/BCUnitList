export default class LoadoutManager {
    constructor() {
        if(window.localStorage.getItem("llp")) {
            this.loadouts = window.localStorage.getItem("llp").split(" ");
        } else {
            this.loadouts = [];
        }
    }

    update(index, change) {
        this.loadouts[index] = window.btoa(JSON.stringify(change));
        window.localStorage.setItem("llp", this.loadouts.join(" "));
    }

    remove(index) {
        this.loadouts.splice(index, 1);
        window.localStorage.setItem("llp", this.loadouts.join(" "));
    }
}