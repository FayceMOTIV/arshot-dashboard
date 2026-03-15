"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Mail, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

interface ShareTarget {
  name: string;
  icon: React.ElementType;
  color: string;
  href: string;
  openInTab: boolean;
}

export function SocialShare({ url, title, description = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(
    description || `Découvrez ${title} en réalité augmentée`
  );

  const shareTargets: ShareTarget[] = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "#25D366",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      openInTab: true,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      openInTab: true,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      openInTab: true,
    },
    {
      name: "Email",
      icon: Mail,
      color: "#6B7280",
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      openInTab: false,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {shareTargets.map(({ name, icon: Icon, color, href, openInTab }) => (
        <a
          key={name}
          href={href}
          target={openInTab ? "_blank" : undefined}
          rel={openInTab ? "noopener noreferrer" : undefined}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-all hover:shadow-sm hover:-translate-y-0.5 bg-background"
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          {name}
        </a>
      ))}

      <button
        onClick={copyLink}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-all hover:shadow-sm hover:-translate-y-0.5 bg-background"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copié !" : "Copier"}
      </button>
    </div>
  );
}
