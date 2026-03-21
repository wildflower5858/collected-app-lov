import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  collectionType: string;
  onAdded: () => void;
}

export default function AddDriverDialog({ open, onClose, collectionType, onAdded }: Props) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [color, setColor] = useState("#888888");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("drivers").insert({
      name: name.trim(),
      team: team.trim() || null,
      collection_type: collectionType,
      color_hex: color,
      sort_order: 999,
    });
    setSaving(false);
    setName("");
    setTeam("");
    setColor("#888888");
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-section-title">Add Driver</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <label className="text-label mb-1.5 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-body focus:outline-none focus:ring-1 focus:ring-foreground/20"
              placeholder="e.g. Lewis Hamilton"
            />
          </div>
          <div>
            <label className="text-label mb-1.5 block">Team</label>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-body focus:outline-none focus:ring-1 focus:ring-foreground/20"
              placeholder="e.g. Mercedes"
            />
          </div>
          <div>
            <label className="text-label mb-1.5 block">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-md border border-border cursor-pointer"
              />
              <span className="text-body text-muted-foreground">{color}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="mt-2 px-4 py-2 rounded-md bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving..." : "Add Driver"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
