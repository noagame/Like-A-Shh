import { createClient } from "@/lib/supabase/server";
import BackButton from "@/app/admin/components/BackButton";
import PanelInfo from "@/app/admin/components/PanelInfo";
import { revalidatePath } from "next/cache";

export default async function AjustesPage() {
  const supabase = await createClient();
  
  // Obtenemos los ajustes actuales desde Supabase
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  // Server Action incrustado para actualizar la base de datos
  async function updateSettings(formData: FormData) {
    "use server";
    const supabaseClient = await createClient();
    
    await supabaseClient.from("site_settings").update({
      site_title: formData.get("site_title"),
      site_description: formData.get("site_description"),
      seo_keywords: formData.get("seo_keywords"),
      primary_color: formData.get("primary_color"),
    }).eq("id", true); // Actualizamos la única fila existente

    // Revalidamos todo el sitio para que el layout.tsx tome los nuevos metadatos
    revalidatePath("/", "layout"); 
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <BackButton />
      
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-gold mb-2" style={{ fontFamily: "var(--font-serif)" }}>Ajustes del Sitio</h1>
        <p className="text-white/50">Configura el SEO global y la paleta de colores de la plataforma.</p>
      </div>

      <PanelInfo 
        title="SEO y Metadatos" 
        description="Esta información es la que lee Google y la que aparece cuando compartes el link de la página en WhatsApp o Instagram." 
      />

      <form action={updateSettings} className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
        
        {/* Título SEO */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Título de la página (Title Tag)</label>
          <input 
            type="text" 
            name="site_title" 
            defaultValue={settings?.site_title || "Like a SHH | Pole Dance, Danza Exotic y Cursos Online"} 
            className="w-full p-3 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Descripción SEO */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Descripción (Meta Description)</label>
          <textarea 
            name="site_description" 
            defaultValue={settings?.site_description || "Descubre Like a SHH: clases de pole dance, danza exotic, flexibilidad y bienestar corporal con cursos online, workshops y eventos exclusivos en Chile."} 
            rows={3}
            className="w-full p-3 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors resize-none"
          />
        </div>

        {/* Palabras Clave */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Palabras Clave (Separadas por coma)</label>
          <input 
            type="text" 
            name="seo_keywords" 
            defaultValue={settings?.seo_keywords || "pole dance, danza exotic, bienestar corporal, cursos online, like a shh"} 
            className="w-full p-3 bg-black/60 border border-white/10 rounded-lg text-white focus:border-gold outline-none transition-colors"
          />
        </div>

        {/* Selector de Color */}
        <div className="pb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">Color Principal (Botones y acentos)</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              name="primary_color" 
              defaultValue={settings?.primary_color || "#D4AF37"} 
              className="w-12 h-12 p-1 bg-black/60 border border-white/10 rounded cursor-pointer"
            />
            <span className="text-white/40 text-sm font-mono">{settings?.primary_color || "#D4AF37"}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button 
            type="submit" 
            className="bg-gold text-black px-8 py-3 rounded-lg font-bold hover:bg-gold-light transition-colors w-full md:w-auto"
          >
            Guardar Ajustes
          </button>
        </div>
      </form>
    </div>
  );
}