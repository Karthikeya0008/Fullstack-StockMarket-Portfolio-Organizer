// src/pages/Portfolio.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [prices, setPrices] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [newInvestment, setNewInvestment] = useState({
    name: "",
    symbol: "",
    buyPrice: "",
    quantity: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // fetch investments (Firestore)
  const fetchInvestments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/investments`);
      setInvestments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching investments:", err);
    }
  };

  // fetch prices (Yahoo via backend)
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
  }, []);

  // update autocomplete results as user types
  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const results = prices.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.symbol && p.symbol.toLowerCase().includes(q))
    );
    setSearchResults(results.slice(0, 10));
  }, [searchTerm, prices]);

  const getCurrentPrice = (symbol) => {
    const p = prices.find((x) => x.symbol === symbol);
    if (p && typeof p.currentPrice !== "undefined") return Number(p.currentPrice);
    return 0;
  };

  // when user picks an autocomplete result
  const handlePickStock = (stock) => {
    setNewInvestment({
      name: stock.name || stock.symbol,
      symbol: stock.symbol,
      buyPrice: stock.regularMarketPrice ?? stock.currentPrice ?? "",
      quantity: "",
    });
    setSearchTerm("");
    setSearchResults([]);
  };

  // Add investment -> POST to backend (backend fetches latest details and stores in Firestore)
  const handleAddInvestment = async () => {
    try {
      // validate properly (allow buyPrice = 0 but ensure it's numeric)
      const buyNum = Number(newInvestment.buyPrice);
      const qtyNum = Number(newInvestment.quantity);

      if (!newInvestment.symbol) {
        alert("Please select a stock.");
        return;
      }
      if (Number.isNaN(buyNum)) {
        alert("Please enter a valid Buy Price (numeric).");
        return;
      }
      if (!qtyNum || qtyNum <= 0) {
        alert("Please enter a valid Quantity (greater than 0).");
        return;
      }

      // send symbol, buyPrice, quantity to backend
      const payload = {
        name: newInvestment.name || newInvestment.symbol,
        symbol: newInvestment.symbol,
        buyPrice: buyNum,
        quantity: qtyNum,
      };

      await axios.post(`${API_BASE}/investments`, payload);


      // backend may or may not return the created doc — just re-fetch to be safe
      await fetchInvestments();

      setNewInvestment({ name: "", symbol: "", buyPrice: "", quantity: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Error adding investment:", err);
      alert("Failed to add investment. Check console.");
    }
  };

  // Delete using Firestore doc id
  const handleDeleteInvestment = async (id) => {
    try {
      await axios.delete(`${API_BASE}/investments/${id}`);
      setInvestments((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error("Error deleting investment:", err);
      alert("Delete failed. Check console.");
    }
  };

  // fill buyPrice with live current price (if available)
  const useCurrentPrice = () => {
    if (!newInvestment.symbol) return;
    const cp = getCurrentPrice(newInvestment.symbol);
    if (cp === 0) {
      alert("Current price not available for this symbol.");
      return;
    }
    setNewInvestment((s) => ({ ...s, buyPrice: cp }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Order History</h1>

      {/* Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.length === 0 ? (
          <p className="text-gray-500">No investments yet.</p>
        ) : (
          investments.map((item) => {
            // item may come from firestore and contain buyPrice, quantity, symbol
            const currentPrice = getCurrentPrice(item.symbol) || Number(item.currentPrice || 0);
            const buy = Number(item.buyPrice || item.amount || 0);
            const qty = Number(item.quantity || item.qty || 0);
            const returns = (currentPrice - buy) * qty;

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-700">{item.name || item.symbol}</h2>
                <p className="text-sm text-gray-600">Quantity: {qty}</p>
                <p className="text-sm text-gray-600">Buy Price: ₹{buy}</p>
                <p className="text-sm text-gray-600">Current Price: ₹{currentPrice}</p>
                <p
                  className={`font-bold mt-1 ${
                    returns >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Returns: ₹{isNaN(returns) ? "0.00" : returns.toFixed(2)}
                </p>

                {/* Delete button */}
                <button
                  className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  onClick={() => handleDeleteInvestment(item.id)}
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Investment Button */}
      <button
        className="mt-6 px-4 py-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded-lg hover:opacity-90 transition-all shadow-md"
        onClick={() => setShowModal(true)}
      >
        + Add Investment
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Add New Investment</h2>

            {/* Search box (autocomplete from API prices) */}
            <input
              type="text"
              placeholder="Search Stock/ETF by name or symbol..."
              className="w-full mb-2 p-2 rounded border text-gray-700"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto mb-2 border rounded">
                {searchResults.map((s, i) => (
                  <div
                    key={i}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handlePickStock(s)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-800">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.symbol}</div>
                      </div>
                      <div className="text-sm text-gray-700">
                        ₹{s.currentPrice ?? s.regularMarketPrice ?? "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected stock details */}
            <input
              type="text"
              placeholder="Selected Symbol"
              className="w-full mb-2 p-2 rounded border text-gray-700"
              value={newInvestment.symbol}
              onChange={(e) => setNewInvestment({ ...newInvestment, symbol: e.target.value })}
            />

            <div className="flex gap-2 mb-2">
              <input
                type="number"
                placeholder="Buy Price (₹)"
                className="flex-1 p-2 rounded border text-gray-700"
                value={newInvestment.buyPrice}
                onChange={(e) => setNewInvestment({ ...newInvestment, buyPrice: e.target.value })}
              />
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all shadow-md"
                onClick={useCurrentPrice}
                title="Fill buy price with current market price"
              >
                Use current price
              </button>
            </div>

            <input
              type="number"
              placeholder="Quantity"
              className="w-full mb-4 p-2 rounded border text-gray-700"
              value={newInvestment.quantity}
              onChange={(e) => setNewInvestment({ ...newInvestment, quantity: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] text-white rounded hover:opacity-90 transition-all shadow-md"
                onClick={handleAddInvestment}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
