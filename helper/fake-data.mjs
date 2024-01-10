console.log('................');

import { CosmosClient } from "@azure/cosmos";

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

const databaseName = `test-db`;
const containerName = `stocks`;

const cosmosClient = new CosmosClient({ endpoint, key });

const database = cosmosClient.database(databaseName);
const container = database.container(containerName);

module.exports = async function (context, req) {
    context.log('------------------JavaScript HTTP trigger function processed a request.');

    const response = await container.items.upsert({
        id: '1',
        productId: '2',
        stock: 123,
    });

    context.res = {
        body: {
            data: response.resource
        }
    };
}