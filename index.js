const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const admin = require("firebase-admin");
const cors = require('cors');
require('dotenv').config();

// camerashop-adminsdk.json

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5000;
//const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.19uqr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];

      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }

  }
  next();
}

async function run(){
  try{
    await client.connect();
    const database = client.db("CameraShop");
    const servicesCollection = database.collection('services');
    const reviewsCollection = database.collection('reviews');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users');

    // GET API
      app.get('/services', async (req, res) => {
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.send(services);
    });
  
    // GET API reviews
      app.get('/reviews', async (req, res) => {
        const cursor = reviewsCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
    });

      // GET Single Service
      app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        console.log('Getting Specific Service', id);
        const query = { _id: ObjectId(id) };
        const service = await servicesCollection.findOne(query);
        res.json(service);
    })
    //POST Orders
    // app.post('/orders', async (req, res) => {

    // })

    //post API
    app.post('/services', async (req, res) => {
      const service  = req.body;
      console.log('hit the post api', service);

      const result = await servicesCollection.insertOne(service);
      console.log(result);
      res.json(result)
  });
    //post API users
    app.post('/users', async (req, res) => {
      const user  = req.body;
      console.log('hit the post api', user);
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result)
  });
  app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
  });
    //post API reviews
    app.post('/reviews', async (req, res) => {
      const reviews  = req.body;
      console.log('hit the post api', reviews);
      const result = await reviewsCollection.insertOne(reviews);
      console.log(result);
      res.json(result)
  });
    //PUT users
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
  });

    app.put('/users/admin', verifyToken,  async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      if (requester) {
          const requesterAccount = await usersCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
              const filter = { email: user.email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
          }
      }
      else {
          res.status(403).json({ message: 'you do not have access to make admin' })
      }

  })
  app.get('/users/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === 'admin') {
        isAdmin = true;
    }
    res.json({ admin: isAdmin });
})
    // DELETE API
    app.delete('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
  })

  }
  finally{
      //await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello hellogh Worldports')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})