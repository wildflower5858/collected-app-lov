import { useNavigate, useParams } from "react-router-dom";
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

const CARD_TYPES = [
  "Album",
  "Broadcast",
  "Collab",
  "Concert",
  "Fanmeeting",
  "Fansign",
  "Lucky Draw",
  "Merch",
  "POB",
];

const STATUS_OPTIONS = ["Purchased", "Arrived", "Stored", "Wishlist"];

// ─── Add Card Modal ───────────────────────────────────────────────────────────

function AddCardModal({
  binderId,
  groupId,
  onClose,
}: {
  binderId: number;
  groupId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    album_id: "",
    event_id: "",
    store_id: "",
    card_types: [] as string[],
    status: "Stored",
    notes: "",
  });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: albums } = useQuery({
    queryKey: ["albums", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("albums")
        .select("id, name")
        .eq("group_id", groupId)
        .order("name");
      return data ?? [];
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("events")
        .select("id, name")
        .eq("group_id", groupId)
        .order("name");
      return data ?? [];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores", groupId],
    queryFn: async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, name")
        .eq("group_id", groupId)
        .order("name");
      return data ?? [];
    },
  });

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

  const toggleType = (type: string) => {
    setForm((f) => ({
      ...f,
      card_types: f.card_types.includes(type)
        ? f.card_types.filter((t) => t !== type)
        : [...f.card_types, type],
    }));
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
          `kpop/${binderId}/${Date.now()}-front-${frontFile.name}`
        );
      }
      if (backFile) {
        image_back = await uploadImage(
          backFile,
          `kpop/${binderId}/${Date.now()}-back-${backFile.name}`
        );
      }
      const { error } = await supabase.from("kpop_cards").insert({
        binder_id: binderId,
        name: form.name || null,
        album_id: form.album_id ? Number(form.album_id) : null,
        event_id: form.event_id ? Number(form.event_id) : null,
        store_id: form.store_id ? Number(form.store_id) : null,
        card_types: form.card_types,
        status: form.status,
        notes: form.notes || null,
        image_front,
        image_back,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["kpop-cards", binderId] });
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
          {/* Image Upload */}
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
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Bang Chan"
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30"
            />
          </div>

          {/* Album */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Album
            </label>
            <select
              value={form.album_id}
              onChange={(e) => setForm((f) => ({ ...f, album_id: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
            >
              <option value="">— None —</option>
              {albums?.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Event */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Event
            </label>
            <select
              value={form.event_id}
              onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
            >
              <option value="">— None —</option>
              {events?.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          {/* Store */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Store
            </label>
            <select
              value={form.store_id}
              onChange={(e) => setForm((f) => ({ ...f, store_id: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
            >
              <option value="">— None —</option>
              {stores?.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Card Types */}
          <div>
            <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CARD_TYPES.map((type) => {
                const selected = form.card_types.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors
                      ${selected
                        ? "bg-foreground text-background border-foreground"
                        : "bg-secondary text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
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
  groupId,
  binderId,
  onClose,
}: {
  card: any;
  groupId: number;
  binderId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [imageView, setImageView] = useState<"front" | "back">("front");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: card.name ?? "",
    album_id: card.album_id ? String(card.album_id) : "",
    event_id: card.event_id ? String(card.event_id) : "",
    store_id: card.store_id ? String(card.store_id) : "",
    card_types: (card.card_types ?? []) as string[],
    status: card.status ?? "Stored",
    notes: card.notes ?? "",
  });

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(card.image_front ?? null);
  const [backPreview, setBackPreview] = useState<string | null>(card.image_back ?? null);

  const { data: albums } = useQuery({
    queryKey: ["albums", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("albums").select("id, name").eq("group_id", groupId).order("name");
      return data ?? [];
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, name").eq("group_id", groupId).order("name");
      return data ?? [];
    },
  });

  const { data: stores } = useQuery({
    queryKey: ["stores", groupId],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("id, name").eq("group_id", groupId).order("name");
      return data ?? [];
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") { setFrontFile(file); setFrontPreview(url); }
    else { setBackFile(file); setBackPreview(url); }
  };

  const toggleType = (type: string) => {
    setForm((f) => ({
      ...f,
      card_types: f.card_types.includes(type)
        ? f.card_types.filter((t) => t !== type)
        : [...f.card_types, type],
    }));
  };

  const uploadImage = async (file: File, path: string) => {
    const { error } = await supabase.storage.from("card-images").upload(path, file, { upsert: true });
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
        image_front = await uploadImage(frontFile, `kpop/${binderId}/${Date.now()}-front-${frontFile.name}`);
      }
      if (backFile) {
        image_back = await uploadImage(backFile, `kpop/${binderId}/${Date.now()}-back-${backFile.name}`);
      }
      const { error } = await supabase.from("kpop_cards").update({
        name: form.name || null,
        album_id: form.album_id ? Number(form.album_id) : null,
        event_id: form.event_id ? Number(form.event_id) : null,
        store_id: form.store_id ? Number(form.store_id) : null,
        card_types: form.card_types,
        status: form.status,
        notes: form.notes || null,
        image_front,
        image_back,
      }).eq("id", card.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["kpop-cards", binderId] });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update card:", err);
    } finally {
      setSaving(false);
    }
  };

  const albumName = albums?.find((a) => a.id === card.album_id)?.name ?? null;
  const eventName = events?.find((e) => e.id === card.event_id)?.name ?? null;
  const storeName = stores?.find((s) => s.id === card.store_id)?.name ?? null;

  const currentImage = imageView === "front" ? frontPreview : backPreview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-[16px] font-semibold text-foreground">
            {editing ? "Edit Card" : (card.name ?? "Card Detail")}
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
            // ── Edit Mode ──────────────────────────────────────────────────
            <div className="space-y-5">
              {/* Image Upload */}
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

              {/* Card Name */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Card Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                />
              </div>

              {/* Album */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Album</label>
                <select
                  value={form.album_id}
                  onChange={(e) => setForm((f) => ({ ...f, album_id: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                >
                  <option value="">— None —</option>
                  {albums?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {/* Event */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Event</label>
                <select
                  value={form.event_id}
                  onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                >
                  <option value="">— None —</option>
                  {events?.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>

              {/* Store */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Store</label>
                <select
                  value={form.store_id}
                  onChange={(e) => setForm((f) => ({ ...f, store_id: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30"
                >
                  <option value="">— None —</option>
                  {stores?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Card Types */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Type</label>
                <div className="flex flex-wrap gap-2">
                  {CARD_TYPES.map((type) => {
                    const selected = form.card_types.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors
                          ${selected
                            ? "bg-foreground text-background border-foreground"
                            : "bg-secondary text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                          }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
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

              {/* Notes */}
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground/30 resize-none"
                />
              </div>

              {/* Edit Actions */}
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
            // ── View Mode ──────────────────────────────────────────────────
            <div className="flex gap-8">
              {/* Left: Image */}
              <div className="w-64 flex-shrink-0">
                <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden bg-secondary relative">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={card.name ?? "Card"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] text-muted-foreground">No Image</span>
                    </div>
                  )}
                </div>
                {/* Front / Back Toggle */}
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

              {/* Right: Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-[22px] font-semibold text-foreground leading-tight">
                    {card.name ?? "—"}
                  </h3>
                </div>

                <div className="space-y-3">
                  {albumName && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Album</span>
                      <p className="text-[14px] text-foreground mt-0.5">{albumName}</p>
                    </div>
                  )}
                  {eventName && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Event</span>
                      <p className="text-[14px] text-foreground mt-0.5">{eventName}</p>
                    </div>
                  )}
                  {storeName && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Store</span>
                      <p className="text-[14px] text-foreground mt-0.5">{storeName}</p>
                    </div>
                  )}
                  {card.card_types?.length > 0 && (
                    <div>
                      <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Type</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {card.card_types.map((t: string) => (
                          <span
                            key={t}
                            className="px-2.5 py-0.5 rounded-full bg-secondary text-[12px] text-foreground border border-border"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
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

export default function KpopCardsPage() {
  const { binderId } = useParams<{ binderId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);

  const binderIdNum = Number(binderId);

  const { data: binder } = useQuery({
    queryKey: ["kpop-binder", binderIdNum],
    queryFn: async () => {
      const { data } = await supabase
        .from("binders")
        .select("*, groups(name, id)")
        .eq("id", binderIdNum)
        .single();
      return data;
    },
  });

  const { data: cards } = useQuery({
    queryKey: ["kpop-cards", binderIdNum],
    queryFn: async () => {
      const { data } = await supabase
        .from("kpop_cards")
        .select("*")
        .eq("binder_id", binderIdNum)
        .order("sort_order");
      return data ?? [];
    },
  });

  const groupId = binder?.group_id ? Number(binder.group_id) : 0;

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
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          {binder?.groups?.name ?? "K-Pop"}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-page-title text-foreground">{binder?.name ?? ""}</h1>
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
          <KpopBinderView cards={cards ?? []} onCardClick={setSelectedCard} />
        ) : (
          <KpopGridView cards={cards ?? []} onCardClick={setSelectedCard} />
        )}
      </div>

      {showAddCard && binder && (
        <AddCardModal
          binderId={binderIdNum}
          groupId={groupId}
          onClose={() => setShowAddCard(false)}
        />
      )}

      {selectedCard && binder && (
        <CardDetailModal
          card={selectedCard}
          groupId={groupId}
          binderId={binderIdNum}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

// ─── Binder View ──────────────────────────────────────────────────────────────

function KpopBinderView({
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
            alt={card.name ?? ""}
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

function KpopGridView({
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
                alt={card.name ?? ""}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[13px] font-medium text-foreground truncate">
            {card.name}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {card.card_types?.join(", ")}
          </div>
        </div>
      ))}
    </div>
  );
}
