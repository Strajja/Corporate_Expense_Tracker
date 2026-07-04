import React, { useState } from 'react';
import { Expense } from '../data/mockData';

interface RecentExpensesProps {
    noResize?: boolean;
    data: Expense[];
    onDelete: (id: string) => void;
    onEdit: (trosak: Expense) => void;
}

export default function RecentExpenses({ noResize = false, data, onDelete, onEdit }: RecentExpensesProps) {
    const [selektovaniTrosak, setSelektovaniTrosak] = useState<Expense | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Odobreno':
                return 'bg-green-100 text-green-800';
            case 'Na cekanju':
                return 'bg-yellow-100 text-yellow-800';
            case 'Odbijeno':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const resizeClass = !noResize ? "resize-x overflow-auto" : "";

    return (
        <div className={`bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 ${resizeClass} w-full max-w-full min-w-[300px] relative`}>
            
            {/* INJEKCIJA PRILAGOĐENOG CSS-A ZA SKROLBAR */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: transparent;
                    border-radius: 10px;
                    transition: background-color 0.3s;
                }
                /* Prikazuje se tek na hover */
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb; 
                }
                /* Blago potamni kad se klizač zapravo uhvati/hoveruje */
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #d1d5db; 
                }
            `}</style>

            <h2 className='text-xl font-bold text-gray-900 mb-6'>Nedavni troskovi</h2>
            <div className='min-w-[600px]'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider'>
                            <th className="pb-3 font-medium">Opis</th>
                            <th className="pb-3 font-medium">Kategorija</th>
                            <th className="pb-3 font-medium">Datum</th>
                            <th className="pb-3 font-medium">Iznos</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium text-right">Akcije</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map((expense) => (
                            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4">
                                    {/* DODATA custom-scrollbar KLASA */}
                                    <div 
                                        onClick={() => setSelektovaniTrosak(expense)}
                                        className="max-w-[200px] overflow-x-auto whitespace-nowrap font-medium text-gray-900 cursor-pointer hover:text-[#8e082d] transition-colors pb-2 custom-scrollbar"
                                        title="Klikni za detalje"
                                    >
                                        {expense.description}
                                    </div>
                                </td>
                                <td className="py-4 text-gray-500">{expense.category}</td>
                                <td className="py-4 text-gray-500">{expense.date}</td>
                                <td className="py-4 text-gray-900 font-bold">${expense.amount.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(expense.status)}`}>
                                        {expense.status}
                                    </span>
                                </td>
                                <td className="py-4 whitespace-nowrap text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(expense)}
                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Izmeni
                                    </button>
                                    <button
                                        onClick={() => onDelete(expense.id)}
                                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors"
                                    >
                                        Izbrisi
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selektovaniTrosak && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Detalji troška</h3>
                                <button 
                                    onClick={() => setSelektovaniTrosak(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ceo opis</label>
                                    <p className="mt-1 text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
                                        {selektovaniTrosak.description}
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kategorija</label>
                                        <p className="mt-1 font-medium text-gray-900">{selektovaniTrosak.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Datum</label>
                                        <p className="mt-1 font-medium text-gray-900">{selektovaniTrosak.date}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Iznos</label>
                                        <p className="mt-1 font-bold text-[#8e082d] text-lg">${selektovaniTrosak.amount.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                                        <div className="mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selektovaniTrosak.status)}`}>
                                                {selektovaniTrosak.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button 
                                onClick={() => setSelektovaniTrosak(null)}
                                className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                            >
                                Zatvori
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}