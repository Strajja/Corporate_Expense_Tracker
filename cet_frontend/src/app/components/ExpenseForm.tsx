'use client';

import React, { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from "react-hook-form";

// Validation schema for the expense form
const expenseSchema = z.object({
  description: z.string().min(3, "Description must be longer than 3 characters."),
  amount: z.coerce.number().min(0, "Amount cannot be negative."),
  category: z.string().min(1, "You must select a category.")
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSave: (data: ExpenseFormData) => void;
  expenseToEdit: any | null;
}

/**
 * ExpenseForm Component
 * Handles both the creation of new expenses and the editing of existing ones.
 * Uses react-hook-form with Zod for validation.
 */
export default function ExpenseForm({ onSave, expenseToEdit }: ExpenseFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "Representation"
    }
  });

  // Populate form fields when editing an existing expense or reset when creating a new one
  useEffect(() => {
    if (expenseToEdit) {
      let formattedCategory = expenseToEdit.category;
      
      // Normalize category names for the dropdown
      if (formattedCategory === "TRANSPORTATION") formattedCategory = "Transport";
      if (formattedCategory === "REPRESENTATION") formattedCategory = "Representation";
      if (formattedCategory === "EQUIPMENT") formattedCategory = "Equipment";
      if (formattedCategory === "EDUCATION") formattedCategory = "Education";

      reset({
        description: expenseToEdit.description || "",
        amount: expenseToEdit.amount || 0,
        category: formattedCategory || "Representation"
      });
    } else {
      reset({
        description: "",
        amount: 0,
        category: "Representation"
      });
    }
  }, [expenseToEdit, reset]);

  /**
   * Form submission handler
   * Triggers the onSave callback and resets the form to default values.
   */
  const onSubmit = (data: ExpenseFormData) => {
    onSave(data);
    reset({
      description: "",
      amount: 0,
      category: "Representation"
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {expenseToEdit ? "Edit Expense" : "New Expense"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            placeholder="e.g. business lunch"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-900"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-medium">
              {errors.description.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-900"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-red-500 text-xs font-medium">
              {errors.amount.message as string}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8e082d] focus:border-transparent outline-none transition-all text-gray-900"
            {...register("category")}
          >
            <option value="Representation">Representation</option>
            <option value="Transport">Transport</option>
            <option value="Equipment">Equipment</option>
            <option value="Education">Education</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs font-medium">
              {errors.category.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-[#8e082d] transition-colors duration-300"
        >
          {expenseToEdit ? "Save Changes" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}