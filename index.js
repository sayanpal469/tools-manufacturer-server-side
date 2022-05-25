const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { use } = require('express/lib/application');
const port = process.env.PORT || 5000;
require('dotenv').config()

// Middleware
app.use(express.json())
app.use(cors())

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.laxvf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run () {
    try{
        await client.connect()
        const toolsCollection = client.db('Jantrick').collection('tools')
        const userCollection = client.db('Jantrick').collection('user')
        const ordersCollection = client.db('Jantrick').collection('myOrders')
        const reviewsCollection = client.db('Jantrick').collection('reviews')

        app.put('/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            console.log(user);
            const filter = {email: email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter,updateDoc,options)
            const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
            console.log(token, result);
            res.send({result,token})
        })

        app.get('/user', verifyJWT, async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users)
        })

        app.get('/tools', verifyJWT, async (req, res) => {
            const query = {};
            const tools = await toolsCollection.find(query).toArray();
            res.send(tools);
        })

        app.get('/tools/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const tool = await toolsCollection.findOne(query);
            res.send(tool);
        })

        app.post('/orders', verifyJWT, async (req, res) => {
            const myOrders = req.body;
            const result = await ordersCollection.insertOne(myOrders);
            res.send(result);
        })

        app.get('/orders', verifyJWT, async(req, res) => {
            const query = {};
            const myOrders = await ordersCollection.find(query).toArray();
            res.send(myOrders);
        })

        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/reviews', verifyJWT, async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray()
            res.send(reviews)
        })

        app.post('/reviews', verifyJWT, async (req, res) => {
            const addedReview = req.body;
            const result = await reviewsCollection.insertOne(addedReview)
            res.send(result)
        })
    }
    finally{}
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Jantrick')
})

app.listen(port, () => {
    console.log('Server is running');
})