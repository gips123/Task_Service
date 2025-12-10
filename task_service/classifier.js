const axios = require("axios");

const CLASSIFIER_URL = "http://localhost:8080/classify-service/predict";

async function classifyText(description) {
    try {
        const response = await axios.post(CLASSIFIER_URL, {
            description
        });
        return response.data; 
    } catch (error) {
        return {
            label_id: 4,
            label_name: "Personal",
            confidence: 0
        };
    }
}

module.exports = { classifyText };
