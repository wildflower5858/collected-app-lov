import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import type { F1Driver } from "@/lib/types";

export default function F1Shelf() {
  const navigate = useNavigate();

  const { data: drivers } = useQuery({
    queryKey: ["f1-drivers"],
    queryFn: async () => {
      const { data: driversData } = await supabase
        .from("f1_drivers")
        .select("*")
        .order("name");
      const { data: cards } = await supabase
        .from("f1_cards")
        .select("driver_id");
      const countMap: Record<string, number> = {};
      (cards ?? []).forEach((c: any) => {
        countMap[c.driver_id] = (countMap[c.driver_id] || 0) + 1;
      });
      return (driversData ?? []).map((d: any) => ({
        ...d,
        card_count: countMap[d.id] || 0,
      })) as F1Driver[];
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
        <div className="w-[34px]" />
      </header>

      <div className="px-12 py-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Collections
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-page-title text-foreground">Formula 1 Shelf</h1>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {(drivers ?? []).map((driver) => (
            <button
              key={driver.id}
              onClick={() => navigate(`/f1/cards/${driver.id}`)}
              className="group text-left"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3">
                <img
                  src={`/binders/f1/${driver.name.toLowerCase().replace(/\s+/g, "-")}.svg`}
                  alt={driver.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className="text-section-title text-foreground">{driver.name}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {driver.card_count} card{driver.card_count !== 1 ? "s" : ""}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
