const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
//const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.19uqr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
  try{
    await client.connect();
    const database = client.db("CameraShop");
    const servicesCollection = database.collection('services');
    const reviewsCollection = database.collection('reviews');
    const ordersCollection = database.collection('orders');
    const usersCollection = database.collection('users');

    console.log('All routes should');
    
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
        console.log('getting specific service', id);
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
    //post API
    app.post('/users', async (req, res) => {
      const user  = req.body;
      console.log('hit the post api', service);

      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result)
  });
    //post API
    app.post('/reviews', async (req, res) => {
      const reviews  = req.body;
      console.log('hit the post api', reviews);

      const result = await reviewsCollection.insertOne(reviews);
      console.log(result);
      res.json(result)
  });
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
  res.send('Hello Worldports')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})