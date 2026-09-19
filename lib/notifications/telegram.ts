type TelegramEnrollment = {
  studentName: string;
  eventTitle: string;
  startTime: string;
  location: string | null;
};

const TELEGRAM_API = "https://api.telegram.org";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(isoDate));
}

export async function notifyTelegramEnrollment(enrollment: TelegramEnrollment) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const recipients = [
    process.env.TELEGRAM_ADMIN_CHAT_ID,
    process.env.TELEGRAM_PROFESSOR_CHAT_ID,
  ].filter((chatId): chatId is string => Boolean(chatId?.trim()));

  if (!token || recipients.length === 0) return { sent: false, reason: "not-configured" as const };

  const message = [
    "🚨 Nueva inscripción en Like a Shh",
    `Alumna: ${enrollment.studentName}`,
    `Clase: ${enrollment.eventTitle}`,
    `Fecha: ${formatDate(enrollment.startTime)}`,
    enrollment.location ? `Lugar / enlace: ${enrollment.location}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const results = await Promise.allSettled(
    [...new Set(recipients)].map(async (chatId) => {
      const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Telegram respondió ${response.status}`);
    })
  );

  return { sent: results.some((result) => result.status === "fulfilled") };
}
