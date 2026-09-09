"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export function TrendBadge() {
  const t = useTranslations("studio");

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Flame className="h-3.5 w-3.5" />
      {t("trending")}
    </motion.div>
  );
}
