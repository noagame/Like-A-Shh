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
        <div className="relative aspect-[4/3] w-full bg-black/60 overflow-hidden flex items-center justify-center p-3 border-b border-white/5">
          <Image
            src={imageUrl || "/assets/logo/logo_likeashh.jpg"}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={95}
            className={`${isLogo ? "object-contain p-4" : "object-cover"} transition-transform duration-500`}
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