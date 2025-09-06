"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExpenseForm } from "@/components/tallysheet/ExpenseForm";
import { ExpenseList } from "@/components/tallysheet/ExpenseList";
import { TotalDisplay } from "@/components/tallysheet/TotalDisplay";
import type { Expense } from "@/components/tallysheet/types";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const total = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const addExpense = (newExpense: Omit<Expense, "id">) => {
    setExpenses((prevExpenses) => [
      { ...newExpense, id: Date.now() },
      ...prevExpenses,
    ]);
  };

  const clearExpenses = () => {
    setExpenses([]);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">TallySheet</CardTitle>
          <CardDescription>
            A simple, single-session expense tracker. Your data is not saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm onAddExpense={addExpense} />
          <ExpenseList expenses={expenses} />
          {expenses.length > 0 && <TotalDisplay total={total} onClear={clearExpenses} />}
        </CardContent>
      </Card>
    </main>
  );
}
