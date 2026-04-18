import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

function getBinderImage(name: string): string {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return `/binders/kpop/${slug}.svg`;
}

export default function KpopShelfPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const { data: group } = useQuery({
    queryKey: ["kpop-group", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId!)
        .single();
      return data;
    },
  });

  const { data: binders } = useQuery({
    queryKey: ["kpop-binders", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("binders")
        .select("*")
        .eq("group_id", groupId!)
        .order("sort_order");
      return data ?? [];
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
          onClick={() => navigate("/kpop/groups")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          K-Pop
        </button>

        <h1 className="text-page-title text-foreground mb-8">
          {group?.name ?? ""}
        </h1>

        <div className="grid grid-cols-4 gap-6">
          {(binders ?? []).map((binder: any) => (
            <button
              key={binder.id}
              onClick={() => navigate(`/kpop/cards/${binder.id}`)}
              className="group text-left"
            >
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary mb-3">
                <img
                  src={getBinderImage(binder.name)}
                  alt={binder.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="text-section-title text-foreground">{binder.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
