// src/components/Layout.js
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DIVERS_DATA = [
  { name: "Stocks", value: 80 },
  { name: "Mutual Funds", value: 10 },
  { name: "ETFs", value: 10 },
];

export default function Layout({ children }) {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState([]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);

  // ---- Available Stocks ----
  const availableStocks = [
    { name: "NIFTY 50", symbol: "^NSEI" },
    { name: "SENSEX", symbol: "^BSESN" },
    { name: "TATA MOTORS", symbol: "TATAMOTORS.NS" },
    { name: "RELIANCE INDUSTRIES", symbol: "RELIANCE.NS" },
    { name: "INFOSYS", symbol: "INFY.NS" },
    { name: "HDFC BANK", symbol: "HDFCBANK.NS" },
    { name: "ICICI BANK", symbol: "ICICIBANK.NS" },
    { name: "STATE BANK OF INDIA", symbol: "SBIN.NS" },
    { name: "BHARTI AIRTEL", symbol: "BHARTIARTL.NS" },
    { name: "ITC LIMITED", symbol: "ITC.NS" },
    { name: "ADANI ENTERPRISES", symbol: "ADANIENT.NS" },
    { name: "ADANI GREEN ENERGY", symbol: "ADANIGREEN.NS" },
    { name: "ADANI PORTS", symbol: "ADANIPORTS.NS" },
    { name: "ONGC", symbol: "ONGC.NS" },
    { name: "MARUTI SUZUKI", symbol: "MARUTI.NS" },
    { name: "AXIS BANK", symbol: "AXISBANK.NS" },
    { name: "WIPRO", symbol: "WIPRO.NS" },
    { name: "TCS", symbol: "TCS.NS" },
    { name: "HINDUSTAN UNILEVER", symbol: "HINDUNILVR.NS" },
    { name: "BAJAJ FINANCE", symbol: "BAJFINANCE.NS" },
  ];

  // ---- Fetch Watchlist & Prices ----
  const fetchWatchlist = async () => {
    try {
      const res = await axios.get("http://localhost:5000/watchlist");
      setWatchlist(res.data);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/prices");
      // Ensure safety: map numeric values
      const cleanData = res.data.map((item) => ({
        ...item,
        currentPrice: Number(item.currentPrice) || 0,
        changePercent: Number(item.changePercent) || 0,
      }));
      setPrices(cleanData);
    } catch (err) {
      console.error("Error fetching prices:", err);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    fetchPrices();
  }, []);

  const handleAddToWatchlist = async (stock) => {
    try {
      await axios.post("http://localhost:5000/watchlist", {
        symbol: stock.symbol,
        name: stock.name,
      });
      fetchWatchlist();
      setShowAddDropdown(false);
    } catch (err) {
      console.error("Error adding to watchlist:", err);
    }
  };

  const handleRemoveFromWatchlist = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/watchlist/${id}`);
      fetchWatchlist();
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-white via-[#E0E7FF] to-[#1E40AF] shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="YieldWise Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg font-semibold text-[#1E3A8A] tracking-wide drop-shadow-sm">
              FINWISE
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-800 hover:text-[#1E3A8A] font-medium transition-colors">
              Dashboard
            </Link>
            <Link to="/portfolio" className="text-gray-800 hover:text-[#1E3A8A] font-medium transition-colors">
              Order History
            </Link>
            <Link to="/tax-reports" className="text-gray-800 hover:text-[#1E3A8A] font-medium transition-colors">
              Tax Reports
            </Link>
            <Link to="/account-details" className="text-gray-800 hover:text-[#1E3A8A] font-medium transition-colors">
              Account Details
            </Link>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 m-4 p-4 bg-white rounded-xl shadow-sm sticky top-20 h-[calc(100vh-140px)] overflow-auto">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">Market Overview</h2>

          {/* Live Market Data */}
          <div className="space-y-3 text-sm text-gray-600 mb-4">
            {prices.length > 0 ? (
              prices.slice(0, 3).map((stock, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{stock.symbol}</span>
                  <span className={`font-medium ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{stock.currentPrice.toFixed(2)} {stock.changePercent >= 0 ? "↑" : "↓"}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">Loading market data...</div>
            )}
          </div>

          <hr className="my-3" />

          {/* Top Movers Section */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Top Movers</div>
            <ul className="space-y-2 text-sm text-gray-700">
              {prices.length > 0 ? (
                prices
                  .filter((s) => typeof s.changePercent === "number")
                  .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
                  .slice(0, 5)
                  .map((stock, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{stock.symbol}</span>
                      <span className={`${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                        {stock.changePercent >= 0 ? "+" : ""}
                        {Number(stock.changePercent).toFixed(2)}%
                      </span>
                    </li>
                  ))
              ) : (
                <li className="text-gray-400">Fetching top movers...</li>
              )}
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 m-4 flex flex-col">
          <div className="flex-1">{children}</div>

          {/* Forum Section */}
          <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Forum</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.youtube.com/" className="text-blue-600 hover:underline">How to add stocks to your account</a></li>
              <li><a href="https://www.youtube.com/" className="text-blue-600 hover:underline">How to read a candlestick chart</a></li>
              <li><a href="https://www.youtube.com/" className="text-blue-600 hover:underline">Tax reporting & exports</a></li>
              <li><a href="https://www.youtube.com/" className="text-blue-600 hover:underline">FAQ & troubleshooting</a></li>
            </ul>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <div className="w-80 hidden xl:block m-4">
          {isDashboard && (
            <div className="space-y-4 sticky top-20">
              {/* Diversification Chart */}
              <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h4 className="text-sm font-semibold text-gray-800">Diversification</h4>
                <div style={{ width: "100%", height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DIVERS_DATA} dataKey="value" outerRadius={60} cx="50%" cy="50%">
                        {DIVERS_DATA.map((entry, idx) => (
                          <Cell key={`c-${idx}`} fill={["#00BCD4", "#448AFF", "#3F51B5"][idx % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Watchlist Section */}
              <div className="bg-white p-4 rounded-xl shadow-sm border relative">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-gray-800">Watchlist</h4>
                  <button
                    className="text-blue-600 font-bold px-2 py-1 rounded hover:bg-gray-100"
                    onClick={() => setShowAddDropdown(!showAddDropdown)}
                  >
                    +
                  </button>
                </div>

                {showAddDropdown && (
                  <div className="absolute top-12 right-4 w-64 bg-white border rounded shadow-md z-50 max-h-[300px] overflow-y-auto">
                    {availableStocks.map((stock, idx) => (
                      <div
                        key={idx}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                        onClick={() => handleAddToWatchlist(stock)}
                      >
                        {stock.name} ({stock.symbol})
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-3 text-sm text-gray-700">
                  {watchlist.length === 0 && <li>No items yet.</li>}
                  {watchlist.map((item, idx) => {
                    const priceData = prices.find((p) => p.symbol === item.symbol);
                    const currentPrice = priceData ? priceData.currentPrice : 0;
                    return (
                      <li
                        key={idx}
                        className="flex justify-between items-center relative"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      >
                        <span>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">₹{currentPrice.toFixed(2)}</span>
                          {hoverIndex === idx && (
                            <button
                              className="text-red-500 text-xs px-2 py-1 rounded hover:bg-gray-100"
                              onClick={() => handleRemoveFromWatchlist(item.id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white mt-auto py-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-lg font-semibold">ABOUT FINWISE</h3>
          <p className="text-sm max-w-3xl mx-auto leading-relaxed">
            FinWise is a smart investment and portfolio management platform designed to help users 
            track holdings, generate tax reports, and analyze financial diversification — all in one unified dashboard. 
            This project is built by 
          </p>
          <div className="border-t border-white/40 pt-4 text-sm">
            <p>
              <strong>Created By: Dara Karthikeya, Sahsra Reddy, Mnavitha Reddy, Yagnasree Chowdary</strong>{" "}
              
            </p>
            <p className="mt-1 text-white/80">
              © {new Date().getFullYear()} FinWise — All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

