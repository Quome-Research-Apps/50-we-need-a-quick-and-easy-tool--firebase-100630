"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { suggestExpenseCategories } from "@/ai/flows/suggest-expense-categories";
import type { Expense } from "./types";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const formSchema = z.object({
  description: z.string().min(1, { message: "Description is required." }),
  amount: z.coerce
    .number({ invalid_type_error: "Please enter a valid amount." })
    .positive({ message: "Amount must be positive." }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, startSuggestionTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
    },
  });

  const descriptionValue = form.watch("description");
  const debouncedDescription = useDebounce(descriptionValue, 500);

  const getSuggestions = useCallback(async (description: string) => {
    if (description.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    startSuggestionTransition(async () => {
      try {
        const result = await suggestExpenseCategories({ description });
        setSuggestions(result.categories);
      } catch (error) {
        console.error("Failed to get suggestions:", error);
        setSuggestions([]);
      }
    });
  }, []);

  useEffect(() => {
    getSuggestions(debouncedDescription);
  }, [debouncedDescription, getSuggestions]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    startTransition(() => {
      onAddExpense(data);
      form.reset();
      setSuggestions([]);
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('description', suggestion, { shouldValidate: true });
    form.setFocus('amount');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee with friends" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {(isSuggesting || suggestions.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground pt-1">
                <Sparkles className="h-4 w-4 shrink-0" />
                {isSuggesting && <span>Thinking...</span>}
                {!isSuggesting && suggestions.length > 0 && <span>Suggestions:</span>}
                <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/10" onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </Badge>
                    ))}
                </div>
            </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
