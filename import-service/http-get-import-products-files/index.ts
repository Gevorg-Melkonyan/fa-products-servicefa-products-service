import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {BlobSASPermissions, BlobServiceClient, generateBlobSASQueryParameters, SASProtocol} from "@azure/storage-blob";

const connectionString = "DefaultEndpointsProtocol=https;AccountName=stgsangpimportsfane555;AccountKey=jvbFQiyGHo66ivBVCV8vlgYs5Fi7aPdD/juZJKHT1T6v8L+P6rTZzBgAEsSBbGacZYcbVM7rcS7D+ASto5gfqQ==;EndpointSuffix=core.windows.net";
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const fileName = req.query.name;
    if(fileName) {
        // Use Azure Storage SDK to interact with Storage Account
        const containerName = 'uploaded';
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);

        // Define 10 minutes
        const  TEN_MINUTES = 10 * 60 * 1000;
        const  NOW = new  Date();
        const  TEN_MINUTES_BEFORE_NOW = new  Date(NOW.valueOf() - TEN_MINUTES);
        const  TEN_MINUTES_AFTER_NOW = new  Date(NOW.valueOf() + TEN_MINUTES);

        // Best practice: SAS options are time-limited
        const  sasOptions = {
            containerName,
            blobName: fileName,
            permissions: BlobSASPermissions.parse("w"),
            protocol:  SASProtocol.HttpsAndHttp,
            startsOn:  TEN_MINUTES_BEFORE_NOW,
            expiresOn:  TEN_MINUTES_AFTER_NOW
        };
        const sasToken = generateBlobSASQueryParameters(
            sasOptions,
            blobServiceClient.credential as any
        ).toString();
        const sasUrl = `${blockBlobClient.url}?${sasToken}`;

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: {url: sasUrl}
        };

    } else {
        context.res = {
            status: 400,
            body: {message: "Pass a name in the query string for getting url and SAS token."}
        };
    }
};

export default httpTrigger;