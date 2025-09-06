'use server';

/**
 * @fileOverview Expense category suggestion flow.
 *
 * This file defines a Genkit flow that suggests possible spending categories based on a user-provided expense description.
 * It exports:
 * - `suggestExpenseCategories`: The main function to call to get expense category suggestions.
 * - `SuggestExpenseCategoriesInput`: The input type for the `suggestExpenseCategories` function.
 * - `SuggestExpenseCategoriesOutput`: The output type for the `suggestExpenseCategories` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoriesInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the expense provided by the user.'),
});
export type SuggestExpenseCategoriesInput = z.infer<
  typeof SuggestExpenseCategoriesInputSchema
>;

const SuggestExpenseCategoriesOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('An array of suggested expense categories.'),
});
export type SuggestExpenseCategoriesOutput = z.infer<
  typeof SuggestExpenseCategoriesOutputSchema
>;

export async function suggestExpenseCategories(
  input: SuggestExpenseCategoriesInput
): Promise<SuggestExpenseCategoriesOutput> {
  return suggestExpenseCategoriesFlow(input);
}

const suggestExpenseCategoriesPrompt = ai.definePrompt({
  name: 'suggestExpenseCategoriesPrompt',
  input: {schema: SuggestExpenseCategoriesInputSchema},
  output: {schema: SuggestExpenseCategoriesOutputSchema},
  prompt: `You are a personal finance expert. Based on the provided expense description, suggest a few relevant spending categories.

Description: {{{description}}}

Categories:`, // The LLM should generate just the categories, comma separated.
});

const suggestExpenseCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoriesFlow',
    inputSchema: SuggestExpenseCategoriesInputSchema,
    outputSchema: SuggestExpenseCategoriesOutputSchema,
  },
  async input => {
    const {output} = await suggestExpenseCategoriesPrompt(input);
    return output!;
  }
);
