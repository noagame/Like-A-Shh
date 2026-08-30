import Image from "next/image";

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  url: string;
}

export interface ClassItem {
  id: string;
  title: string;
  description?: string | null;
  start_time?: string;
  location?: string | null;
  image_url?: string;
  url?: string;
}

const WHATSAPP_AGENDA_URL =
  "https://wa.me/56971577711?text=Hola%20Maximiliano,%20vengo%20de%20la%20p%C3%A1gina%20web%20Like%20a%20Shh%20y%20me%20gustar%C3%ADa%20agendar%20una%20clase.";

const FALLBACK_SUPABASE_IMAGE =
  "https://ssgcrrblxmmqurjlwope.supabase.co/storage/v1/object/public/galerias/cursos/curso_b4285aab-184e-4534-9398-1869ac6dd017.jpg";

// 2. Tarjetas para Carruseles
export function StandardProgramCard({
  title,
  description,
  imageUrl,
  badgeText,
  buttonText = "Agenda aquí",
  url = "#",
}: {
  title: string;
  description: string;
  imageUrl: string;
  badgeText: string;
  buttonText?: string;
  url?: string;
}) {
  const isHotmart = url.includes("hotmart.com");
  const targetUrl =
    isHotmart ? url : url !== "#" && url.trim() !== "" ? url : WHATSAPP_AGENDA_URL;

  const isLogo = imageUrl.includes("logo");

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between h-full shadow-xl hover:border-gold/40 transition-all duration-300">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/5 bg-[#0b0b0b]">
          <Image
            src={imageUrl || FALLBACK_SUPABASE_IMAGE}
            alt={title}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
            quality={100}
            className={`h-full w-full transition-transform duration-500 ${isLogo ? "object-contain p-4" : "object-cover object-center"}`}
            style={{
              objectFit: isLogo ? "contain" : "cover",
              objectPosition: "center",
            }}
          />
        </div>

        <div className="p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full inline-block mb-3">
            {badgeText}
          </span>
          <h4
            className="text-base font-bold text-white line-clamp-1 mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h4>
          <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/10 transition-all cursor-pointer"
        >
          {buttonText} ↗
        </a>
      </div>
    </div>
  );
}