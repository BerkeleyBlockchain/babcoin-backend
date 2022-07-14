const express = require("express");
const UserEvent = require("../models/UserEvent");
const User = require("../models/User");
const Event = require("../models/Event");

require("dotenv").config();

const router = express.Router();

//// Users
// B@B Users API
////

router.get("/", async function (req, res) {
  const { id, address } = req.query;

  try {
    let filter = {};
    if (id) {
      filter.id = id;
    }
    if (address) {
      filter.address = address;
    }

    let users = await User.find(filter);
    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

// Get all event ids a user has been to
router.get("/events", async function (req, res) {
  const { address } = req.query;
  try {
    let user = UserEvent.findOne({ address });
    if (!user) throw new Error("No record found.");

    let events = await UserEvent.find({ user_id: user._id });

    return res.status(200).json(events);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/newUser", async function (req, res) {
  const { firstName, lastName, email, address, role } = req.body;
  console.log(req.body);

  if (!firstName || !lastName || !email || !address || !role) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    var new_user = new User({
      firstName,
      lastName,
      email,
      address,
      role,
    });
    await new_user.save();
    return res.status(200).json(new_user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

router.post("/attendEvent", async function (req, res) {
  const { address, eventId } = req.body;

  try {
    let user = User.findOne({ address });
    if (!user) throw new Error("No user found.");

    let event = Event.findOne({ _id: eventId });
    if (!event) throw new Error("No event found.");

    var newUserEvent = new UserEvent({
      userId: user._id,
      eventId,
    });
    await newUserEvent.save();
    return res.status(200).json(newUserEvent);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

module.exports = router;
