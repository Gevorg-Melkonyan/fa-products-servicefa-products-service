import {BlobServiceClient} from "@azure/storage-blob";

const connectionString = "DefaultEndpointsProtocol=https;AccountName=stgsangpimportsfane555;AccountKey=jvbFQiyGHo66ivBVCV8vlgYs5Fi7aPdD/juZJKHT1T6v8L+P6rTZzBgAEsSBbGacZYcbVM7rcS7D+ASto5gfqQ==;EndpointSuffix=core.windows.net";

export const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
export const containerClient = blobServiceClient.getContainerClient('uploaded');
