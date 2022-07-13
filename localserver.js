const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const { MongoClient } = require('mongodb')
var ObjectID = require('mongodb').ObjectID
var mongoose = require('mongoose')
var User = require('./user.model')

// const uri = process.env.MONGODB_URI
const uri = 'mongodb://localhost:27017'
const uri_local = 'mongodb://localhost:27017/babcoin'

const babcoin_db = 'babcoin'
const collection_users = 'users'
const collection_events = 'events'
const collection_userevents = 'userevents'

// use the express-static middleware
app.use(express.static('public'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

//// Users
// B@B Users API
////
app.get('/v1/users', async function (req, res) {
  var db = 'mongodb://localhost:27017/babcoin'
  mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })

  const conSuccess = mongoose.connection
  conSuccess.once('open', (_) => {
    console.log('Database connected:', db)
    //   var user1 = new User ({
    //     first_name: "Alice",
    //     last_name: "Cooper",
    //     email: "alice@berkeley.edu",
    //     wallet_address: "0x329CdCBBD82c934fe32322b423bD8fBd30b4EEB6",
    //     role: "admin"
    //     })

    //     user1.save(function (err, user) {
    //         if (err) return console.error(err);
    //         console.log(user.first_name + " saved to bookstore collection.");
    //     })
  })

  conSuccess.on('error', (err) => {
    console.error('connection error:', err)
  })

  conSuccess.close()
  console.log('success')
})

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


  app.post("/v1/user", async function (req, res) {
    let client;
    let db;
    try {
        // client = await MongoClient.connect(uri, { 
        //     useNewUrlParser: true, 
        //     useUnifiedTopology: true,
        //   });
        client = mongoose.connect(uri_local, { useNewUrlParser: true, useUnifiedTopology: true })

        // db = client.db(babcoin_db);

        const users = client.collection(collection_users);
    
    
        async function getNextSequenceValue() {
            console.log('running...');
            var max_doc_id = await users.findOne({$query:{},$orderby:{_id:-1}});
            console.log('max doc: ' + max_doc_id)
            if (!max_doc_id) {
                return 1;
            }
            return max_doc_id + 1;
          }
    
        const conSuccess = mongoose.connection;
    
      conSuccess.once('open', async function (_) {
        console.log('Database connected')
        var new_id = await getNextSequenceValue()
      var user1 = new User({
        _id: new_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        wallet_address: req.body.wallet_address,
        role: req.body.role,
      })
      await user1.save(function (err, user) {
        if (err) return console.error(err);
        return res.json(user);
      })
      })
    } catch(err) {
      console.log(err);
      return res.json(err);
    }
    finally {
    //   await client.close();
    }
  });

  
// Create a user
// app.post('/v1/user', async function (req, res) {
//     const client = await MongoClient.connect(uri, { 
//         useNewUrlParser: true, 
//         useUnifiedTopology: true,
//       });


//   var db = 'mongodb://localhost:27017/mydata'
//   mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
//   const conSuccess = mongoose.connection
//   async function getNextSequenceValue(sequenceName) {
//     const filter = { _id: sequenceName }
//     console.log('running...')
//     var oldDoc = await conSuccess.collection('users').findOne(filter)
//     const updateDocument = {
//       $set: {
//         sequence_value: parseInt(oldDoc.sequence_value) + 1,
//       },
//     }
//     await conSuccess.collection('users').updateOne(filter, updateDocument)
//     console.log(oldDoc.sequence_value)
//     return oldDoc.sequence_value
//   }

//   conSuccess.once('open', async function (_) {
//     console.log('Database connected:', db)
//     var id_num = await getNextSequenceValue('productid')
//   var user1 = new User({
//     _id: id_num,
//     first_name: req.body.first_name,
//     last_name: req.body.last_name,
//     email: req.body.email,
//     wallet_address: req.body.wallet_address,
//     role: req.body.role,
//   })
//   await user1.save(function (err, user) {
//     if (err) return console.error(err)
//     return res
//   })
//   })
//   return res.json()
// })

// start the server listening for requests
app.listen(9000, function () {
  console.log('Server is running on localhost9000')
})
