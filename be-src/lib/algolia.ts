import { algoliasearch } from "algoliasearch";

const appID = process.env.ALGOLIA_APP_ID || "";
const apiKey = process.env.ALGOLIA_ADMIN_KEY || "";

if (!appID || !apiKey) {
  console.warn("⚠️ WARNING: ALGOLIA_APP_ID o ALGOLIA_ADMIN_KEY no configurados en el .env");
}

const client = algoliasearch(appID, apiKey);

const indexPets = {
  saveObject: (idAndData: any) => {
    return client.saveObject({
      indexName: "pets",
      body: idAndData,
    });
  },

  search: (query: string, requestOptions?: any) => {
    return client.search({
      requests: [{ indexName: "pets", query, ...requestOptions }],
    });
  },

  partialUpdateObject: (idAndData: any) => {
    return client.partialUpdateObject({
      indexName: "pets",
      objectID: idAndData.objectID,
      attributesToUpdate: idAndData,
    });
  },

  deleteObject: (objectID: string) => {
    return client.deleteObject({
      indexName: "pets",
      objectID,
    });
  }
};

export { indexPets };