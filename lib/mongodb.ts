import { GridFSBucket, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME ?? "likeashh";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  if (!uri) throw new Error("MISSING_ENV: MONGODB_URI");

  return (globalThis._mongoClientPromise ??= new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    retryWrites: true,
  }).connect());
}

export default getClientPromise();

export async function getMediaBucket() {
  const client = await getClientPromise();
  const db = client.db(databaseName);
  return new GridFSBucket(db, {
    bucketName: "media",
  });
}
