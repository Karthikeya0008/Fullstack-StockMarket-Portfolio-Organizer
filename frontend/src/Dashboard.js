// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_BASE = "http://localhost:5000";

export default function Dashboard() {
  const [investments, setInvestments] = useState([]);
  const [prices, setPrices] = useState([]);

  const fetchInvestments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/investments`);
      setInvestments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching investments:", err);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/prices`);
      setPrices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching prices:", err);
    }
  };

  useEffect(() => {
    fetchInvestments();
    fetchPrices();
    // poll prices occasionally (optional): setInterval(fetchPrices, 60000)
  }, []);

  const getCurrentPrice = (symbol, fallback) => {
    const p = prices.find((x) => x.symbol === symbol);
    if (p && typeof p.currentPrice !== "undefined") return Number(p.currentPrice);
    return Number(fallback ?? 0);
  };

  const investedAmount = investments.reduce(
    (sum, it) => sum + (Number(it.buyPrice) || 0) * (Number(it.quantity) || 0),
    0
  );
  const currentValue = investments.reduce(
    (sum, it) => sum + getCurrentPrice(it.symbol, it.currentPrice) * (Number(it.quantity) || 0),
    0
  );
  const profitLoss = currentValue - investedAmount;
  const profitPercent = investedAmount > 0 ? ((profitLoss / investedAmount) * 100).toFixed(1) : "0.0";

  const chartData = investments.map((item) => {
    const current = getCurrentPrice(item.symbol, item.currentPrice);
    const buy = Number(item.buyPrice || 0);
    const qty = Number(item.quantity || 0);
    const returns = (current - buy) * qty;
    return { name: item.name || item.symbol, Returns: Number(returns.toFixed(2)) };
  });

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#F8F8F8", color: "#000000" }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="p-4 rounded-lg shadow-md bg-white">
          <h2 className="text-sm text-black-900 font-medium">Portfolio Value</h2>
          <p className="text-2xl font-light">₹{currentValue.toFixed(2)}</p>
          <p className={`text-sm ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profitLoss >= 0 ? "+" : ""}
            {profitLoss.toFixed(2)} ({profitPercent}%)
          </p>
        </div>

        <div className="p-4 rounded-lg shadow-md bg-white">
          <h2 className="text-sm text-black-900 font-medium">Invested Amount</h2>
          <p className="text-2xl font-light">₹{investedAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="p-4 rounded-lg shadow-md mb-6" style={{ backgroundColor: "#FFFFFF" }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#000000" }}>
          Portfolio Performance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="name" stroke="#000000" />
            <YAxis stroke="#000000" />
            <Tooltip wrapperStyle={{ backgroundColor: "#FFFFFF", color: "#000000", borderRadius: "5px" }} />
            <Line type="monotone" dataKey="Returns" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Investments Table */}
      <div className="p-4 rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#000000" }}>
          Investments
        </h2>
        {investments.length === 0 ? (
          <p className="text-gray-500">No investments yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Buy Price</th>
                <th className="py-2 px-4">Quantity</th>
                <th className="py-2 px-4">Current Price</th>
                <th className="py-2 px-4">Returns</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((item, idx) => {
                const currentPrice = getCurrentPrice(item.symbol, item.currentPrice);
                const returns = (currentPrice - Number(item.buyPrice || 0)) * Number(item.quantity || 0);
                return (
                  <tr key={item.id ?? idx} className="border-b border-gray-300">
                    <td className="py-2 px-4">{item.name ?? item.symbol}</td>
                    <td className="py-2 px-4">₹{Number(item.buyPrice || 0).toFixed(2)}</td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">₹{Number(currentPrice || 0).toFixed(2)}</td>
                    <td className={`py-2 px-4 font-bold ${returns >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ₹{isNaN(returns) ? "0.00" : returns.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
