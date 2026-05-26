// Expense service - centralized business logic for expenses
import { supabase } from '@/integrations/supabase/client';
import type { Expense, ExpenseInsert } from '@/types';
import { logActivity } from "./activity.service";

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('paid_on', { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  },

  async create(expense: ExpenseInsert): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    
    await logActivity('expense_added', `Expense: ${expense.description}`, 'expense');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    
    if (error) throw error;
  },

  getTotal(expenses: Expense[]): number {
    return expenses.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
  },

  async getMonthlyBreakdown(
    expenses: Expense[],
    months: number = 6
  ): Promise<{ label: string; expense: number }[]> {
    const now = new Date();
    const breakdown: { label: string; expense: number }[] = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthExpense = expenses
        .filter(e => {
          const paidDate = new Date(e.paid_on);
          return paidDate >= startDate && paidDate < endDate;
        })
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
      
      breakdown.push({
        label: startDate.toLocaleDateString('en-US', { month: 'short' }),
        expense: monthExpense,
      });
    }
    
    return breakdown;
  },
};
