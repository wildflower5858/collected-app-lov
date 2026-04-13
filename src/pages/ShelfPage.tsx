import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Plus } from "lucide-react";
import type { Person } from "@/lib/types";
import AddDriverDialog from "@/components/AddDriverDialog";
import { useState } from "react";

function getBinderImage(collectionType: string, name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return `/binders/${collectionType}/${slug}.svg`;
}

export default function ShelfPage() {
  const { collectionType } = useParams<{ collectionType: string }>();
  const navigate = useNavigate();
  const [showAddPerson, setShowAddPerson] = useState(false);

  const { data: persons, refetch } = useQuery({
    queryKey: ["persons", collectionType],
    queryFn: async () => {
      const { data: personsData } = await supabase
        .from("drivers")
        .select("*")
        .eq("collection_type", collectionType ?? "f1")
        .order("sort_order");
      const { data: cards } = await supabase
        .from("cards")
        .select("driver_id");
      const countMap: Record<string, number> = {};
      (cards ?? []).forEach((c: any) => {
        countMap[c.driver_id] = (countMap[c.driver_id] || 0) + 1;
      });
      return (personsData ?? []).map((d) => ({
        ...d,
        card_count: countMap[d.id] || 0,
      })) as Person[];
    },
  });

  const collectionName = collectionType === "f1" ? "Formula 1"
    : collectionType === "kpop" ? "K-Pop"
    : collectionType === "pokemon" ? "Pokémon"
    : collectionType ?? "";

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
          <h1 className="text-page-title text-foreground">Shelf</h1>
          <button
            onClick={() => setShowAddPerson(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {(persons ?? []).map((person) => (
            <button
              key={person.id}
              onClick={() => navigate(`/person/${person.id}`)}
              className="group text-left"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary mb-3">
                <img
                  src={getBinderImage(collectionType ?? "f1", person.name)}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="text-section-title text-foreground">{person.name}</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                {person.card_count} card{person.card_count !== 1 ? "s" : ""}
              </div>
            </button>
          ))}
        </div>
      </div>

      <AddDriverDialog
        open={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        collectionType={collectionType ?? "f1"}
        onAdded={refetch}
      />
    </div>
  );
}
