/**
 * List handling for the Water module
 */

class WaterListHandlers {
    constructor() {
        this.waterList = [];
    }

    addWaterEntry(entry) {
        this.waterList.push(entry);
    }

    removeWaterEntry(index) {
        if (index >= 0 && index < this.waterList.length) {
            this.waterList.splice(index, 1);
        }
    }

    getWaterList() {
        return this.waterList;
    }

    clearWaterList() {
        this.waterList = [];
    }
}

// Replace export default with window object attachment
window.WaterListHandlers = WaterListHandlers;
