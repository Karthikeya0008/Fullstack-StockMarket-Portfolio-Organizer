import express from "express";
import { db } from "../config/firebase.js"; // ← adjust path if different

const router = express.Router();

// ✅ Get all investments
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("investments").get();
    const investments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});

// ✅ Add a new investment
router.post("/", async (req, res) => {
  try {
    const newInvestment = req.body;
    const docRef = await db.collection("investments").add(newInvestment);
    res.json({ id: docRef.id, ...newInvestment });
  } catch (error) {
    console.error("Error adding investment:", error);
    res.status(500).json({ error: "Failed to add investment" });
  }
});

export default router;
