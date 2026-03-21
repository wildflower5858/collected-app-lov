import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Driver, ReferenceItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  driver: Driver;
  onAdded: () => void;
}

export default function AddCardDialog({ open, onClose, driver, onAdded }: Props) {
  const [mode, setMode] = useState<"quick" | "complete">("quick");
  const [year, setYear] = useState(new Date().getFullYear());
  const [setName, setSetName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [parallel, setParallel] = useState("Base");
  const [cardType, setCardType] = useState("Base");
  const [status, setStatus] = useState("owned");
  const [copyNumber, setCopyNumber] = useState("");
  const [printRun, setPrintRun] = useState("");
  const [isLandscape, setIsLandscape] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: sets } = useQuery({
    queryKey: ["ref-sets"],
    queryFn: async () => {
      const { data } = await supabase.from("sets").select("*").order("name");
      return data as ReferenceItem[];
    },
  });

  const { data: parallels } = useQuery({
    queryKey: ["ref-parallels"],
    queryFn: async () => {
      const { data } = await supabase.from("parallels").select("*").order("name");
      return data as ReferenceItem[];
    },
  });

  const { data: cardTypes } = useQuery({
    queryKey: ["ref-card-types"],
    queryFn: async () => {
      const { data } = await supabase.from("card_types").select("*").order("name");
      return data as ReferenceItem[];
    },
  });

  const handleSave = async () => {
    if (!setName) return;
    setSaving(true);
    await supabase.from("cards").insert({
      driver_id: driver.id,
      year,
      set_name: setName,
      card_number: cardNumber || null,
      card_name: cardName || null,
      parallel,
      card_type: cardType,
      status,
      copy_number: copyNumber || null,
      print_run: printRun || null,
      is_landscape: isLandscape,
      notes: notes || null,
      team: driver.team,
      sort_order: 999,
    });
    setSaving(false);
    // Reset
    setCardNumber("");
    setCardName("");
    setCopyNumber("");
    setPrintRun("");
    setNotes("");
    setIsLandscape(false);
    onAdded();
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-md border border-border bg-background text-body focus:outline-none focus:ring-1 focus:ring-foreground/20";
  const selectClass = inputClass;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-section-title">Add Card — {driver.name}</DialogTitle>
        </DialogHeader>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setMode("quick")}
            className={`px-3 py-1 rounded text-[11px] font-medium transition-colors
              ${mode === "quick" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
          >
            Quick
          </button>
          <button
            onClick={() => setMode("complete")}
            className={`px-3 py-1 rounded text-[11px] font-medium transition-colors
              ${mode === "complete" ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
          >
            Complete
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-label mb-1 block">Set *</label>
            <select value={setName} onChange={(e) => setSetName(e.target.value)} className={selectClass}>
              <option value="">Select set...</option>
              {(sets ?? []).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block">Card Name</label>
              <input value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputClass} placeholder="e.g. Pole Position" />
            </div>
            <div>
              <label className="text-label mb-1 block">Card Number</label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={inputClass} placeholder="e.g. #176" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="text-label mb-1 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                <option value="owned">Owned</option>
                <option value="purchased">Purchased</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>
          </div>

          {mode === "complete" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label mb-1 block">Parallel</label>
                  <select value={parallel} onChange={(e) => setParallel(e.target.value)} className={selectClass}>
                    {(parallels ?? []).map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-label mb-1 block">Card Type</label>
                  <select value={cardType} onChange={(e) => setCardType(e.target.value)} className={selectClass}>
                    {(cardTypes ?? []).map((ct) => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label mb-1 block">Copy #</label>
                  <input value={copyNumber} onChange={(e) => setCopyNumber(e.target.value)} className={inputClass} placeholder="e.g. 14" />
                </div>
                <div>
                  <label className="text-label mb-1 block">Print Run</label>
                  <input value={printRun} onChange={(e) => setPrintRun(e.target.value)} className={inputClass} placeholder="e.g. 50" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isLandscape}
                  onChange={(e) => setIsLandscape(e.target.checked)}
                  className="rounded border-border"
                  id="landscape"
                />
                <label htmlFor="landscape" className="text-body text-foreground">Landscape orientation</label>
              </div>
              <div>
                <label className="text-label mb-1 block">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass + " resize-none"} rows={2} />
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !setName}
            className="mt-2 px-4 py-2 rounded-md bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving..." : "Add Card"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
