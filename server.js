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
app.get("/v1/user/:id", async function (req, res) {
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  
  try {
    await client.connect();

    const database = client.db(db);
    const users = database.collection(collection_users);
    var o_id = new ObjectID(req.params.id);
    users.findOne({_id:o_id})
    .exec(function(err,data){
      if (err){
        console.log(err);
      } else {
        return res.json(data);
      }
    })
  } catch(err) {
    console.log(err);
  }
  finally {
    await client.close();
  }
});

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

// start the server listening for requests
app.listen(process.env.PORT || 3000, 
	() => console.log("Server is running..."));
