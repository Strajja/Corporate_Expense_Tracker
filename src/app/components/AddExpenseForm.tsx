'use client';

import React from 'react';
import {z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {useForm} from "react-hook-form";
import RecentExpenses from './RecentExpenses';

const expenseSchema=z.object({
    description:z.string().min(3, "Opis mora imati vise od 3 karaktera."),
    amount:z.coerce.number().min(0,"Trosak ne moze biti negativan."),   
    category:z.string().min(1, "Morate da izaberete.")
});

type ExpenseFormData=z.infer<typeof expenseSchema>;
interface AddExpenseFormProps{
    onAddExpense:(noviTrosak: ExpenseFormData)=>void;
}

export default function AddExpenseForm({onAddExpense}:AddExpenseFormProps){
        
    // const handleSubmit=(e:React.FormEvent)=>{
    //     e.preventDefault();
    //     alert("Podaci su spremni za slanje na backend.");
    // };



    const {register, handleSubmit, formState:{errors}}=useForm({
        resolver:zodResolver(expenseSchema)
    });

    const onSubmit = (podaci: ExpenseFormData)=>{
        onAddExpense(podaci);
        console.log("Poslato");
    };


    return(
        <div
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2
            className="text-xl font-bold text-gray-900 mb-6"
            >Novi trosak
            </h2>

            <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-4'>

            <div>
                <label
                className="block text-sm font-medium text-gray-700 mb-1"
                >Opis troska
                </label>
                <input
                type="text"
                placeholder="Npr. poslovni rucak"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all"
                {...register("description")}
                />
                {errors.description&&(
                    <p className="text-red-500 text-xs font-medium">
                        {errors.description.message as string}
                    </p>
                )
                }
            </div>

            <div>
                <label
                className="block text-sm font-medium text-gray-700 mb-1"
                >Iznos ($)
                </label>
                <input
                type="number"
                placeholder="0.00"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all"
                {...register("amount")}
                />
                {errors.amount&&(
                    <p className="text-red-500 text-xs font-medium">
                        {errors.amount.message as string}
                    </p>
                )
                }
            </div>

            <div>
          <label className="block text-sm font-medium text-gray-700 mb-1"
          >Kategorija
          </label>
          <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all"
          {...register("category")}>
            <option value="Reprezentacije">Reprezentacija</option>
            <option value="Prevoz">Prevoz</option>
            <option value="Oprema">Oprema</option>
            <option value="Edukacija">Edukacija</option>
          </select>
          {errors.category&&(
                    <p className="text-red-500 text-xs font-medium">
                        {errors.category.message as string}
                    </p>
                )
                }
        </div>

        <button 
          type="submit" 
          className="mt-4 w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-[#8e082d] transition-colors duration-300"
        >Dodaj Trošak
        </button>
            </form>
        </div>
    );
}