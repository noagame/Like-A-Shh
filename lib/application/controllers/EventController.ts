import { createClient } from "@/lib/supabase/server";
import { EventAssembler } from "@/lib/infrastructure/assemblers/EventAssembler";
import { EventQueryBuilder } from "@/lib/infrastructure/builders/EventQueryBuilder";

export class EventController {
  public static async listPublicEvents() {
    const supabase = await createClient();
    const events = await EventQueryBuilder.from(supabase)
      .soloPublicados()
      .soloFuturos()
      .ordenarCronologico()
      .execute();

    return EventAssembler.toCards(events);
  }
}
