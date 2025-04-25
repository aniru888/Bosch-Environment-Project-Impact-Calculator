import { downloadCSV } from '../utils.js';

function uploadSpeciesFile(inputElement, callback) {
    const file = inputElement.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        callback(data);
    };
    reader.readAsText(file);
}

function parseData(form) {
    const formData = new FormData(form);
    const data = {
        treesPlanted: parseInt(formData.get('treesPlanted'), 10),
        sequestrationRate: parseFloat(formData.get('sequestrationRate')),
        costPerTree: parseFloat(formData.get('costPerTree')),
        speciesCount: parseInt(formData.get('speciesCount'), 10),
        biodiversityFactor: parseFloat(formData.get('biodiversityFactor')),
        beneficiariesFactor: parseFloat(formData.get('beneficiariesFactor'))
    };
    return data;
}

function exportResults(results) {
    let csvContent = "Sequestration,Cost,Biodiversity,Beneficiaries\n";
    csvContent += `${results.sequestration},${results.cost},${results.biodiversity},${results.beneficiaries}\n`;
    downloadCSV("forest_results.csv", csvContent);
}

export {
    uploadSpeciesFile,
    parseData,
    exportResults
};
