import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Card, Driver, ReferenceItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  card: Card;
  driver: Driver;
  onSaved: () => void;
}

export default function EditCardDialog({ open, onClose, card, driver, onSaved }: Props) {
  const [year, setYear] = useState(card.year);
  const [setName, setSetName] = useState(card.set_name);
  const [cardNumber, setCardNumber] = useState(card.card_number ?? "");
  const [cardName, setCardName] = useState(card.card_name ?? "");
  const [parallel, setParallel] = useState(card.parallel);
  const [cardType, setCardType] = useState(card.card_type);
  const [status, setStatus] = useState(card.status);
  const [copyNumber, setCopyNumber] = useState(card.copy_number ?? "");
  const [printRun, setPrintRun] = useState(card.print_run ?? "");
  const [isLandscape, setIsLandscape] = useState(card.is_landscape);
  const [isGraded, setIsGraded] = useState(card.is_graded);
  const [gradingCompany, setGradingCompany] = useState(card.grading_company ?? "");
  const [grade, setGrade] = useState(card.grade ?? "");
  const [certNumber, setCertNumber] = useState(card.cert_number ?? "");
  const [notes, setNotes] = useState(card.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (side: "front" | "back", file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${card.id}/${side}.${ext}`;
    await supabase.storage.from("card-images").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("card-images").getPublicUrl(path);
    const url = urlData.publicUrl;
    const col = side === "front" ? "image_front_url" : "image_back_url";
    await supabase.from("cards").update({ [col]: url }).eq("id", card.id);
    setUploading(false);
    onSaved();
  };

  const handleSave = async () => {
    setSaving(true);
    await supabase.from("cards").update({
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
      is_graded: isGraded,
      grading_company: isGraded ? gradingCompany || null : null,
      grade: isGraded ? grade || null : null,
      cert_number: isGraded ? certNumber || null : null,
      notes: notes || null,
    }).eq("id", card.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-md border border-border bg-background text-body focus:outline-none focus:ring-1 focus:ring-foreground/20";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-card max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-section-title">Edit Card</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {/* Image uploads */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block">Front Image</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("front", e.target.files[0])}
                className="text-[11px] text-muted-foreground" />
            </div>
            <div>
              <label className="text-label mb-1 block">Back Image</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload("back", e.target.files[0])}
                className="text-[11px] text-muted-foreground" />
            </div>
          </div>
          {uploading && <div className="text-[11px] text-muted-foreground">Uploading...</div>}

          <div>
            <label className="text-label mb-1 block">Set</label>
            <select value={setName} onChange={(e) => setSetName(e.target.value)} className={inputClass}>
              {(sets ?? []).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block">Card Name</label>
              <input value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-label mb-1 block">Card Number</label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-label mb-1 block">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className="text-label mb-1 block">Parallel</label>
              <select value={parallel} onChange={(e) => setParallel(e.target.value)} className={inputClass}>
                {(parallels ?? []).map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-label mb-1 block">Card Type</label>
              <select value={cardType} onChange={(e) => setCardType(e.target.value)} className={inputClass}>
                {(cardTypes ?? []).map((ct) => <option key={ct.id} value={ct.name}>{ct.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-label mb-1 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="owned">Owned</option>
                <option value="purchased">Purchased</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>
            <div>
              <label className="text-label mb-1 block">Copy #</label>
              <input value={copyNumber} onChange={(e) => setCopyNumber(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-label mb-1 block">Print Run</label>
              <input value={printRun} onChange={(e) => setPrintRun(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isLandscape} onChange={(e) => setIsLandscape(e.target.checked)} className="rounded border-border" id="edit-landscape" />
            <label htmlFor="edit-landscape" className="text-body text-foreground">Landscape orientation</label>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isGraded} onChange={(e) => setIsGraded(e.target.checked)} className="rounded border-border" id="edit-graded" />
            <label htmlFor="edit-graded" className="text-body text-foreground">Graded card</label>
          </div>

          {isGraded && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-label mb-1 block">Company</label>
                <input value={gradingCompany} onChange={(e) => setGradingCompany(e.target.value)} className={inputClass} placeholder="PSA" />
              </div>
              <div>
                <label className="text-label mb-1 block">Grade</label>
                <input value={grade} onChange={(e) => setGrade(e.target.value)} className={inputClass} placeholder="10" />
              </div>
              <div>
                <label className="text-label mb-1 block">Cert #</label>
                <input value={certNumber} onChange={(e) => setCertNumber(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          <div>
            <label className="text-label mb-1 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass + " resize-none"} rows={2} />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 px-4 py-2 rounded-md bg-foreground text-background text-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
