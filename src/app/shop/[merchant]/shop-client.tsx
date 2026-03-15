"use client";

import { useState, useRef, useEffect } from "react";
import type { MerchantData, MerchantProduct } from "./page";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Eye, Scan, Star, ExternalLink, ArrowRight } from "lucide-react";

function ModelViewerCard({
  product,
  primaryColor,
}: {
  product: MerchantProduct;
  primaryColor: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
    }

    const viewer = document.createElement("model-viewer") as HTMLElement;
    viewer.setAttribute("src", product.glbUrl);
    viewer.setAttribute("alt", product.name);
    viewer.setAttribute("style", "width:100%;height:100%");
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("interaction-prompt", "none");

    container.appendChild(viewer);
    return () => {
      if (container.contains(viewer)) container.removeChild(viewer);
    };
  }, [product.glbUrl, product.name]);

  // Build AR viewer URL — works both SSR-safe and on client
  const viewerUrl = `/v/${product.id}?ar=true`;

  return (
    <div
      className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square bg-muted">
        <div ref={containerRef} className="w-full h-full" />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-3 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <a
            href={viewerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Voir en AR
          </a>
        </div>

        <Badge className="absolute top-2 right-2 bg-white/90 text-black text-[10px]">
          {product.category}
        </Badge>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm">{product.name}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.scanCount.toLocaleString("fr-FR")} vues AR
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            {product.qualityScore}/100
          </span>
        </div>
        <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
          <button
            className="w-full rounded-lg py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Scan className="h-4 w-4" />
            Visualiser en AR
            <ArrowRight className="h-4 w-4" />
          </button>
        </a>
      </div>
    </div>
  );
}

export default function ShopClient({
  data,
  merchantSlug,
}: {
  data: MerchantData;
  merchantSlug: string;
}) {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [shopUrl, setShopUrl] = useState("");

  // Derive categories from products
  const categories = [
    "Tous",
    ...Array.from(new Set(data.products.map((p) => p.category))),
  ];

  const filtered =
    activeCategory === "Tous"
      ? data.products
      : data.products.filter((p) => p.category === activeCategory);

  const totalScans = data.products.reduce((acc, p) => acc + p.scanCount, 0);

  // Set shopUrl on client only (avoids SSR mismatch)
  useEffect(() => {
    setShopUrl(window.location.href);
  }, []);

  // Silence unused-var warning — merchantSlug is available for future API use
  void merchantSlug;

  return (
    <div className="min-h-screen bg-background">
      {/* Store header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: data.primaryColor }}
              >
                {data.name[0]}
              </div>
              <h1 className="text-2xl font-bold">{data.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-lg">
              {data.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {totalScans.toLocaleString("fr-FR")} vues AR
              </span>
              <span>{data.products.length} produit{data.products.length > 1 ? "s" : ""} 3D</span>
            </div>
          </div>

          {shopUrl && (
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="bg-white p-3 rounded-xl border">
                <QRCodeSVG value={shopUrl} size={100} level="H" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scanner pour visiter
                <br />
                le showroom
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? "text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              style={
                activeCategory === cat
                  ? { backgroundColor: data.primaryColor, borderColor: data.primaryColor }
                  : {}
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ModelViewerCard
              key={product.id}
              product={product}
              primaryColor={data.primaryColor}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Aucun produit dans cette catégorie.
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showroom 3D propulsé par{" "}
            <a
              href="https://arshot.fr"
              className="text-[#0066FF] font-medium hover:underline"
            >
              ARShot
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
