// src/AccountDetails.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";

export default function AccountDetails() {
  const [investments, setInvestments] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [invRes, priceRes] = await Promise.all([
          axios.get("http://localhost:5000/investments"),
          axios.get("http://localhost:5000/prices"),
        ]);
        if (!mounted) return;
        setInvestments(Array.isArray(invRes.data) ? invRes.data : []);
        setPrices(Array.isArray(priceRes.data) ? priceRes.data : []);
      } catch (err) {
        console.error("Error loading account data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const getCurrentPrice = (symbol) => {
    const p = prices.find((x) => x.symbol === symbol);
    return p ? Number(p.currentPrice) : 0;
  };

  const investedAmount = investments.reduce(
    (sum, it) => sum + (Number(it.buyPrice) || 0) * (Number(it.quantity) || 0),
    0
  );
  const currentValue = investments.reduce(
    (sum, it) => sum + getCurrentPrice(it.symbol) * (Number(it.quantity) || 0),
    0
  );
  const netGain = currentValue - investedAmount;
  const netGainPct = investedAmount > 0 ? (netGain / investedAmount) * 100 : 0;

  const performanceList = investments.map((it) => {
    const curr = getCurrentPrice(it.symbol);
    const pct =
      it.buyPrice && it.buyPrice > 0
        ? ((curr - it.buyPrice) / it.buyPrice) * 100
        : 0;
    return { name: it.name || it.symbol, symbol: it.symbol, pct };
  });

  const topPerformer = performanceList.slice().sort((a, b) => b.pct - a.pct)[0];
  const worstPerformer = performanceList.slice().sort((a, b) => a.pct - b.pct)[0];
  const avgPerf =
    performanceList.length > 0
      ? (
          performanceList.reduce((s, x) => s + x.pct, 0) /
          performanceList.length
        ).toFixed(1)
      : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="bg-white p-6 rounded-xl shadow text-gray-700 text-lg font-medium">
            Loading account details…
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ===== LEFT SECTION ===== */}
          <div className="col-span-2 flex flex-col gap-6">
            
            {/* Account Details */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Account Details
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span>Name as per PAN:</span><span className="font-medium">DARA KARTHIKEYA</span></div>
                <div className="flex justify-between"><span>PAN Number:</span><span className="font-medium">PAHQC5564K</span></div>
                <div className="flex justify-between"><span>Client ID:</span><span className="font-medium">2024653987145</span></div>
                <div className="flex justify-between"><span>BO ID:</span><span className="font-medium">2024017145</span></div>
                <div className="flex justify-between"><span>Tax Slab:</span><span className="font-medium text-gray-500">Unavailable</span></div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Account Summary
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div><strong>Total Invested:</strong> ₹{investedAmount.toFixed(2)}</div>
                <div><strong>Current Value:</strong> ₹{currentValue.toFixed(2)}</div>
                <div>
                  <strong>Net Gain:</strong>{" "}
                  <span
                    className={
                      netGain >= 0
                        ? "text-green-600 font-medium"
                        : "text-red-600 font-medium"
                    }
                  >
                    ₹{netGain.toFixed(2)} ({netGainPct.toFixed(1)}%)
                  </span>
                </div>
                <div><strong>Gmail Linked:</strong> dara.karthikeya18@gmail.com</div>
                <div><strong>Support Code:</strong> 24145</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Recent Activity
              </h2>
              <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                <li>Changed Password on 31/08/2025</li>
                <li>Generated Tax Report (Jul 2025)</li>
                <li>Added ICICI Silver ETF (Aug 2025)</li>
                <li>Added GOLDBEES ETF (July 2025)</li>
              </ul>
            </div>
          </div>

          {/* ===== RIGHT SECTION ===== */}
          <div className="flex flex-col gap-6">
            {/* Performance Overview */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                Performance Overview
              </h2>
              <div className="text-sm text-gray-700 space-y-2">
                <div><strong>Top Performer:</strong> {topPerformer?.name || "N/A"} ({topPerformer?.pct?.toFixed(2) || 0}%)</div>
                <div><strong>Worst Performer:</strong> {worstPerformer?.name || "N/A"} ({worstPerformer?.pct?.toFixed(2) || 0}%)</div>
                <div><strong>Average Performance:</strong> {avgPerf || "0"}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
