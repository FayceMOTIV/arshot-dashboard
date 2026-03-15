"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, Star, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface PhotoGalleryProps {
  productId: string;
  thumbnailUrl?: string | null;
}

interface StoredPhoto {
  url: string; // object URL or data URL
  name: string;
  isPrimary: boolean;
}

const SESSION_KEY = (id: string) => `arshot_photos_${id}`;

export function PhotoGallery({ productId, thumbnailUrl }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY(productId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredPhoto[];
        setPhotos(parsed);
        return;
      } catch { /* ignore */ }
    }
    // Default: use thumbnailUrl if available
    if (thumbnailUrl) {
      setPhotos([{ url: thumbnailUrl, name: "Aperçu principal", isPrimary: true }]);
    }
  }, [productId, thumbnailUrl]);

  const saveToSession = useCallback((newPhotos: StoredPhoto[]) => {
    try {
      sessionStorage.setItem(SESSION_KEY(productId), JSON.stringify(newPhotos));
    } catch { /* quota exceeded, ignore */ }
  }, [productId]);

  const addPhotos = useCallback((files: File[]) => {
    const MAX = 5;
    const remaining = MAX - photos.length;
    if (remaining <= 0) {
      toast.error("Maximum 5 photos atteint");
      return;
    }
    const valid = files
      .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
      .slice(0, remaining);
    if (valid.length === 0) return;

    const newPhotos: StoredPhoto[] = valid.map((f, i) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      isPrimary: photos.length === 0 && i === 0,
    }));

    const updated = [...photos, ...newPhotos];
    setPhotos(updated);
    saveToSession(updated);
    toast.success(`${valid.length} photo${valid.length > 1 ? "s" : ""} ajoutée${valid.length > 1 ? "s" : ""}`);
  }, [photos, saveToSession]);

  const removePhoto = useCallback((index: number) => {
    const updated = photos
      .filter((_, i) => i !== index)
      .map((p, i) => ({ ...p, isPrimary: i === 0 }));
    setPhotos(updated);
    saveToSession(updated);
    setSelectedIndex((prev) => Math.max(0, prev >= updated.length ? updated.length - 1 : prev));
  }, [photos, saveToSession]);

  const setPrimary = useCallback((index: number) => {
    const simple = [...photos];
    const [item] = simple.splice(index, 1);
    simple.unshift(item);
    const final = simple.map((p, i) => ({ ...p, isPrimary: i === 0 }));
    setPhotos(final);
    saveToSession(final);
    setSelectedIndex(0);
    toast.success("Photo principale définie");
  }, [photos, saveToSession]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addPhotos(Array.from(e.dataTransfer.files));
  }, [addPhotos]);

  if (photos.length === 0 && !showUpload) {
    return (
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          Plus de photos = meilleure qualité 3D
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-[#0066FF] hover:text-[#0052CC]"
          onClick={() => setShowUpload(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter des photos
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-3">
      {/* Selected photo preview */}
      {photos.length > 0 && (
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-muted">
          <img
            src={photos[selectedIndex]?.url}
            alt={photos[selectedIndex]?.name || "Photo produit"}
            className="w-full h-full object-contain"
          />
          {photos[selectedIndex]?.isPrimary && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-[#0066FF] px-2 py-1 text-[10px] font-bold text-white">
              <Star className="h-3 w-3" />
              Principale
            </div>
          )}
          {photos.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setSelectedIndex((i) => (i - 1 + photos.length) % photos.length)}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setSelectedIndex((i) => (i + 1) % photos.length)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === selectedIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                    onClick={() => setSelectedIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Thumbnail strip */}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <div key={i} className="relative shrink-0 group">
              <button
                className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === selectedIndex ? "border-[#0066FF]" : "border-transparent hover:border-[#0066FF]/40"
                }`}
                onClick={() => setSelectedIndex(i)}
              >
                <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
              </button>
              {photo.isPrimary && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0066FF] flex items-center justify-center">
                  <Star className="h-2.5 w-2.5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center gap-1 pb-1">
                {!photo.isPrimary && (
                  <button
                    className="h-5 w-5 rounded bg-[#0066FF]/90 text-white flex items-center justify-center"
                    title="Définir comme principale"
                    onClick={(e) => { e.stopPropagation(); setPrimary(i); }}
                  >
                    <Star className="h-3 w-3" />
                  </button>
                )}
                <button
                  className="h-5 w-5 rounded bg-red-500/90 text-white flex items-center justify-center"
                  title="Supprimer"
                  onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add slot */}
          {photos.length < 5 && (
            <button
              className="h-16 w-16 shrink-0 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-[#0066FF]/40 hover:text-[#0066FF] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-5 w-5" />
              <span className="text-[9px] mt-0.5">{photos.length}/5</span>
            </button>
          )}
        </div>
      )}

      {/* Upload zone (when showUpload and no photos) */}
      {showUpload && photos.length === 0 && (
        <div
          className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 p-6 cursor-pointer hover:border-[#0066FF]/60 hover:bg-[#0066FF]/5 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Glissez vos photos ou cliquez pour parcourir
          </p>
          <p className="text-xs text-muted-foreground">JPG, PNG · Max 10 MB · Max 5 photos</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) addPhotos(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      {/* Tip */}
      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Star className="h-3 w-3 text-[#0066FF]" />
        Conseil : La photo principale est envoyée à l&apos;IA pour la génération 3D. Plus de vues = meilleure qualité.
      </p>
    </div>
  );
}
