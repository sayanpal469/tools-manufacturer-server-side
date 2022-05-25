const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

// Middleware
app.use(express.json())
app.use(cors())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.laxvf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run () {
    try{
        await client.connect()
        const toolsCollection = client.db('Jantrick').collection('tools')
        const ordersCollection = client.db('Jantrick').collection('myOrders')
        const reviewsCollection = client.db('Jantrick').collection('reviews')

        app.get('/tools', async (req, res) => {
            const query = {};
            const tools = await toolsCollection.find(query).toArray();
            res.send(tools);
        })

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const tool = await toolsCollection.findOne(query);
            res.send(tool);
        })

        app.post('/orders', async (req, res) => {
            const myOrders = req.body;
            const result = await ordersCollection.insertOne(myOrders);
            res.send(result);
        })

        app.get('/orders', async(req, res) => {
            const query = {};
            const myOrders = await ordersCollection.find(query).toArray();
            res.send(myOrders);
        })

        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const query = {};
            const reviews = await reviewsCollection.find(query).toArray()
            res.send(reviews)
        })

        app.post('/reviews', async (req, res) => {
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