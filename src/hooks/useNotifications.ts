import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getProducts } from "@/lib/api";
import type { ARModel } from "@/types";

export interface Notification {
  id: string;
  type: "model_ready" | "model_failed";
  productName: string;
  productId: string;
  timestamp: string;
  read: boolean;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevStatusRef = useRef<Record<string, string>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const checkProducts = async () => {
      try {
        const products = await getProducts();
        const prevStatus = prevStatusRef.current;

        // First call: just record statuses without triggering notifications
        if (!initialized.current) {
          products.forEach((p: ARModel) => {
            prevStatus[p.id] = p.status;
          });
          initialized.current = true;
          return;
        }

        const newNotifs: Notification[] = [];

        products.forEach((p: ARModel) => {
          const prev = prevStatus[p.id];
          if (prev && prev !== p.status) {
            if (p.status === "ready") {
              const notif: Notification = {
                id: `${p.id}-${Date.now()}`,
                type: "model_ready",
                productName: p.name,
                productId: p.id,
                timestamp: new Date().toISOString(),
                read: false,
              };
              newNotifs.push(notif);
              toast.success(`"${p.name}" est prêt !`, {
                description: "Votre modèle 3D est disponible",
                duration: 5000,
              });
            } else if (p.status === "failed") {
              const notif: Notification = {
                id: `${p.id}-${Date.now()}`,
                type: "model_failed",
                productName: p.name,
                productId: p.id,
                timestamp: new Date().toISOString(),
                read: false,
              };
              newNotifs.push(notif);
              toast.error(`"${p.name}" — génération échouée`, {
                duration: 5000,
              });
            }
          }
          prevStatus[p.id] = p.status;
        });

        if (newNotifs.length > 0) {
          setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
          setUnreadCount((c) => c + newNotifs.length);
        }
      } catch {
        // Silently fail — don't surface polling errors to the user
      }
    };

    // Poll every 30 seconds
    checkProducts();
    const interval = setInterval(checkProducts, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAllRead };
}
