'use client';

import AddExpenseForm from "@/app/components/AddExpenseForm";
import RecentExpenses from "../components/RecentExpenses";
import { useState, useEffect } from "react";
import { Expense } from "../data/mockData";



export default function ExpensePage() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded,setIsLoaded]=useState(false);
  const [kategorijaFilter,setKategorijaFilter]=useState("Sve");
  const [statusFilter,setStatusFilter]=useState("Sve");

  useEffect(()=>{

    const snimljeniPodaci=localStorage.getItem("mojiTroskovi");

    if(snimljeniPodaci){
      setExpenses(JSON.parse(snimljeniPodaci));
    }

    setIsLoaded(true);
  },[])

  useEffect(()=>{

    localStorage.setItem("mojiTroskovi",JSON.stringify(expenses));

  },[expenses,isLoaded]);

  

  const handleNoviTrosak = (noviTrosak: Omit<Expense, 'id' | 'date' | 'status'>) => {

    const kompletanTrosak: Expense = {
      ...noviTrosak,
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: "Na cekanju"
    };
    setExpenses([...expenses, kompletanTrosak]);
  };

  const handleBrisanjeTroska = (idZaBrisanje: string) => {
    setExpenses(expenses.filter((trosak) => trosak.id !== idZaBrisanje));
  };

  const filtriraniTroskovi=kategorijaFilter==="Sve"?
  expenses
  :expenses.filter((trosak)=>trosak.category===kategorijaFilter);

  const ukupanTrosak = filtriraniTroskovi.reduce((zbir, trosak) => zbir + trosak.amount, 0);

  const filtrirajStatus= statusFilter==="Svi statusi"?
  expenses
  :expenses.filter((trosak)=>trosak.status===statusFilter);

  const getStatusColor = (status: string) => {

    switch (status) {
        case 'Odobreno':
            return 'bg-green-100 text-green-800';
        case 'Na cekanju':
            return 'bg-yellow-100 text-yellow-800';
        case 'Odbijeno':
            return 'bg-red-100 text-red-800';
    }
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
          <div className="bg-[#8e082d] text-white p-6 rounded-xl shadow-sm mb-8 flex justify-between items-center">
            <div>
              <p
              className="text-sm text-white/80 uppercase tracking-wider font-bold mb-1"
              >Ukupni troškovi
              </p>
              <h2
              className="text-4xl font-extrabold"
              >${ukupanTrosak.toFixed(2)}
              </h2>
            </div>
            <div
            className="p-4 bg-white/20 rounded-full">
              <svg
              className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
              </svg>
            </div>
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
    {["Sve", "Reprezentacije", "Prevoz", "Oprema", "Edukacija"].map((kategorija) => (
        <button
            key={kategorija}
            onClick={() => setKategorijaFilter(kategorija)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                kategorijaFilter === kategorija 
                ? "bg-black text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
            {kategorija}
        </button>
    ))}
</div>



<div className="flex gap-2 mb-6 overflow-x-auto pb-2">
  <select className='px-3 py-1 rounded-full text-m font-bold'>
    {["Svi statusi", "Na cekanju", "Odobreno", "Odbijeno"].map((status) => (
      <option key={status}
      onChange={()=>setStatusFilter(status)}
      className={`px-3 py-1 rounded-full text-m font-bold ${getStatusColor(status)}}`}
      >
        {status}
      </option>
           
        
    ))}
    </select>
</div>


          <RecentExpenses noResize data={filtriraniTroskovi} onDelete={handleBrisanjeTroska} />
        </div>

        <div
          className="lg:col-span-1">
          <AddExpenseForm onAddExpense={handleNoviTrosak} />
        </div>

      </div>
    </div>
  );
}