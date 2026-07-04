'use client';

import ExpenseForm from "@/app/components/ExpenseForm";
import RecentExpenses from "../components/RecentExpenses";
import { useState, useEffect } from "react";
import { Expense } from "../data/mockData";



export default function ExpensePage() {

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [kategorijaFilter, setKategorijaFilter] = useState("Sve");
  const [statusFilter, setStatusFilter] = useState("Svi statusi");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sortRastuce, setSortRastuce] = useState(true);
  const [sortKriterijum, setSortKriterijum] = useState("opis");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [pretraga, setPretraga] = useState("");
  const [trosakZaIzmenu, setTrosakZaIzmenu] = useState<Expense | null>(null);
  const [trenutnaStrana, setTrenutnaStrana]=useState(1);
  const stavkiPoStrani=5;


  useEffect(() => {

    const snimljeniPodaci = localStorage.getItem("mojiTroskovi");

    if (snimljeniPodaci) {
      setExpenses(JSON.parse(snimljeniPodaci));
    }

    setIsLoaded(true);
  }, [])

  useEffect(() => {

    localStorage.setItem("mojiTroskovi", JSON.stringify(expenses));

  }, [expenses, isLoaded]);



  const handleSacuvajTrosak = (podaciIzForme: Omit<Expense, 'id' | 'date' | 'status'>) => {
    if (trosakZaIzmenu) {
      setExpenses(expenses.map((trosak) =>
        trosak.id === trosakZaIzmenu.id
          ? { ...trosak, ...podaciIzForme }
          : trosak
      ));
      setTrosakZaIzmenu(null);
    } else {
      const kompletanTrosak: Expense = {
        ...podaciIzForme,
        id: `TRX-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        status: "Na cekanju"
      };
      setExpenses([...expenses, kompletanTrosak]);
    }
  };


  const handleBrisanjeTroska = (idZaBrisanje: string) => {
    setExpenses(expenses.filter((trosak) => trosak.id !== idZaBrisanje));
  };

  const filtriraniTroskovi = expenses
    .filter((trosak) => kategorijaFilter === "Sve" || trosak.category === kategorijaFilter)
    .filter((trosak) => statusFilter === "Svi statusi" || trosak.status === statusFilter)
    .filter((trosak) => trosak.description.toLowerCase().includes(pretraga.toLowerCase()));

  const sortiraniTroskovi = [...filtriraniTroskovi].sort((a, b) => {
    let rezultat = 0;

    if (sortKriterijum === "amount") {
      rezultat = a.amount - b.amount;
    } else if (sortKriterijum === "description") {
      rezultat = a.description.localeCompare(b.description);
    } else if (sortKriterijum === "date") {
      rezultat = a.date.localeCompare(b.date);
    }
    return sortRastuce ? rezultat : rezultat * -1;
  });

  const zadnjiIndeks=trenutnaStrana*stavkiPoStrani;
  const prviIndeks=zadnjiIndeks-stavkiPoStrani;

  const podaciZaPrikaz=sortiraniTroskovi.slice(prviIndeks,zadnjiIndeks);

  const ukupnoStrana=Math.ceil(sortiraniTroskovi.length/stavkiPoStrani);

  const ukupanTrosak = filtriraniTroskovi.reduce((zbir, trosak) => zbir + trosak.amount, 0);



  const getStatusColor = (status: string) => {

    switch (status) {
      case 'Odobreno':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Na cekanju':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Odbijeno':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-white text-gray-700 border-gray-300'
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
          <div className="flex justify-between items-center mb-6 w-full gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {["Sve", "Reprezentacije", "Prevoz", "Oprema", "Edukacija"].map((kategorija) => (
                <button
                  key={kategorija}
                  onClick={() => setKategorijaFilter(kategorija)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${kategorijaFilter === kategorija
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {kategorija}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={pretraga}
                onChange={(e) => setPretraga(e.target.value)}
                placeholder="Pretraži..."
                className="w-48 pl-9 pr-4 py-2 text-sm font-medium border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-700 bg-gray-50/50 focus:bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 w-full">
            <div className="relative z-20">
              <button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
                className={`px-4 py-2 border rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold transition-colors cursor-pointer flex items-center justify-between w-auto ${getStatusColor(statusFilter)}`}
              >
                {statusFilter}
                <svg className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                  {["Svi statusi", "Na cekanju", "Odobreno", "Odbijeno"].map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${statusFilter === status ? "bg-gray-50 text-[#8e082d]" : "text-gray-700"
                        }`}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 z-10">
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                    setIsDropdownOpen(false);

                  }}
                  className="px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#8e082d] outline-none font-bold text-gray-700 bg-white cursor-pointer flex items-center justify-between w-auto transition-colors"
                >
                  {sortKriterijum === "date" ? "Datum" : sortKriterijum === "amount" ? "Iznos" : "Opis (A-Z)"}
                  <svg className={`w-4 h-4 ml-2 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full min-w-max bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
                    {[
                      { id: "description", naziv: "Opis (A-Z)" },
                      { id: "date", naziv: "Datum" },
                      { id: "amount", naziv: "Iznos" }
                    ].map((opcija) => (
                      <div
                        key={opcija.id}
                        onClick={() => {
                          setSortKriterijum(opcija.id);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`px-4 py-3 cursor-pointer text-sm font-bold transition-colors hover:bg-gray-100 ${sortKriterijum === opcija.id ? "bg-gray-50 text-[#8e082d]" : "text-gray-700"
                          }`}
                      >
                        {opcija.naziv}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSortRastuce(!sortRastuce)}
                className="p-2 border border-gray-300 rounded-full bg-white text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-[#8e082d] outline-none"
              >
                <svg
                  className={`w-6 h-6 transition-transform duration-300 ${sortRastuce ? '' : 'rotate-180'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
            </div>
          </div>

          <RecentExpenses noResize data={podaciZaPrikaz} onDelete={handleBrisanjeTroska} onEdit={(trosak) => setTrosakZaIzmenu(trosak)} />
{ukupnoStrana > 1 && (
  <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm">
    
    <div className="text-sm text-gray-700 font-medium">
      Strana <span className="font-bold text-gray-900">{trenutnaStrana}</span> od <span className="font-bold text-gray-900">{ukupnoStrana}</span>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => setTrenutnaStrana(trenutnaStrana - 1)}
        disabled={trenutnaStrana === 1}
        className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none focus:ring-2 focus:ring-[#8e082d] ${
          trenutnaStrana === 1
            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 cursor-pointer"
        }`}
      >
        Nazad
      </button>
      
      <button
        onClick={() => setTrenutnaStrana(trenutnaStrana + 1)}
        disabled={trenutnaStrana === ukupnoStrana}
        className={`px-4 py-2 border rounded-lg text-sm font-bold transition-colors outline-none focus:ring-2 focus:ring-[#8e082d] ${
          trenutnaStrana === ukupnoStrana
            ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100 cursor-pointer"
        }`}
      >
        Sledeća
      </button>
    </div>
    
  </div>
)}
        </div>

        <div
          className="lg:col-span-1">
          <ExpenseForm onSave={handleSacuvajTrosak}
            trosakZaIzmenu={trosakZaIzmenu} />
        </div>

      </div>
    </div>
  );
}