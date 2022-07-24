const express = require("express");
const Event = require("../models/Event");

require("dotenv").config();

const router = express.Router();

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
    return res.status(200).json(err);
  }
});

router.post("/", async function (req, res) {
  const { startTimestamp, endTimestamp, name, type, imageUrl, qrCodeUrl } =
    req.body;

  if (
    !startTimestamp ||
    !endTimestamp ||
    !name ||
    !type ||
    !imageUrl ||
    !qrCodeUrl
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let eventNfts = await Event.find().sort({nftId:-1}).limit(1);
    let nftId = 0;

    if(eventNfts && eventNfts.length > 0) {
      nftId = eventNfts[0]["nftId"];
    }
    nftId = nftId + 1;

    let new_event = new Event({
      startTimestamp,
      endTimestamp,
      name,
      type,
      imageUrl,
      qrCodeUrl,
      nftId,
    });
    await new_event.save();
    return res.status(200).json(new_event);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
});

router.get("/nft/:id", async function (req, res) {
  const { id } = req.params;
  try {
    let event = await Event.findOne({ nftId: id });
    return res.status(200).json(event);
  } catch (err) {
    console.log(err);
    return res.status(200).json(err);
  }
});

module.exports = router;
