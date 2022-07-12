const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
var ObjectID = require('mongodb').ObjectID;

const uri = process.env.MONGODB_URI;
const db = "babcoin";
const collection_users = "users";
const collection_events = "events";
console.log("Server Deployed!");

// use the express-static middleware
app.use(express.static("public"));

// B@B User API
app.get("/v1/users", async function (req, res) {
  const client = await MongoClient.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });
  try {
    const db = client.db(db);
    const users = await db.collection(collection_users).find({}).toArray();
    return res.json(users);
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

app.get("/v1/user/:id", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db(db);
    const users = database.collection(collection_users);
    var o_id = new ObjectID(req.params.id);
    users.findOne({'_id':o_id})
    .then(function(doc) {
      if(!doc)
        throw new Error('No record found.');
      console.log(doc);
      return res.json(doc);
    });
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Get all events a user has gone to
app.get("/v1/userevents/:id", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db(db);
    const users = database.collection(collection_users).find().toArray();
    return res.json(users);
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Get specific event object
app.get("/v1/event/:id", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('sample_mflix');
    const collection = database.collection('movies');
    const movie = await cursor.next();

    return res.json(movie);
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Get subset of event object for nft metadata
app.get("/v1/nft/:id", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db('sample_mflix');
    const collection = database.collection('movies');
    const movie = await cursor.next();

    return res.json(movie);
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Get all events
app.get("/v1/events", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db(db);
    const events = database.collection(collection_users).find().toArray();
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
  try {
    await client.connect();
    // Proper return
    return res.json({});
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// Create an event
app.post("/v1/event", async function (req, res) {
  try {
    await client.connect();
    // Proper return
    return res.json({});
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));
