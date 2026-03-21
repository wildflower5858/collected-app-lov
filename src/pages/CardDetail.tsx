import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";
import type { Card, Driver } from "@/lib/types";
import { useState } from "react";
import EditCardDialog from "@/components/EditCardDialog";
import ParallelBadge from "@/components/ParallelBadge";

export default function CardDetail() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBack, setShowBack] = useState(false);
  const [editing, setEditing] = useState(false);

  const { data: card } = useQuery({
    queryKey: ["card", cardId],
    queryFn: async () => {
      const { data } = await supabase.from("cards").select("*").eq("id", cardId!).single();
      return data as Card;
    },
  });

  const { data: driver } = useQuery({
    queryKey: ["card-driver", card?.driver_id],
    enabled: !!card?.driver_id,
    queryFn: async () => {
      const { data } = await supabase.from("drivers").select("*").eq("id", card!.driver_id).single();
      return data as Driver;
    },
  });

  if (!card || !driver) return null;

  const imageUrl = showBack ? card.image_back_url : card.image_front_url;
  const hasBackImage = !!card.image_back_url;

  const fieldRows: { label: string; value: string | null }[] = [
    { label: "Parallel", value: card.parallel },
    ...(card.copy_number || card.print_run ? [{ label: "Serial Number", value: `${card.copy_number ?? "–"}/${card.print_run ?? "–"}` }] : []),
    { label: "Card Type", value: card.card_type },
    { label: "Team", value: card.team },
    { label: "Status", value: card.status ? card.status.charAt(0).toUpperCase() + card.status.slice(1) : null },
    ...(card.is_graded ? [
      { label: "Grading Company", value: card.grading_company },
      { label: "Grade", value: card.grade },
      { label: "Cert Number", value: card.cert_number },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="px-12 py-8">
        <button
          onClick={() => navigate(`/driver/${driver.id}`)}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          {driver.name}
        </button>
      </header>
      <main className="px-12 pb-16">
        <div className="flex gap-12 max-w-[900px]">
          {/* Left: Image */}
          <div className="w-[360px] shrink-0">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={card.card_name ?? ""}
                  className={`w-full ${card.is_landscape && !showBack ? "" : ""}`}
                  style={{ display: "block" }}
                />
              ) : (
                <div className="aspect-[2.5/3.5] flex items-center justify-center">
                  <span className="text-body text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
            {hasBackImage && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowBack(false)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-colors
                    ${!showBack ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
                >
                  Front
                </button>
                <button
                  onClick={() => setShowBack(true)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-colors
                    ${showBack ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
                >
                  Back
                </button>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex-1 pt-2">
            {/* Identity chips */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium text-foreground">
                {card.set_name} {card.year}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  backgroundColor: driver.color_hex + "18",
                  color: driver.color_hex,
                }}
              >
                {driver.name}
              </span>
            </div>

            {card.card_number && (
              <div className="text-[12px] text-muted-foreground mb-1">{card.card_number}</div>
            )}
            {card.card_name && (
              <div className="text-label mb-2">{card.card_name}</div>
            )}
            <h2 className="text-card-name text-foreground mb-6">
              {card.card_name || card.card_number || "Untitled Card"}
            </h2>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              {fieldRows.map((row) =>
                row.value ? (
                  <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-[12px] text-muted-foreground">{row.label}</span>
                    <span className="text-[13px] text-foreground">
                      {row.label === "Parallel" ? <ParallelBadge parallel={row.value} /> : row.value}
                    </span>
                  </div>
                ) : null
              )}
            </div>

            {card.notes && (
              <div className="mt-6">
                <div className="text-label mb-1">Notes</div>
                <div className="text-body text-foreground">{card.notes}</div>
              </div>
            )}

            <button
              onClick={() => setEditing(true)}
              className="mt-8 px-4 py-2 rounded-md bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity"
            >
              Edit Card
            </button>
          </div>
        </div>
      </main>
      <EditCardDialog
        open={editing}
        onClose={() => setEditing(false)}
        card={card}
        driver={driver}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["card", cardId] });
          queryClient.invalidateQueries({ queryKey: ["cards"] });
        }}
      />
    </div>
  );
}
