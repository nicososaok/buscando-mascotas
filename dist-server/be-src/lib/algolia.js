"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexPets = void 0;
const algoliasearch_1 = require("algoliasearch");
const appID = process.env.ALGOLIA_APP_ID || "";
const apiKey = process.env.ALGOLIA_ADMIN_KEY || "";
if (!appID || !apiKey) {
    console.warn("⚠️ WARNING: ALGOLIA_APP_ID o ALGOLIA_ADMIN_KEY no configurados en el .env");
}
const client = (0, algoliasearch_1.algoliasearch)(appID, apiKey);
const indexPets = {
    saveObject: (idAndData) => {
        return client.saveObject({
            indexName: "pets",
            body: idAndData,
        });
    },
    search: (query, requestOptions) => {
        return client.search({
            requests: [{ indexName: "pets", query, ...requestOptions }],
        });
    },
    partialUpdateObject: (idAndData) => {
        return client.partialUpdateObject({
            indexName: "pets",
            objectID: idAndData.objectID,
            attributesToUpdate: idAndData,
        });
    },
    deleteObject: (objectID) => {
        return client.deleteObject({
            indexName: "pets",
            objectID,
        });
    }
};
exports.indexPets = indexPets;
