import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

export default function KpopGroupsPage() {
  const navigate = useNavigate();

  const { data: groups } = useQuery({
    queryKey: ["kpop-groups"],
    queryFn: async () => {
      const { data } = await supabase
        .from("groups")
        .select("*")
        .order("id");
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
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Collections
        </button>

        <h1 className="text-page-title text-foreground mb-8">K-Pop</h1>

        <div className="grid grid-cols-4 gap-6">
          {(groups ?? []).map((group: any) => (
            <button
              key={group.id}
              onClick={() => navigate(`/kpop/shelf/${group.id}`)}
              className="group text-left"
            >
              <div className="aspect-[2/3] rounded-lg bg-secondary mb-3" />
              <div className="text-section-title text-foreground">{group.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
