import { Client, Databases, Account } from "appwrite";

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67e783740019aeeb3093"); // Replace with your project ID

export const account = new Account(client);
export const databases = new Databases(client);
