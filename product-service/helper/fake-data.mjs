import { faker } from '@faker-js/faker';
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

// set fail product data
export function createRandomProduct() {
    return {
        "id": faker.string.uuid(), // UUID, primary and partition key
        "title": faker.internet.userName(),
        "description": faker.string.alphanumeric(),
        "price": faker.number.int()
    };
}
// set fail stock data with product ID
export function createRandomStock() {
    const stocks = [];
    for (let i = 0; i < Products.length; i++) {
        stocks.push({
            "product_id": Products[i].id, // primary and partition key
            "count": Math.floor(Math.random() * 1000)
        });
    }
    return stocks;
}

// set count of created fake data
export const Products = faker.helpers.multiple(createRandomProduct, {
    count: 5,
});
export const Stocks = createRandomStock();

(async function setFailDB () {
    for (let i = 0; i < Products.length; i++) {
        await containerProduct.items.upsert(
            Products[i]
        );
    }

    for (let i = 0; i < Stocks.length; i++) {
        await containerStocks.items.upsert(
            Stocks[i]
        );
    }

})();
