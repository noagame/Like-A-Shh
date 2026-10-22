type CourseLinkSource = {
  title: string;
  url?: string | null;
  link_label?: string | null;
};

const WHATSAPP_BASE = "https://wa.me/56971577711";

export function isCourseUrl(value: string): boolean {
  if (value === "#") return true;
  if (/^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function resolveCourseLink(course: CourseLinkSource): { url: string; label: string } {
  const title = course.title.toLocaleLowerCase("es-CL");
  const modality = title.includes("presencial") ? "presencial" : title.includes("online") ? "online" : null;
  const configuredUrl = course.url?.trim() ?? "";
  let url = configuredUrl && isCourseUrl(configuredUrl) ? configuredUrl : "#";

  if (url === "#" && modality) {
    const message = `Hola Maximiliano, vengo de la página web Like a Shh y me gustaría agendar una clase ${modality}.`;
    url = `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
  }

  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    // Las rutas internas y el valor sin enlace no tienen un host externo.
  }
  const whatsapp = host === "wa.me" || host === "whatsapp.com" || host.endsWith(".whatsapp.com");
  const hotmart = host === "hotmart.com" || host.endsWith(".hotmart.com");
  const defaultLabel = url === "#"
    ? "Sin enlace externo"
    : whatsapp || (modality && !hotmart)
      ? "Enlace a WhatsApp"
      : "Enlace a Hotmart/Web";

  return { url, label: course.link_label?.trim() || defaultLabel };
}
