// backend/index.js
import express from "express";
import cors from "cors";
import axios from "axios";
import { db } from "./config/firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Test Firebase connection

app.get("/test-firebase", async (req, res) => {
  try {
    const testRef = db.collection("test").doc("check");
    await testRef.set({ message: "Firebase connected successfully!" });
    const snapshot = await testRef.get();
    res.json({ success: true, data: snapshot.data() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Investments - Firestore version
app.get("/investments", async (req, res) => {
  try {
    const snapshot = await db.collection("investments").get();
    const investments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(investments);
  } catch (err) {
    console.error("Error fetching investments:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new investment (with Yahoo Finance fetch)
app.post("/investments", async (req, res) => {
  try {
    const { symbol, buyPrice, quantity } = req.body;
    if (!symbol || !buyPrice || !quantity)
      return res
        .status(400)
        .json({ success: false, message: "symbol, buyPrice, quantity required" });

    // 🔹 Fetch stock price from Yahoo Finance
    const options = {
      method: "GET",
      url: "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes",
      params: { symbols: symbol },
      headers: {
        "X-RapidAPI-Key": "9b75043a0amsh6939bb61edcf7f8p1d7777jsn12e501439f05",
        "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    const stock = response.data.quoteResponse.result[0];

    const investmentData = {
      name: stock.shortName || symbol,
      symbol,
      buyPrice: Number(buyPrice),
      quantity: Number(quantity),
      currentPrice: stock.regularMarketPrice || 0,
      addedOn: new Date().toISOString(),
    };

    const docRef = await db.collection("investments").add(investmentData);
    res.json({ success: true, id: docRef.id, data: investmentData });
  } catch (err) {
    console.error("Error adding investment:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/investments/:id", async (req, res) => {
  try {
    await db.collection("investments").doc(req.params.id).delete();
    res.json({ success: true, message: "Investment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Watchlist - Firestore version
app.get("/watchlist", async (req, res) => {
  try {
    const snapshot = await db.collection("watchlist").get();
    const watchlist = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/watchlist", async (req, res) => {
  try {
    const { symbol, name, currentPrice } = req.body;
    if (!symbol)
      return res
        .status(400)
        .json({ success: false, message: "Symbol required" });

    const docRef = await db.collection("watchlist").add({
      symbol,
      name: name || symbol,
      currentPrice: Number(currentPrice || 0),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/watchlist/:id", async (req, res) => {
  try {
    await db.collection("watchlist").doc(req.params.id).delete();
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/prices", async (req, res) => {
  try {
    const symbols = [
      "^NSEI",
      "^BSESN",
      "RELIANCE.NS",
      "TATAMOTORS.NS",
      "INFY.NS",
      "HDFCBANK.NS",
      "ICICIBANK.NS",
      "SBIN.NS",
      "LT.NS",
      "WIPRO.NS",
      "MARUTI.NS",
      "HINDUNILVR.NS",
      "BAJFINANCE.NS",
      "KOTAKBANK.NS",
      "TCS.NS",
      "ULTRACEMCO.NS",
      "ITC.NS",
      "ASIANPAINT.NS",
      "AXISBANK.NS",
      "ADANIENT.NS",
      "TECHM.NS",
      "HDFCLIFE.NS",
      "POWERGRID.NS",
      "COALINDIA.NS",
      "NTPC.NS",
      "JSWSTEEL.NS",
      "BPCL.NS",
      "ONGC.NS",
      "HEROMOTOCO.NS",
      "SUNPHARMA.NS",
      "DIVISLAB.NS",
    ];

    const response = await axios.get(
      "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes",
      {
        params: { symbols: symbols.join(",") },
        headers: {
          "X-RapidAPI-Key": "9b75043a0amsh6939bb61edcf7f8p1d7777jsn12e501439f05",
          "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        },
      }
    );

    const results = response.data.quoteResponse.result.map((item) => ({
      name: item.shortName,
      symbol: item.symbol,
      currentPrice: item.regularMarketPrice,
    }));

    res.json(results);
  } catch (error) {
    console.error("Error fetching prices:", error.message);
    res.json([
      { name: "NIFTY 50", symbol: "^NSEI", currentPrice: 24741 },
    ]);
  }
});

app.get("/", (req, res) => {
  res.send("FinWise backend running with Firestore");
});

export default app;
