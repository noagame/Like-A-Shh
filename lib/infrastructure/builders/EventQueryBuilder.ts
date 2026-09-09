import type { SupabaseClient } from "@supabase/supabase-js";
export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  capacity: number | null;
  status: "draft" | "published" | "cancelled";
  category_id: string | null;
  categories?: { id: string; name: string; color: string | null } | null;
  image_url?: string | null;
};

export class EventQueryBuilder {
  private readonly client: SupabaseClient;
  private publishedOnly = false;
  private futureOnly = false;
  private category: string | null = null;
  private ascending = true;

  constructor(supabaseClient: SupabaseClient) {
    this.client = supabaseClient;
  }

  public static from(supabaseClient: SupabaseClient): EventQueryBuilder {
    return new EventQueryBuilder(supabaseClient);
  }

  public soloPublicados(): this {
    this.publishedOnly = true;
    return this;
  }

  public soloFuturos(): this {
    this.futureOnly = true;
    return this;
  }

  public porCategoria(categoria: string): this {
    this.category = categoria;
    return this;
  }

  public ordenarCronologico(): this {
    this.ascending = true;
    return this;
  }

  public async execute(): Promise<EventRecord[]> {
    let query = this.client.from("events").select("id, title, description, start_time, end_time, location, capacity, status, category_id, categories(id, name, color), image_url");

    if (this.publishedOnly) {
      query = query.eq("status", "published");
    }

    if (this.futureOnly) {
      query = query.gte("start_time", new Date().toISOString());
    }

    if (this.category) {
      query = query.eq("category_id", this.category);
    }

    const { data, error } = await query.order("start_time", { ascending: this.ascending });

    if (error) {
      return [];
    }

    return (data ?? []) as unknown as EventRecord[];
  }
}
