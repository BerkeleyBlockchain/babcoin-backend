const express = require("express");
const Requirement = require("../models/Requirement");

require("dotenv").config();

const router = express.Router();

// Get specific event object, or many objects
router.get("/", async function (req, res) {
  const { type } = req.query;

  try {
    let requirements = await Requirement.find(type ? { type } : {});
    return res.status(200).json(requirements);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/", async function (req, res) {
  const { type, amount } = req.body;

  if (!type || !amount) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let requirement = new Requirement({ type, amount });
    await requirement.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
