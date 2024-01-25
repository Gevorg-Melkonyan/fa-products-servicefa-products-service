import { AzureFunction, Context } from "@azure/functions"
import {BlobServiceClient} from "@azure/storage-blob";
import * as csv from 'csv-parser';

const connectionString = "DefaultEndpointsProtocol=https;AccountName=stgsangpimportsfane555;AccountKey=jvbFQiyGHo66ivBVCV8vlgYs5Fi7aPdD/juZJKHT1T6v8L+P6rTZzBgAEsSBbGacZYcbVM7rcS7D+ASto5gfqQ==;EndpointSuffix=core.windows.net";

const blobTrigger: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('uploaded');

    context.log("Blob trigger function processed blob \n Name:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");

    const blockBlobClient = containerClient.getBlockBlobClient(context.bindingData.name);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    downloadBlockBlobResponse.readableStreamBody
        .pipe(csv())
        .on('data', record => {
            context.log(`Logged record from CSV file: ${JSON.stringify(record)}`);
        })
        .on('end', ()=> {
            context.log('Completed the reading of CSV file.');
        });
};

export default blobTrigger;
