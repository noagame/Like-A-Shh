import { MongoClient, GridFSBucket } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // En desarrollo, usamos una variable global para preservar la conexión a través de recargas (HMR)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En producción, no usamos variable global
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getMediaBucket() {
  const client = await clientPromise;
  const db = client.db(); // Usa la DB por defecto que viene en la MONGODB_URI
  return new GridFSBucket(db, {
    bucketName: "media", // o el nombre que prefieras para tu bucket
  });
}
