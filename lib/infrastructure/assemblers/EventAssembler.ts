export type EventCardDTO = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  capacity: number | null;
  status: "draft" | "published" | "cancelled";
  image_url?: string | null;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  capacity: number | null;
  status: "draft" | "published" | "cancelled";
  categories?: { name: string; color: string | null } | null;
  image_url?: string | null;
};

export class EventAssembler {
  public static toCard(event: EventRow): EventCardDTO {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
      categoryName: event.categories?.name ?? null,
      categoryColor: event.categories?.color ?? null,
      capacity: event.capacity,
      status: event.status,
      image_url: event.image_url ?? null,
    };
  }

  public static toCards(events: EventRow[]): EventCardDTO[] {
    return events.map((event) => this.toCard(event));
  }
}
