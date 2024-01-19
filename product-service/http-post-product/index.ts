import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {containerProduct, containerStocks} from "../helper/connect-db";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`HTTP trigger function processed a request. ${req.method}`);
    const {title, description, price, count} = req.body;
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

}

export default httpTrigger;