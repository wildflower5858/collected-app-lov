import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Grid3X3, LayoutGrid, Plus } from "lucide-react";
import type { Person, Card, ViewMode } from "@/lib/types";
import { useState } from "react";
import BinderView from "@/components/BinderView";
import ScrollView from "@/components/ScrollView";
import AddCardDialog from "@/components/AddCardDialog";

export default function CardCollection() {
  const { personId } = useParams<{ personId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("scroll");
  const [showAddCard, setShowAddCard] = useState(false);

  const { data: person } = useQuery({
    queryKey: ["person", personId],
    queryFn: async () => {
      const { data } = await supabase
        .from("persons")
        .select("*")
        .eq("id", personId!)
        .single();
      return data as Person;
    },
  });

  const { data: cards, refetch } = useQuery({
    queryKey: ["cards", personId],
    queryFn: async () => {
      const { data } = await supabase
        .from("cards")
        .select("*")
        .eq("person_id", personId!)
        .order("sort_order");
      return (data ?? []) as Card[];
    },
  });

  if (!person) return null;

  const viewButtons: { mode: ViewMode; icon: typeof Grid3X3; label: string }[] = [
    { mode: "binder", icon: Grid3X3, label: "Binder" },
    { mode: "scroll", icon: LayoutGrid, label: "Scroll" },
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: person.color_hex }}
            />
            <h1 className="text-page-title text-foreground">{person.name}</h1>
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

        <main>
          {viewMode === "binder" && <BinderView cards={cards ?? []} person={person} />}
          {viewMode === "scroll" && <ScrollView cards={cards ?? []} person={person} />}
        </main>
      </div>

      <AddCardDialog
        open={showAddCard}
        onClose={() => setShowAddCard(false)}
        person={person}
        onAdded={refetch}
      />
    </div>
  );
}
