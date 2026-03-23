import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Grid3X3, LayoutGrid, List, Plus } from "lucide-react";
import type { Driver, Card, ViewMode } from "@/lib/types";
import { useState } from "react";
import BinderView from "@/components/BinderView";
import ListView from "@/components/ListView";
import ScrollView from "@/components/ScrollView";
import AddCardDialog from "@/components/AddCardDialog";

export default function CardCollection() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");
  const [showAddCard, setShowAddCard] = useState(false);

  const { data: driver } = useQuery({
    queryKey: ["driver", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", driverId!)
        .single();
      return data as Driver;
    },
  });

  const { data: cards, refetch } = useQuery({
    queryKey: ["cards", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("driver_id", driverId!)
        .order("sort_order");
      return (data ?? []) as Card[];
    },
  });

  if (!driver) return null;

  const viewButtons: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] = [
    { mode: "binder", icon: Grid3X3, label: "Binder" },
    { mode: "list", icon: List, label: "List" },
    { mode: "sort", icon: ArrowUpDown, label: "Sort" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header
        className="px-12 py-8 border-b"
        style={{ borderBottomColor: driver.color_hex + "30" }}
      >
        <button
          onClick={() => navigate(`/collection/${driver.collection_type}`)}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: driver.color_hex }}
            />
            <h1 className="text-page-title text-foreground">{driver.name}</h1>
            <span className="text-body text-muted-foreground ml-2">
              {cards?.length ?? 0} cards
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary rounded-md p-0.5">
              {viewButtons.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors
                    ${viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  title={label}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ml-2"
            >
              <Plus size={13} />
              Add Card
            </button>
          </div>
        </div>
      </header>
      <main className="px-12 py-8">
        {viewMode === "binder" && <BinderView cards={cards ?? []} driver={driver} />}
        {viewMode === "list" && <ListView cards={cards ?? []} driver={driver} />}
        {viewMode === "sort" && <SortView cards={cards ?? []} driver={driver} />}
      </main>
      <AddCardDialog
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
        driver={driver}
        onAdded={refetch}
      />
    </div>
  );
}
