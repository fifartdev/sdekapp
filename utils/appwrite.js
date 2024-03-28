import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

export const db = new Databases(client);

//PROJECT CONSTANTS
export const ODKE_DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ODKE_DB;
export const COL_REFS = process.env.NEXT_PUBLIC_APPWRITE_COL_REFS;
export const COL_TEAMS = process.env.NEXT_PUBLIC_APPWRITE_COL_TEAMS;
export const COL_MATCHES = process.env.NEXT_PUBLIC_APPWRITE_COL_MATCHES;
export const COL_MASSIGN = process.env.NEXT_PUBLIC_APPWRITE_COL_MASSIGN;
export const COL_DATES = process.env.NEXT_PUBLIC_APPWRITE_COL_DATES;

export { ID, Query } from "appwrite";
