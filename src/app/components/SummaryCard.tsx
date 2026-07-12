import React from "react";

interface SummaryCardProps{
  title: string;
  amount: string;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

export default function SummaryCard({ title, amount, description, trend }: SummaryCardProps) {
  // Configures and returns the aesthetic color associated with the trend direction.
  const trendColor = 
    trend === "positive" ? "text-green-600" :
    trend === "negative" ? "text-red-600" :
    "text-gray-500";

  return(
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <h3
        className="text-gray-500 text-sm font-medium uppercase tracking-wider"
      >
        {title}
      </h3>
      <p
        className="text-3xl font-bold mt-2 text-black"
      >
        {amount}
      </p>
      <p
        className={`text-sm mt-2 font-medium ${trendColor}`}
      >
        {description}
      </p>
    </div>
  );
}