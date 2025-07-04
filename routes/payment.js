const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");

router.post("/create-order", async (req, res) => {
  // You can use req.body to get form data if you use express.urlencoded
  const amount = 50000; // Replace with your logic (e.g., calculate from cart)
  const options = {
    amount: amount, // in paise
    currency: "INR",
    receipt: "order_rcptid_" + Math.random().toString(36).substring(7),
  };
  try {
    const order = await razorpay.orders.create(options);
    res.json({ order_id: order.id, amount: order.amount });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
