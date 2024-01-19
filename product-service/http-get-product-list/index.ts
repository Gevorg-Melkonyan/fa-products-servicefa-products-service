import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { containerProduct, containerStocks } from "../helper/connect-db"

interface Product {
    id: string;
    title: string;
    description: string;
    price: number
};

interface Stock {
    product_id: string,
    count: number,
}

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
]
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log(`HTTP trigger function processed a request. ${req.method}`);
    let allItems = [];
    let productC = await containerProduct.items.query({query: `SELECT * FROM c`}).fetchAll();
    for await (let item of productC.resources) {
        const stockCount = await containerStocks.items.query({query: `SELECT * FROM c WHERE c.product_id = "${item.id}"`}).fetchAll();
        const productDetail = {
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price ? Number(item.price.toString().slice(0, 3)) : 0,
            count: stockCount.resources.length ? stockCount.resources[0].count : 0,
        }
        allItems.push(productDetail);
    }
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: allItems
    };

};

export default httpTrigger;