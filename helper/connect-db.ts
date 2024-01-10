import { CosmosClient } from "@azure/cosmos";

const key = "W47t1NMk1NwokKDLpZ127w1RWYUDwKYMJlbMEw0mkz8G0lWaOq5aC3ditOOtR1jTwbLgQGyb15t7ACDbhq1A4w==";
const endpoint = "https://cos-app-sand-ne-011.documents.azure.com:443/";

const databaseName = `products-db`;
const containerNameProducts = `products`;
const containerNameStocks = `stocks`;

const cosmosClient = new CosmosClient({ endpoint, key });

export const database = cosmosClient.database(databaseName);
export const containerProduct = database.container(containerNameProducts);
export const containerStocks = database.container(containerNameStocks);