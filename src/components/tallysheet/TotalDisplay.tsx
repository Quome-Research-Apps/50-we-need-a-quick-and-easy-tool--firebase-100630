"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TotalDisplayProps {
  total: number;
  onClear: () => void;
}

export function TotalDisplay({ total, onClear }: TotalDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only animate on updates, not on initial render.
    if (total > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [total]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="flex items-center justify-between w-full mt-6 pt-6 border-t">
      <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground hover:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Clear All
      </Button>
      <div className="text-right">
        <span className="text-sm text-muted-foreground">Total</span>
        <p 
          className={cn(
            "text-3xl font-bold transition-transform duration-300 ease-out",
            isAnimating ? "scale-110" : "scale-100"
          )}
          style={{ color: 'hsl(var(--accent))' }}
        >
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  );
}
