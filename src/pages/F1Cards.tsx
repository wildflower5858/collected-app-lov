import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Grid3X3, LayoutGrid, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { F1Driver, F1Card } from "@/lib/types";
import { useState } from "react";

type ViewMode = "binder" | "grid";

export default function F1Cards() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");

  const { data: driver } = useQuery({
    queryKey: ["f1-driver", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("f1_drivers")
        .select("*")
        .eq("id", driverId!)
        .single();
      return data as F1Driver;
    },
  });

  const { data: cards } = useQuery({
    queryKey: ["f1-cards", driverId],
    queryFn: async () => {
      const { data } = await supabase
        .from("f1_cards")
        .select("*, f1_sets(name), f1_parallels(name)")
        .eq("driver_id", driverId!)
        .order("sort_order");
      return (data ?? []).map((c: any) => ({
        ...c,
        set_name: c.f1_sets?.name ?? null,
        parallel_name: c.f1_parallels?.name ?? null,
      })) as F1Card[];
    },
  });

  if (!driver) return null;

  const viewButtons: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] = [
    { mode: "binder", icon: Grid3X3, label: "Binder" },
    { mode: "grid", icon: LayoutGrid, label: "Grid" },
  ];

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
          onClick={() => navigate("/f1/shelf")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Shelf
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-page-title text-foreground">{driver.name}</h1>
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            {viewButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors
                  ${viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {(cards ?? []).length === 0 ? (
          <div className="text-body text-muted-foreground py-12 text-center">
            No cards yet.
          </div>
        ) : viewMode === "binder" ? (
          <F1BinderView cards={cards ?? []} />
        ) : (
          <F1GridView cards={cards ?? []} />
        )}
      </div>
    </div>
  );
}

function F1BinderView({ cards }: { cards: F1Card[] }) {
  const [page, setPage] = useState(0);
  const slotsPerSpread = 18; // 9 per side

  const totalSpreads = Math.max(1, Math.ceil(cards.length / slotsPerSpread));
  const start = page * slotsPerSpread;
  const leftCards = cards.slice(start, start + 9);
  const rightCards = cards.slice(start + 9, start + 18);

  const pillStyle: React.CSSProperties = {
    backgroundColor: "rgba(10,10,10,0.6)",
    color: "white",
    fontSize: "9px",
    padding: "2px 4px",
    borderRadius: "3px",
    lineHeight: 1,
  };

  const renderSlot = (card: F1Card | undefined, idx: number) => {
    if (!card) {
      return (
        <div
          key={`empty-${idx}`}
          className="aspect-[2.5/3.5] rounded-lg bg-secondary"
        />
      );
    }
    return (
      <div
        key={card.id}
        className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative"
      >
        {card.image_front ? (
          <img
            src={card.image_front}
            alt={card.card_name ?? ""}
            className={`absolute inset-0 w-full h-full object-cover
              ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-[11px] text-muted-foreground">No Image</span>
          </div>
        )}
        {card.status === "purchased" && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(180,0,0,0.45)" }}>
            <span className="text-[11px] font-medium text-white">Purchased</span>
          </div>
        )}
        {card.status === "wishlist" && card.image_front && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-medium text-white">Wishlist</span>
          </div>
        )}
        {card.parallel_name && (
          <span className="absolute top-1.5 left-1.5 font-medium" style={pillStyle}>
            {card.parallel_name}
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-6">
        {/* Left page */}
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(leftCards[i], i))}
          </div>
        </div>
        {/* Right page */}
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(rightCards[i], i + 9))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <span className="text-[12px] text-muted-foreground">
          {page + 1} / {totalSpreads}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalSpreads - 1, p + 1))}
          disabled={page >= totalSpreads - 1}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function F1GridView({ cards }: { cards: F1Card[] }) {
  return (
    <div className="grid grid-cols-4 gap-5 px-5">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col">
          <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative bg-secondary">
            {card.image_front ? (
              <img
                src={card.image_front}
                alt={card.card_name ?? ""}
                className={`absolute inset-0 w-full h-full object-cover
                  ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="text-[11px] text-muted-foreground">No Image</span>
              </div>
            )}
            {card.status === "purchased" && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: "rgba(180,0,0,0.45)" }}>
                <span className="text-[11px] font-medium text-white">Purchased</span>
              </div>
            )}
            {card.status === "wishlist" && card.image_front && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-medium text-white">Wishlist</span>
              </div>
            )}
          </div>
          <div className="mt-2">
            <div className="text-[13px] font-medium text-foreground truncate">
              {card.card_name || card.card_number || "Untitled"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {card.set_name ?? "—"}
            </div>
            <div className="text-[11px] text-muted-foreground capitalize mt-0.5">
              {card.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
