import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronDown, ChevronRight, Plus, X } from "lucide-react";

interface ReferenceItem {
  id: string;
  name: string;
}

interface Group {
  id: number;
  name: string;
  sort_order: number;
}

function RefListSection({ title, table }: { title: string; table: string }) {
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
    <div className="mb-6">
      <h4 className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
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

function GroupRefListSection({ title, table, groupId }: { title: string; table: string; groupId: number }) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: items } = useQuery({
    queryKey: [`ref-${table}-${groupId}`],
    queryFn: async () => {
      const { data } = await supabase.from(table).select("*").eq("group_id", groupId).order("name");
      return data as ReferenceItem[];
    },
  });

  const addItem = async () => {
    if (!newName.trim()) return;
    await supabase.from(table).insert({ name: newName.trim(), group_id: groupId });
    setNewName("");
    queryClient.invalidateQueries({ queryKey: [`ref-${table}-${groupId}`] });
  };

  const deleteItem = async (id: string) => {
    await supabase.from(table).delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: [`ref-${table}-${groupId}`] });
  };

  return (
    <div className="mb-6">
      <h4 className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
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

function KpopGroupSection({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors rounded-lg"
      >
        <span className="text-section-title text-foreground">{group.name}</span>
        {open ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <GroupRefListSection title="Albums" table="albums" groupId={group.id} />
          <GroupRefListSection title="Events" table="events" groupId={group.id} />
          <GroupRefListSection title="Stores" table="stores" groupId={group.id} />
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();

  const { data: groups } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data } = await supabase.from("groups").select("*").order("sort_order");
      return data as Group[];
    },
  });

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

      <main className="px-12 pb-12 max-w-[680px]">

        <section className="mb-10">
          <h2 className="text-section-title text-foreground mb-4">Formula 1</h2>
          <RefListSection title="Sets" table="f1_sets" />
          <RefListSection title="Parallels" table="f1_parallels" />
        </section>

        <section className="mb-10">
          <h2 className="text-section-title text-foreground mb-4">K-Pop</h2>
          {(groups ?? []).map((group) => (
            <KpopGroupSection key={group.id} group={group} />
          ))}
        </section>

        <section className="mb-10">
          <h2 className="text-section-title text-foreground mb-4">Pokémon</h2>
          <RefListSection title="Sets" table="pokemon_sets" />
        </section>

      </main>
    </div>
  );
}