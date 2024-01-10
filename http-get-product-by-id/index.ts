import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {containerProduct, containerStocks} from "../helper/connect-db";

type Product = {
    id: string;
    title: string;
    description: string;
    price: number
};

const productsArr: Product[] = [
    {
        id: '1',
        title: 'Lexus RX 350',
        description: 'all-wheel drive',
        price: 70000
    },
    {
        id: '2',
        title: 'Lexus GX 470',
        description: 'all-wheel drive',
        price: 100000
    },
    {
        id: '3',
        title: 'Lexus LX 600',
        description: 'all-wheel drive',
        price: 150000
    }
];

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`HTTP trigger function processed a request. ${req.method}`);
    const productId = req.params?.productId;
    const productResources = await containerProduct.items.query({query: `SELECT * FROM c WHERE c.id = "${productId}"`}).fetchAll();

    if(productResources.resources.length) {
        const stockCount = await containerStocks.items.query({query: `SELECT * FROM c WHERE c.product_id = "${productResources.resources[0].id}"`}).fetchAll();
        const {id, title, description, price} = productResources.resources[0];
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {
                product: {
                    id,
                    title,
                    description,
                    price: Number(price.toString().slice(0, 3)),
                    count: stockCount.resources.length ? stockCount.resources[0].count : 0,
                }
            }
        };
    } else {
        context.res = {
            body: 'Product not exist'
        }
    }

};

export default httpTrigger;