const express = require("express");
const Event = require("../models/Event");

require("dotenv").config();

const router = express.Router();
const QRCode = require("qrcode");

// Get specific event object, or many objects
router.get("/", async function (req, res) {
  const { id, type } = req.query;
  try {
    let filter = {};
    if (id) {
      filter._id = id;
    }
    if (type) {
      filter.type = type;
    }
    let events = await Event.find(filter);
    return res.status(200).json(events);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/", async function (req, res) {
  const {
    startTimestamp,
    endTimestamp,
    name,
    type,
    location,
    description,
    password,
  } = req.body;

  if (!startTimestamp || !endTimestamp || !name || !type || !password) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let eventNfts = await Event.find().sort({ nftId: -1 }).limit(1);

    let nftId = 0;
    if (eventNfts && eventNfts.length > 0) {
      nftId = eventNfts[0]["nftId"];
    }
    nftId = nftId + 1;

    let newEvent = new Event({
      startTimestamp,
      endTimestamp,
      password,
      name,
      type,
      nftId,
      description,
      location,
    });

    await newEvent.save();

    const imageUrl = `${process.env.FRONTEND}/events/${newEvent._id}/q`;

    var opts = {
      errorCorrectionLevel: "H",
      type: "image/jpeg",
      quality: 0.3,
      margin: 1,
      color: {
        dark: "#010599FF",
        light: "#FFBF60FF",
      },
    };

    let qrCodeSrc = await QRCode.toDataURL(imageUrl, opts);
    newEvent.qrCodeSrc = qrCodeSrc;
    newEvent.imageUrl = imageUrl;
    await newEvent.save();
    return res.status(200).json(newEvent);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/nft/:id", async function (req, res) {
  const { id } = req.params;
  try {
    let event = await Event.findOne({ nftId: id });
    return res.status(200).json(event);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
