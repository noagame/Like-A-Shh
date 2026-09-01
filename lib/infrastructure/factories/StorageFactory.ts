export type StorageBucket = "eventos" | "galerias";

export class StorageFactory {
  public static resolveBucket(bucket: StorageBucket) {
    return bucket;
  }

  public static async uploadFile(
    supabaseClient: {
      storage: {
        from: (bucket: string) => {
          upload: (path: string, file: File, options?: { contentType?: string }) => Promise<{ error: { message: string } | null }>;
          getPublicUrl: (path: string) => { data: { publicUrl: string } };
        };
      };
    },
    bucket: StorageBucket,
    file: File,
    path: string
  ): Promise<string | null> {
    const storageBucket = this.resolveBucket(bucket);
    const { error } = await supabaseClient.storage
      .from(storageBucket)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });

    if (error) {
      return null;
    }

    const { data } = supabaseClient.storage.from(storageBucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
