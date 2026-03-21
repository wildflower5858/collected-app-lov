import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Plus, X } from "lucide-react";
import type { ReferenceItem } from "@/lib/types";

function RefListSection({ title, table }: { title: string; table: "sets" | "parallels" | "card_types" }) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: items } = useQuery({
    queryKey: [`ref-${table}`],
    queryFn: async () => {
      const { data } = await supabase.from(table).select("*").order("name");
      return data as ReferenceItem[];
    },
  });

  const addItem = async () => {
    if (!newName.trim()) return;
    await supabase.from(table).insert({ name: newName.trim() });
    setNewName("");
    queryClient.invalidateQueries({ queryKey: [`ref-${table}`] });
  };

  const deleteItem = async (id: string) => {
    await supabase.from(table).delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: [`ref-${table}`] });
  };

  return (
    <div className="mb-8">
      <h3 className="text-section-title text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {(items ?? []).map((item) => (
          <span key={item.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-body text-foreground">
            {item.name}
            <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="px-3 py-1.5 rounded-md border border-border bg-background text-body focus:outline-none focus:ring-1 focus:ring-foreground/20"
          placeholder="Add new..."
        />
        <button onClick={addItem} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="px-12 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Home
        </button>
        <h1 className="text-page-title text-foreground">Settings</h1>
      </header>
      <main className="px-12 max-w-[600px]">
        <RefListSection title="Sets" table="sets" />
        <RefListSection title="Parallels" table="parallels" />
        <RefListSection title="Card Types" table="card_types" />
      </main>
    </div>
  );
}
