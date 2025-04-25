import { parseCSV } from '../utils.js';

class SpeciesListHandler {
    constructor() {
        this.speciesList = [];
    }

    loadSpeciesList(csvData) {
        this.speciesList = parseCSV(csvData);
    }

    getSpeciesList() {
        return this.speciesList;
    }

    filterSpeciesByCriteria(criteria) {
        return this.speciesList.filter(species => {
            return Object.keys(criteria).every(key => species[key] === criteria[key]);
        });
    }

    addSpecies(species) {
        this.speciesList.push(species);
    }

    removeSpecies(speciesName) {
        this.speciesList = this.speciesList.filter(species => species.name !== speciesName);
    }

    updateSpecies(speciesName, updatedSpecies) {
        const index = this.speciesList.findIndex(species => species.name === speciesName);
        if (index !== -1) {
            this.speciesList[index] = updatedSpecies;
        }
    }
}

export default SpeciesListHandler;
