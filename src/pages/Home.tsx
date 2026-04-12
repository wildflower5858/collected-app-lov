import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

const collections = [
  { type: "f1", name: "Formula 1" },
  { type: "kpop", name: "K-Pop", disabled: true },
  { type: "pokemon", name: "Pokémon", disabled: true },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: counts } = useQuery({
    queryKey: ["collection-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("cards")
        .select("driver_id, drivers!inner(collection_type)");
      const map: Record<string, number> = {};
      (data ?? []).forEach((c: any) => {
        const ct = c.drivers?.collection_type;
        if (ct) map[ct] = (map[ct] || 0) + 1;
      });
      return map;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-12 py-5 border-b border-border">
        <img src="/logo.svg" alt="collected" className="h-7" />
        <div className="flex-1 mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full max-w-md bg-secondary rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-foreground/30"
          />
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Settings size={18} />
        </button>
      </header>

      <main className="px-12 py-10">
        <div className="grid grid-cols-3 gap-6 max-w-[720px]">
          {collections.map((col) => (
            <button
              key={col.type}
              disabled={col.disabled}
              onClick={() => navigate(`/collection/${col.type}`)}
              className={`group bg-card rounded-lg border border-border p-6 text-left transition-all duration-200
                ${col.disabled ? "opacity-40 cursor-not-allowed" : "hover:border-foreground/20 active:scale-[0.98]"}`}
            >
              <div className="h-32 bg-secondary rounded-md mb-4" />
              <div className="text-section-title text-card-foreground">{col.name}</div>
              <div className="text-body text-muted-foreground mt-1">
                {counts?.[col.type] ?? 0} cards
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
