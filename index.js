const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vzza0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookCollection = client.db(process.env.DB_NAME).collection("books");
    const orderCollection = client.db(process.env.DB_NAME).collection("orders");

    //add order
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //get order filtered by email
    app.get('/userOrders', (req, res) => {
        const email = req.headers.email;
        orderCollection.find({ "user.email": email })
            .toArray((err, docs) => {
                res.send(docs)
            })
    })

    //add book
    app.post('/addBook', (req, res) => {
        const book = req.body;
        bookCollection.insertOne(book)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    //get all books
    app.get('/allBooks', (req, res) => {
        bookCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
            })
    });

    //get single book
    app.get('/singleBook/:id', (req, res) => {
        const id = req.params.id;
        bookCollection.find({ _id: ObjectId(id) })
            .toArray((err, docs) => {
                res.send(docs[0])
            })
    });



    //Update Book
    app.patch('/updateBook', (req, res) => {
        const { id, name, author, cover, price } = req.body;

        bookCollection.updateOne({ _id: ObjectId(id) }, {
            $set: {
                name: name,
                author: author,
                price: price,
                cover: cover
            }
        })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
            .catch(err => res.send(err))
    });

    //delete Book
    app.delete('/deleteBook/:id', (req, res) => {
        const id = req.params.id;
        bookCollection.deleteOne({ _id: ObjectId(id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
            .catch(err => res.send(err))
    });

});



app.get('/', (req, res) => {
    res.send('Welcome to server')
})

app.listen(process.env.PORT || 5000);