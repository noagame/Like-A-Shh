import type { SupabaseClient } from "@supabase/supabase-js";
type CommandResult = { success: boolean; data?: Record<string, unknown>; error?: string };

type Command = {
  execute: () => Promise<CommandResult>;
  actionName: string;
};

export class CommandInvoker {
  constructor(
    private readonly supabaseClient: SupabaseClient
  ) {}

  public async execute(command: Command): Promise<CommandResult> {
    const result = await command.execute();

    if (!result.success) {
      return result;
    }

    const {
      data: { user },
    } = await this.supabaseClient.auth.getUser();

    const { error } = await this.supabaseClient.from("audit_log").insert({
      actor_id: user?.id ?? null,
      action: command.actionName,
      metadata: result.data ?? {},
    });

    if (error) return { success: false, error: "La operación se completó, pero no se pudo registrar la auditoría. Revisa el resultado antes de reintentar." };
    return result;
  }
}
