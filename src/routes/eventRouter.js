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
    nftArtUrl
  } = req.body;

  if (!startTimestamp || !endTimestamp || !name || !type || !password || !nftArtUrl || !location) {
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

    let isMinted = false;
    let newEvent = new Event({
      startTimestamp,
      endTimestamp,
      password,
      name,
      type,
      nftId,
      description,
      location,
      nftArtUrl,
      isMinted,
      location
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

    // External websites are expecting a particular format
    let externalEvent = {
      "description": event.description,
      "id": event.nftId,
      "name": event.name,
      "image": event.nftArtUrl,
    };
    return res.status(200).json(externalEvent);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/nft", async function (req, res) {
  const { nftId } = req.body;
  if (!nftId) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let event = await Event.findOne({ nftId: nftId });

    // TODO move logic to front end?
    let now =  Date.now();
    // Earlier than the start
    if(now < event.startTimestamp) {
      let ret = {
        errorMessage: "Event has yet to start"
      };
      return res.status(400).json(ret);
    }
    // Earlier than the end
    if(now < event.endTimestamp) {
      let ret = {
        errorMessage: "Event has yet to end"
      };
      return res.status(400).json(ret);
    }
    // 24 hrs in ms
    let buffer = 86400000;
    let expirationTime = event.endTimestamp + buffer;
    if(now < expirationTime) {
      let ret = {
        errorMessage: "Event expiration buffer time has yet to end"
      };
      return res.status(400).json(ret);
    }
    
    // Update the minted event
    event.hasMinted = true;
    await event.save();

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.get("/users", async function (req, res) {
  const { nftId } = req.query;

  if (!nftId) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }
  try {
    let event = await Event.findOne({ nftId: nftId });
    if (!event) throw new Error("No event found.");

    let userEvents = await UserEvent.find({ eventId: event._id });
    let users = [];
    // Get all users that attended that event
    for (userEvent in userEvents){
      let user = await User.findOne({ _id: userEvent.userId });
      if (!user) throw new Error("No user found.");
      users.append(user);
    }

    // Event has ended.
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
