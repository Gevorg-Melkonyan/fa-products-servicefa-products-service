import { AzureFunction, Context } from "@azure/functions"
import * as csv from 'csv-parser';
import {queueName, serviceBusConnectionString} from "../helper/connect-service-bus";
import {containerClient} from "../helper/connect-blob-service";
const { ServiceBusClient } = require("@azure/service-bus");

const blobTrigger: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {

    context.log("Blob trigger function processed blob \n Name:", context.bindingData.blobTrigger, "\n Blob Size:", myBlob.length, "Bytes");

    const blockBlobClient = containerClient.getBlockBlobClient(context.bindingData.name);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
    const sender = serviceBusClient.createSender(queueName);

    downloadBlockBlobResponse.readableStreamBody
        .pipe(csv())
        .on('data', async record => {
            try {
                const message = {
                    body: record,
                    label: "greeting",
                };
                // Send a message to the Service Bus queue
                await sender.sendMessages(message);
                context.res = {
                    status: 200,
                    body: "Message sent successfully to Service Bus queue.",
                };
            } catch (error) {
                context.res = {
                    status: 500,
                    body: `Error sending message to Service Bus: ${error.message}`,
                };
            } finally {
                await sender.close();
                await serviceBusClient.close();
            }
        })
        .on('end', ()=> {
            context.log('Completed the reading of CSV file.');
        });
};

export default blobTrigger;
