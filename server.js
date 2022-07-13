const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
var ObjectID = require('mongodb').ObjectID;

const uri = process.env.MONGODB_URI;
const babcoin_db = "babcoin";
const collection_users = "users";
const collection_events = "events";
const collection_userevents = "userevents";

// use the express-static middleware
app.use(express.static("public"));

//// Users
// B@B Users API
////
app.get("/v1/users", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(babcoin_db);
    const users = await db.collection(collection_users).find({}).toArray();
    return res.json(users);
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});
//// Users
// B@B User API
////
app.get("/v1/user/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(babcoin_db);  
    const users = db.collection(collection_users);
    var o_id = req.params.id;
    users.findOne({'_id':o_id})
    .then(function(doc) {
      if(!doc)
        throw new Error('No record found.');
      console.log(doc);
      return res.json(doc);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});

// Get all events a user has gone to
app.get("/v1/userevents/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(babcoin_db);
    var o_id = req.params.id;
    const userevents = db.collection(collection_userevents).find().toArray();
    userevents.find({'user_id':o_id}).then(function(doc) {
      if(!doc)
        throw new Error('No record found.');
      console.log(doc);
      return res.json(doc);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});

// Get specific event object
app.get("/v1/event/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });  
  try {
    const db = client.db(babcoin_db);
    const events = db.collection(collection_events);
    var o_id = req.params.id;
    events.find({'user_id':o_id}).then(function(doc) {
      if(!doc)
        throw new Error('No record found.');
      console.log(doc);
      return res.json(doc);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});

// Get subset of event object for nft metadata
app.get("/v1/nft/:id", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });  
  try {
    const db = client.db(babcoin_db);
    const events = db.collection(collection_events);
    var o_id = req.params.id;
    events.find({'user_id':o_id}).then(function(doc) {
      if(!doc)
        throw new Error('No record found.');
      console.log(doc);
      return res.json(doc);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});

// Get all events
app.get("/v1/events", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });  
  try {
    const db = client.db(babcoin_db);    
    const events = await db.collection(collection_events).find({}).toArray();
    return res.json(events);
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Create a user
app.post("/v1/user", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  const f_name = req.body.first_name;
  const l_name = req.body.last_name;
  const u_email = req.body.email;
  const u_wallet_address = req.body.wallet_address;
  const u_role = req.body.role;

  if(!f_name) {
    return res.json({message: "Missing Required param first_name!"});
  }
  if(!l_name) {
    return res.json({message: "Missing Required param last_name!"});
  }
  if(!u_email) {
    return res.json({message: "Missing Required param email!"});
  }
  if(!u_wallet_address) {
    return res.json({message: "Missing Required param wallet_address!"});
  }
  if(!u_role) {
    return res.json({message: "Missing Required param role!"});
  }
  var userObj = { first_name: f_name, last_name: l_name, email: u_email, wallet_address: u_wallet_address, role: u_role };

  try {
    const db = client.db(babcoin_db);
    const users = db.collection(collection_users);
    users.insertOne(userObj, function(err, res) {
      if (err) throw err;
      return res.json(res);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await db.close();
    await client.close();
  }
});

// Create an event
app.post("/v1/event", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  const start_ts = req.body.start_timestamp;
  const end_ts = req.body.end_timestamp;
  const e_name = req.body.name;
  const e_type = req.body.type;
  const e_role = req.body.role;
  const e_image_url = req.body.image_url;
  const e_qrcode_url = req.body.qrcode_url;
  
  if(!start_ts) {
    return res.json({message: "Missing Required param start_timestamp!"});
  }
  if(!end_ts) {
    return res.json({message: "Missing Required param end_timestamp!"});
  }
  if(!e_name) {
    return res.json({message: "Missing Required param name!"});
  }
  if(!e_type) {
    return res.json({message: "Missing Required param type!"});
  }
  if(!e_role) {
    return res.json({message: "Missing Required param role!"});
  }
  if(!e_image_url) {
    return res.json({message: "Missing Required param image_url!"});
  }
  if(!e_qrcode_url) {
    return res.json({message: "Missing Required param qrcode_url!"});
  }
  var eventObj = { start_timestamp: start_ts, end_timestamp: end_ts, name: e_name, type: e_type, role: e_role, image_url: e_image_url, qrcode_url: e_qrcode_url };

  try {
    const db = client.db(babcoin_db);
    const events = db.collection(collection_events);
    events.insertOne(eventObj, function(err, res) {
      if (err) throw err;
      return res.json(res);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});

// Create an event
app.post("/v1/userevent", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  const e_id = req.body.event_id;
  const u_id = req.body.user_id;
  
  if(!e_id) {
    return res.json({message: "Missing Required param event_id!"});
  }
  if(!u_id) {
    return res.json({message: "Missing Required param user_id!"});
  }
  var usereventObj = { event_id: e_id, user_id: u_id };
  try {
    const db = client.db(babcoin_db);
    const userevents = db.collection(collection_userevents);
    userevents.insertOne(usereventObj, function(err, res) {
      if (err) throw err;
      return res.json(res);
    });
  } catch(err) {
    console.log(err);
    return res.json(err);
  }
  finally {
    await client.close();
  }
});
// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));
