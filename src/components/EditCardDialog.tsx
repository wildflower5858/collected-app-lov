import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Card, Person, ReferenceItem } from "@/lib/types";
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
  person: Person;
  onSaved: () => void;
}

function ImageUploadZone({
  label,
  currentUrl,
  onFileSelected,
}: {
  label: string;
  currentUrl: string | null;
  onFileSelected: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileSelected(file);
  };

  return (
    <div>
      <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">
        {label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-border hover:border-foreground/30 transition-colors flex items-center justify-center overflow-hidden bg-background"
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover rounded-md" />
        ) : (
          <span className="text-[12px] text-muted-foreground">Click to upload</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

export default function EditCardDialog({ open, onClose, card, person, onSaved }: Props) {
  const [year, setYear] = useState(card.year);
  const [setName, setSetName] = useState(card.set_name);
  const [cardNumber, setCardNumber] = useState(card.card_number ?? "");
  const [cardName, setCardName] = useState(card.card_name ?? "");
  const [parallel, setParallel] = useState(card.parallel);
  const [cardType, setCardType] = useState(card.card_type);
  const [status, setStatus] = useState(card.status);
  const [stampedNumber, setStampedNumber] = useState(() => {
    if (card.copy_number && card.print_run) return `${card.copy_number}/${card.print_run}`;
    if (card.copy_number) return card.copy_number;
    return "";
  });
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

  const filteredCardTypes = (cardTypes ?? []).filter(
    (ct) => ct.name.toLowerCase() !== "graded"
  );

  const parallelHasNumber = parallel.includes("/");

  const handleImageUpload = async (side: "front" | "back", file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${card.id}/${side}.${ext}`;
    await supabase.storage.from("card-images").upload(path, file, { upsert: true });
    const { data: urlData } = supabase.storage.from("card-images").getPublicUrl(path);
    const url = urlData.publicUrl;
    const col = side === "front" ? "image_front_url" : "image_back_url";
    await supabase.from("cards").update({ [col]: url } as any).eq("id", card.id);
    setUploading(false);
    onSaved();
  };

  const handleSave = async () => {
    setSaving(true);
    let copyNumber: string | null = null;
    let printRun: string | null = null;
    if (parallelHasNumber && stampedNumber) {
      const parts = stampedNumber.split("/");
      copyNumber = parts[0]?.trim() || null;
      printRun = parts[1]?.trim() || null;
    }
    await supabase.from("cards").update({
      year,
      set_name: setName,
      card_number: cardNumber || null,
      card_name: cardName || null,
      parallel,
      card_type: cardType,
      status,
      copy_number: copyNumber,
      print_run: printRun,
      notes: notes || null,
    }).eq("id", card.id);
    setSaving(false);
    onSaved();
    onClose();
  };

  const inputClass =
    "w-full px-3 py-2 rounded-md border border-border bg-background text-[13px] focus:outline-none focus:ring-1 focus:ring-foreground/20";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-card max-h-[85vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-medium">Edit card</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-5">
            <div className="grid grid-cols-2 gap-4">
              <ImageUploadZone
                label="Front image"
                currentUrl={card.image_front_url}
                onFileSelected={(f) => handleImageUpload("front", f)}
              />
              <ImageUploadZone
                label="Back image"
                currentUrl={card.image_back_url}
                onFileSelected={(f) => handleImageUpload("back", f)}
              />
            </div>
            {uploading && (
              <div className="text-[11px] text-muted-foreground">Uploading…</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Set</label>
                <select value={setName} onChange={(e) => setSetName(e.target.value)} className={inputClass}>
                  {(sets ?? []).map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Year</label>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Card name</label>
                <input value={cardName} onChange={(e) => setCardName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Card number</label>
                <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Parallel</label>
                <select value={parallel} onChange={(e) => setParallel(e.target.value)} className={inputClass}>
                  {(parallels ?? []).map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Card type</label>
                <select value={cardType} onChange={(e) => setCardType(e.target.value)} className={inputClass}>
                  {filteredCardTypes.map((ct) => (
                    <option key={ct.id} value={ct.name}>{ct.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {parallelHasNumber && (
              <div>
                <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Stamped number</label>
                <input
                  value={stampedNumber}
                  onChange={(e) => setStampedNumber(e.target.value)}
                  placeholder="e.g. 14/50"
                  className={inputClass + " max-w-[160px]"}
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="owned">Owned</option>
                <option value="purchased">Purchased</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground mb-1.5 block">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass + " resize-none"}
                rows={2}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-1 px-4 py-2.5 rounded-md text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: person.color_hex,
                color: isLightColor(person.color_hex) ? "#1a1a1a" : "#ffffff",
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
