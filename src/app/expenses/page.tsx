'use client';

import AddExpenseForm from "@/app/components/AddExpenseForm";
import RecentExpenses from "../components/RecentExpenses";
import { useState } from "react";
import { Expense, mockExpenses } from "../data/mockData";



export default function ExpensePage(){

  const [expenses,setExpenses]=useState<Expense[]>(mockExpenses);

const handleNoviTrosak = (noviTrosak: Omit<Expense, 'id' | 'date' | 'status'>) => {
    
  const kompletanTrosak: Expense = {
      ...noviTrosak,
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: "Na cekanju"
  };
  setExpenses([...expenses, kompletanTrosak]);
};

    return (
        <div
        className="p-8 w-full max-w-7xl mx-auto">
          <h1
          className="text-3xl font-bold text-gray-900 mb-8"
          >Upravljanje Troškovima
          </h1>
          
          <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div
            className="lg:col-span-2">
              <RecentExpenses noResize data={expenses}/>
            </div>
    
            <div
            className="lg:col-span-1">
              <AddExpenseForm onAddExpense={handleNoviTrosak}/>
            </div>
    
          </div>
        </div>
      );
}