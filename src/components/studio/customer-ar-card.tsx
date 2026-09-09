"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Globe } from "lucide-react";
import type { CustomerARCapture } from "@/types";

interface CustomerARCardProps {
  capture: CustomerARCapture;
}

export function CustomerARCard({ capture }: CustomerARCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted">
          {capture.imageUrl ? (
            <img
              src={capture.imageUrl}
              alt="AR Capture"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Smartphone className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            {capture.country || "Unknown"}
          </div>
          <Badge variant="secondary" className="text-xs">
            {capture.device}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
