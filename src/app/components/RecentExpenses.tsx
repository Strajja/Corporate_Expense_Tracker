import React from 'react';

interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    status: 'Odobreno' | 'Na cekanju' | 'Odbijeno';
}

const mockExpenses: Expense[] = [
    { id: 'TRX-001', description: 'Poslovni ručak sa klijentom', category: 'Reprezentacija', amount: 120.50, date: '2026-06-12', status: 'Odobreno' },
    { id: 'TRX-002', description: 'Taksi do aerodroma', category: 'Prevoz', amount: 45.00, date: '2026-06-14', status: 'Na cekanju' },
    { id: 'TRX-003', description: 'Kotizacija za konferenciju', category: 'Edukacija', amount: 350.00, date: '2026-06-15', status: 'Odbijeno' },
    { id: 'TRX-004', description: 'Kancelarijski materijal', category: 'Oprema', amount: 85.20, date: '2026-06-15', status: 'Odobreno' },
];

export default function RecentExpenses() {
    const getStatusColor = (status: string) => {

        switch (status) {
            case 'Odobreno':
                return 'bg-green-100 text-green-800';
            case 'Na čekanju':
                return 'bg-yellow-100 text-yellow-800';
            case 'Odbijeno':
                return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div
            className='bg-white mt-8 p-6 rounded-xl shadow-sm border border-gray-100 resize-x overflow-auto w-full max-w-full min-w-[300px]'>
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
                        {mockExpenses.map((expense) => (
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