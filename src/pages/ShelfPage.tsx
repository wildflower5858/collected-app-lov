import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Driver } from "@/lib/types";
import DriverAvatar from "@/components/DriverAvatar";
import AddDriverDialog from "@/components/AddDriverDialog";
import { useState } from "react";

export default function DriverList() {
  const { collectionType } = useParams<{ collectionType: string }>();
  const navigate = useNavigate();
  const [showAddDriver, setShowAddDriver] = useState(false);

  const { data: drivers, refetch } = useQuery({
    queryKey: ["drivers", collectionType],
    queryFn: async () => {
      const { data: driversData } = await supabase
        .from("drivers")
        .select("*")
        .eq("collection_type", collectionType ?? "f1")
        .order("sort_order");

      // Get card counts per driver
      const { data: cards } = await supabase
        .from("cards")
        .select("driver_id");

      const countMap: Record<string, number> = {};
      (cards ?? []).forEach((c) => {
        countMap[c.driver_id] = (countMap[c.driver_id] || 0) + 1;
      });

      return (driversData ?? []).map((d) => ({
        ...d,
        card_count: countMap[d.id] || 0,
      })) as Driver[];
    },
  });

  const collectionName = collectionType === "f1" ? "Formula 1" : collectionType ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="px-12 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Collections
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-page-title text-foreground">{collectionName}</h1>
          <button
            onClick={() => setShowAddDriver(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Plus size={14} />
            Add Driver
          </button>
        </div>
      </header>
      <main className="px-12 max-w-[720px]">
        <div className="flex flex-col">
          {(drivers ?? []).map((driver, i) => (
            <button
              key={driver.id}
              onClick={() => navigate(`/driver/${driver.id}`)}
              className="flex items-center gap-4 py-3 px-3 -mx-3 rounded-md hover:bg-card transition-colors group"
              style={{
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-[3px] h-10 rounded-full shrink-0"
                style={{ backgroundColor: driver.color_hex }}
              />
              <DriverAvatar driver={driver} size={36} />
              <div className="flex-1 text-left">
                <div className="text-section-title text-foreground">{driver.name}</div>
                <div className="text-[12px] text-muted-foreground">
                  {driver.team} · {driver.card_count} card{driver.card_count !== 1 ? "s" : ""}
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>
          ))}
        </div>
      </main>
      <AddDriverDialog
        open={showAddDriver}
        onClose={() => setShowAddDriver(false)}
        collectionType={collectionType ?? "f1"}
        onAdded={refetch}
      />
    </div>
  );
}
