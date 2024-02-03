import { AzureFunction, Context } from "@azure/functions";
import {containerProduct, containerStocks} from "../helper/connect-db";

const serviceBusQueueTrigger: AzureFunction = async function(context: Context, mySbMsg: any): Promise<void> {
    context.log('ServiceBus queue trigger function processed message', mySbMsg);

    const csvProduct = mySbMsg;
    // Create object from csv json headers and values
    const separatorCsv: string = Object.keys(csvProduct)[0].includes(',') && ',' ||
                                 Object.keys(csvProduct)[0].includes(';') && ';' || ' ';
    const keys = Object.keys(csvProduct)[0].split(separatorCsv);
    // @ts-ignore
    const values = Object.values(csvProduct)[0].split(separatorCsv);
    const product: any = {};
    for (let i = 0; i < keys.length; i++) {
        product[keys[i].toLowerCase()] = values[i];
    }

    // Send product to Cosmos DB
    const {title, description, price, count} = product;
    if (title && description && price && count) {
        const addedProduct = await containerProduct.items.upsert({title, description, price});
        const addedStock = await containerStocks.items.upsert(
            {
                product_id: addedProduct.resource.id,
                count: count,
            }
        );
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {message: 'Product was added successfully.'}
        };
    } else {
        context.res = {
            status: 400,
            body: {message: 'Product must include title, description, price, count.'}
        };
    }
};

export default serviceBusQueueTrigger;
