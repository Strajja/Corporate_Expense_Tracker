import React from 'react';
import { Expense, mockExpenses } from '../data/mockData';

interface RecentExpensesProps{
    noResize?:boolean;
    data:Expense[];
    onDelete:(id:string)=>void;
}


export default function RecentExpenses({noResize=false,data,onDelete}:RecentExpensesProps) {
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

    const resizeClass=!noResize&&"resize-x overflow-auto";

    return (
        <div
            className={`bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 ${resizeClass} w-full max-w-full min-w-[300px]`}>
            <h2
                className='text-xl font-bold text-gray-900 mb-6'
            >Nedavni troskovi
            </h2>
            <div
                className='min-w-[600px]'>
                <table
                    className='w-full text-left border-collapse'>
                    <thead>
                        <tr
                            className='border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider'>
                            <th className="pb-3 font-medium">Opis</th>
                            <th className="pb-3 font-medium">Kategorija</th>
                            <th className="pb-3 font-medium">Datum</th>
                            <th className="pb-3 font-medium">Iznos</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map((expense) => (
                            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-4 font-medium text-gray-900">{expense.description}</td>
                                <td className="py-4 text-gray-500">{expense.category}</td>
                                <td className="py-4 text-gray-500">{expense.date}</td>
                                <td className="py-4 text-gray-900 font-bold">${expense.amount.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(expense.status)}`}>
                                        {expense.status}
                                    </span>
                                </td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}