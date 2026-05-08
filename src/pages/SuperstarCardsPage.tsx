import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronLeft,
  Grid3X3,
  LayoutGrid,
  ChevronLeftIcon,
  ChevronRightIcon,
  Plus,
  X,
  Upload,
  Pencil,
} from "lucide-react";
import { useState, useRef } from "react";

type ViewMode = "binder" | "grid";

const STATUS_OPTIONS = ["Purchased", "Arrived", "Stored", "Wishlist"];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i));

// ─── Add Card Modal ───────────────────────────────────────────────────────────

function AddCardModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    card_name: "",
    group: "",
    member: "",
    set: "",
    year: String(CURRENT_YEAR),
    status: "Stored",
    notes: "",
  });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(url);
    } else {
      setBackFile(file);
      setBackPreview(url);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from("card-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("card-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let image_front: string | null = null;
      let image_back: string | null = null;
      if (frontFile) {
        image_front = await uploadImage(
          frontFile,
          `superstars/${Date.now()}-front-${frontFile.name}`
        );
      }
      if (backFile) {
        image_back = await uploadImage(
          backFile,
          `superstars/${Date.now()}-back-${backFile.name}`
        );
      }
      const { error } = await supabase.from("superstar_cards").insert({
        card_name: form.card_name || null,
        group: form.group || null,
        member: form.member || null,
        set: form.set || null,
        year: form.year || null,
        status: form.status,
        notes: form.notes || null,
        image_front,
        image_back,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["superstar-cards"] });
      onClose();
    } catch (err) {
      console.error("Failed to save card:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-[16px] font-semibold text-foreground">Add Card</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            {(["front", "back"] as const).map((side) => {
              const preview = side === "front" ? frontPreview : backPreview;
              const inputRef = side === "front" ? frontInputRef : backInputRef;
              return (
                <div key={side}>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                    {side === "front" ? "Front" : "Back"}
                  </label>
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-border hover:border-foreground/30 transition-colors cursor-pointer bg-secondary flex items-center justify-center overflow-hidden relative"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt={side}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload size={20} />
                        <span className="text-[11px]">Upload image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, side)}
                  />
                </div>
              );
            })}
          </div>

          {/* Card Name */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Card Name
            </label>
            <input
              type="text"
              value={form.card_name}
              onChange={(e) => setForm((f) => ({ ...f, card_name: e.target.value }))}
              placeholder="e.g. Bang Chan"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
          </div>

          {/* Group + Member */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Group
              </label>
              <input
                type="text"
                value={form.group}
                onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                placeholder="e.g. Stray Kids"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Member
              </label>
              <input
                type="text"
                value={form.member}
                onChange={(e) => setForm((f) => ({ ...f, member: e.target.value }))}
                placeholder="e.g. Chan"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
            </div>
          </div>

          {/* Set + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Set
              </label>
              <input
                type="text"
                value={form.set}
                onChange={(e) => setForm((f) => ({ ...f, set: e.target.value }))}
                placeholder="e.g. SuperStar SKZ S1"
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Year
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Status
            </label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors
                    ${form.status === s
                      ? "bg-foreground text-background border-foreground"
                      : "bg-secondary text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Anything worth remembering..."
              rows={3}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border sticky bottom-0 bg-background">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card Detail / Edit Modal ─────────────────────────────────────────────────

function CardDetailModal({
  card,
  onClose,
}: {
  card: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [imageView, setImageView] = useState<"front" | "back">("front");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    card_name: card.card_name ?? "",
    group: card.group ?? "",
    member: card.member ?? "",
    set: card.set ?? "",
    year: card.year ?? String(CURRENT_YEAR),
    status: card.status ?? "Stored",
    notes: card.notes ?? "",
  });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(card.image_front ?? null);
  const [backPreview, setBackPreview] = useState<string | null>(card.image_back ?? null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") { setFrontFile(file); setFrontPreview(url); }
    else { setBackFile(file); setBackPreview(url); }
  };

  const uploadImage = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from("card-images")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("card-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let image_front = card.image_front ?? null;
      let image_back = card.image_back ?? null;
      if (frontFile) {
        image_front = await uploadImage(frontFile, `superstars/${Date.now()}-front-${frontFile.name}`);
      }
      if (backFile) {
        image_back = await uploadImage(backFile, `superstars/${Date.now()}-back-${backFile.name}`);
      }
      const { error } = await supabase.from("superstar_cards").update({
        card_name: form.card_name || null,
        group: form.group || null,
        member: form.member || null,
        set: form.set || null,
        year: form.year || null,
        status: form.status,
        notes: form.notes || null,
        image_front,
        image_back,
      }).eq("id", card.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["superstar-cards"] });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update card:", err);
    } finally {
      setSaving(false);
    }
  };

  const currentImage = imageView === "front" ? frontPreview : backPreview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-[16px] font-semibold text-foreground">
            {editing ? "Edit Card" : (card.card_name ?? "Card Detail")}
          </h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            // ── Edit Mode ────────────────────────────────────────────────
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {(["front", "back"] as const).map((side) => {
                  const preview = side === "front" ? frontPreview : backPreview;
                  const inputRef = side === "front" ? frontInputRef : backInputRef;
                  return (
                    <div key={side}>
                      <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                        {side === "front" ? "Front" : "Back"}
                      </label>
                      <div
                        onClick={() => inputRef.current?.click()}
                        className="aspect-[2.5/3.5] rounded-lg border-2 border-dashed border-border hover:border-foreground/30 transition-colors cursor-pointer bg-secondary flex items-center justify-center overflow-hidden relative"
                      >
                        {preview ? (
                          <img src={preview} alt={side} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload size={20} />
                            <span className="text-[11px]">Upload image</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, side)}
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Card Name</label>
                <input
                  type="text"
                  value={form.card_name}
                  onChange={(e) => setForm((f) => ({ ...f, card_name: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Group</label>
                  <input
                    type="text"
                    value={form.group}
                    onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Member</label>
                  <input
                    type="text"
                    value={form.member}
                    onChange={(e) => setForm((f) => ({ ...f, member: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Set</label>
                  <input
                    type="text"
                    value={form.set}
                    onChange={(e) => setForm((f) => ({ ...f, set: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors
                        ${form.status === s
                          ? "bg-foreground text-background border-foreground"
                          : "bg-secondary text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            // ── View Mode ─────────────────────────────────────────────────
            <div className="flex gap-8">
              <div className="w-64 flex-shrink-0">
                <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-secondary relative">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={card.card_name ?? "Card"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {(["front", "back"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setImageView(side)}
                      className={`flex-1 py-1.5 rounded-md text-[12px] font-medium border transition-colors
                        ${imageView === side
                          ? "bg-foreground text-background border-foreground"
                          : "bg-secondary text-muted-foreground border-border hover:border-foreground/30"
                        }`}
                    >
                      {side.charAt(0).toUpperCase() + side.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-[22px] font-semibold text-foreground leading-tight">
                  {card.card_name ?? "—"}
                </h3>
                <div className="space-y-3">
                  {card.group && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Group</span>
                      <p className="text-[14px] text-foreground mt-0.5">{card.group}</p>
                    </div>
                  )}
                  {card.member && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Member</span>
                      <p className="text-[14px] text-foreground mt-0.5">{card.member}</p>
                    </div>
                  )}
                  {card.set && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Set</span>
                      <p className="text-[14px] text-foreground mt-0.5">{card.set}</p>
                    </div>
                  )}
                  {card.year && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Year</span>
                      <p className="text-[14px] text-foreground mt-0.5">{card.year}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Status</span>
                    <p className="text-[14px] text-foreground mt-0.5">{card.status}</p>
                  </div>
                  {card.notes && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Notes</span>
                      <p className="text-[14px] text-foreground mt-0.5 leading-relaxed">{card.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SuperstarCardsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const { data: cards } = useQuery({
    queryKey: ["superstar-cards"],
    queryFn: async () => {
      const { data } = await supabase
        .from("superstar_cards")
        .select("*")
        .order("sort_order");
      return data ?? [];
    },
  });

  const viewButtons = [
    { mode: "binder" as ViewMode, icon: Grid3X3, label: "Binder" },
    { mode: "grid" as ViewMode, icon: LayoutGrid, label: "Grid" },
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
          onClick={() => navigate("/kpop/groups")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          K-Pop
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-page-title text-foreground">Superstars</h1>
            <p className="text-body text-muted-foreground mt-1">
              {cards?.length ?? 0} card{cards?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary rounded-md p-0.5">
              {viewButtons.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors
                    ${viewMode === mode
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-foreground text-background hover:opacity-80 transition-opacity"
            >
              <Plus size={13} />
              Add Card
            </button>
          </div>
        </div>

        {(cards ?? []).length === 0 ? (
          <div className="text-body text-muted-foreground py-12 text-center">
            No cards yet.
          </div>
        ) : viewMode === "binder" ? (
          <SuperstarBinderView cards={cards ?? []} onCardClick={setSelectedCard} />
        ) : (
          <SuperstarGridView cards={cards ?? []} onCardClick={setSelectedCard} />
        )}
      </div>

      {showAddCard && (
        <AddCardModal onClose={() => setShowAddCard(false)} />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

// ─── Binder View ──────────────────────────────────────────────────────────────

function SuperstarBinderView({
  cards,
  onCardClick,
}: {
  cards: any[];
  onCardClick: (card: any) => void;
}) {
  const [page, setPage] = useState(0);
  const slotsPerSpread = 18;
  const totalSpreads = Math.max(1, Math.ceil(cards.length / slotsPerSpread));
  const start = page * slotsPerSpread;
  const leftCards = cards.slice(start, start + 9);
  const rightCards = cards.slice(start + 9, start + 18);

  const renderSlot = (card: any | undefined, idx: number) => {
    if (!card) {
      return (
        <div
          key={`empty-${idx}`}
          className="aspect-[2.5/3.5] rounded-lg bg-secondary"
        />
      );
    }
    return (
      <div
        key={card.id}
        onClick={() => onCardClick(card)}
        className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-foreground/20 transition-all"
      >
        {card.image_front ? (
          <img
            src={card.image_front}
            alt={card.card_name ?? ""}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-[11px] text-muted-foreground">No Image</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex gap-6">
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(leftCards[i], i))}
          </div>
        </div>
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(rightCards[i], i + 9))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <span className="text-[12px] text-muted-foreground">
          {page + 1} / {totalSpreads}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalSpreads - 1, p + 1))}
          disabled={page >= totalSpreads - 1}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Grid View ────────────────────────────────────────────────────────────────

function SuperstarGridView({
  cards,
  onCardClick,
}: {
  cards: any[];
  onCardClick: (card: any) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-5 px-5">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onCardClick(card)}
          className="flex flex-col cursor-pointer group"
        >
          <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative bg-secondary group-hover:ring-2 group-hover:ring-foreground/20 transition-all">
            {card.image_front ? (
              <img
                src={card.image_front}
                alt={card.card_name ?? ""}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[13px] font-medium text-foreground truncate">
            {card.card_name}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {[card.member, card.group].filter(Boolean).join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}
