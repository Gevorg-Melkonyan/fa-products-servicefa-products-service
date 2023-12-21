import { AzureFunction, Context, HttpRequest } from "@azure/functions";

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
    context.log('HTTP trigger function processed a request.');
    const productId = req.params?.productId;
    const foundProduct = productsArr.filter(product => product.id === productId);
    if (foundProduct.length > 0) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: foundProduct
        };
    } else {
        context.res = {
            body: 'Product not exist'
        }
    }

};

export default httpTrigger;