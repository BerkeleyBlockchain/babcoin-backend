require("dotenv").config();
const express = require("express");
const QRCode = require("qrcode");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const Event = require("../models/Event");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const BabCoinContract = require("../contracts/BabCoinContract.json");

const router = express.Router();

// Get specific event object, or many objects
router.get("/", async function (req, res) {
  const { id, type, startTime, endTime } = req.query;
  try {
    let filter = {};
    if (id) {
      filter._id = id;
    }
    if (type) {
      filter.type = type;
    }
    if (startTime) {
      filter.startTimestamp = { $gte: startTime };
    }
    if (endTime) {
      filter.endTimestamp = { $lte: endTime };
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
    startYear,
    endYear,
    startMonth,
    endMonth,
    startDay,
    endDay,
    startHour,
    endHour,
    startMinute,
    endMinute,
    name,
    type,
    location,
    description,
    password,
    nftArtUrl,
  } = req.body;

  let { startTimestamp, endTimestamp } = req.body;

  if (!name || !type || !password || !nftArtUrl || !location) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  console.log(req.body);

  // if (
  //   !startTimestamp &&
  //   (!startYear || !startMonth || !startDay || !startHour || startMinute)
  // ) {
  //   return res.status(400).json({
  //     startTime: "Missing start time",
  //   });
  // }

  // if (
  //   !endTimestamp &&
  //   (!endYear || !endMonth || !endDay || !endHour || !endMinute)
  // ) {
  //   return res.status(400).json({
  //     startTime: "Missing end time",
  //   });
  // }

  if (!startTimestamp) {
    startTime = new Date(
      startYear,
      startMonth - 1,
      startDay,
      startHour,
      startMinute
    );
    startTimestamp = startTime.getTime() + 25200000;
  }

  if (!endTimestamp) {
    endTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);
    endTimestamp = endTime.getTime() + 25200000;
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

    if (!event) {
      return res.status(200).json({ description: "", id, name: "", image: "" });
    }

    // External websites are expecting a particular format
    let externalEvent = {
      description: event.description,
      id: event.nftId,
      name: event.name,
      image: event.nftArtUrl,
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
    let now = Date.now();
    // Earlier than the start
    if (now < event.startTimestamp) {
      let ret = {
        errorMessage: "Event has yet to start",
      };
      return res.status(400).json(ret);
    }
    // Earlier than the end
    if (now < event.endTimestamp) {
      let ret = {
        errorMessage: "Event has yet to end",
      };
      return res.status(400).json(ret);
    }
    // 24 hrs in ms
    let buffer = 86400000;
    let expirationTime = event.endTimestamp + buffer;
    if (now < expirationTime) {
      let ret = {
        errorMessage: "Event expiration buffer time has yet to end",
      };
      return res.status(400).json(ret);
    }

    if (event.isMinted) {
      return res.status(400).json({ error: "Event has already been minted" });
    }

    let records = await UserEvent.find({ eventId: event._id });
    let promises = records.map(async (record) => {
      let user = await User.findById(record.userId);
      return user.address;
    });
    let users = await Promise.all(promises);

    console.log(users);

    const provider = new HDWalletProvider({
      privateKeys: [process.env.KEYS],
      providerOrUrl: process.env.RPC,
    });
    const web3 = new Web3(provider);
    const contract = new web3.eth.Contract(
      BabCoinContract.abi,
      process.env.ADDRESS
    );

    const gasPrice = await web3.eth.getGasPrice();
    await contract.methods
      .airdrop(
        users,
        nftId,
        1,
        0x00000000000000000000000000000000000000000000000000000000000000
      )
      .send({ from: process.env.ADMIN_ADDRESS, gasPrice });

    // console.log(amount);
    event.isMinted = true;

    await event.save();

    return res.status(200).json({ success: true });
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
    if (!event) {
      return res.status(400).json({
        error: "No Event found",
      });
    }
    let userEvents = await UserEvent.find({ eventId: event._id });
    let users = [];
    // Get all users that attended that event
    for (let userEvent of userEvents) {
      let user = await User.findOne({ _id: userEvent.userId });
      if (!user) {
        return res.status(400).json({
          error: "No User found",
        });
      }
      users.push(user);
    }

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
