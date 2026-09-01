type CommandResult = { success: boolean; data?: Record<string, unknown>; error?: string };

type AuditLogPayload = {
  actor_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
};

type Command = {
  execute: () => Promise<CommandResult>;
  actionName: string;
};

export class CommandInvoker {
  constructor(
    private readonly supabaseClient: any
  ) {}

  public async execute(command: Command): Promise<CommandResult> {
    const result = await command.execute();

    if (!result.success) {
      return result;
    }

    const {
      data: { user },
    } = await this.supabaseClient.auth.getUser();

    await this.supabaseClient.from("audit_log").insert({
      actor_id: user?.id ?? null,
      action: command.actionName,
      metadata: result.data ?? {},
    });

    return result;
  }
}
