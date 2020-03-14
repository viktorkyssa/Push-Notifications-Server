const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const key = require('./key.json');
const app = express();
const port = 5000;
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const mongoClient = MongoClient(url, {useNewUrlParser: true});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/show', (req, res) => {

    webpush.setVapidDetails(
        'mailto: vkibank@gmail.com', 
        key.public, 
        key.private
    );

     mongoClient.connect(function(err, client) {
        const db = client.db('notificationsdb');
        const collection = db.collection('subscriptions');
        collection.find().toArray().then(function(items) {
            items.forEach(item => {
                let pushConfig = {
                    endpoint: item.endpoint,
                    keys: {
                        auth: item.keys.auth,
                        p256dh: item.keys.p256dh
                    }
                };

                webpush.sendNotification(pushConfig, JSON.stringify({title: 'New Post', content: 'New Post Added!!!'}))
                        .catch(function(error) {
                            console.log(error);
                        });

                res.status(201).json(item);
            });
        }).catch(function (colerror) {
            console.log(colerror);
        });
        
    });

    // res.status(201).json({});
});

app.post('/subscriptions', (req, res) => {
    let subscription = req.body;
    console.log(subscription);

    mongoClient.connect(function(err, client) {
        const db = client.db('notificationsdb');
        const collection = db.collection('subscriptions');
        if(subscription) {
            collection.insertOne(subscription, function(error, result) {
                if(err) {
                    return console.log(err);
                }
            });
        }
        
        collection.find().toArray().then(function(items) {
            console.log(items);
        }).catch(function (colerror) {
            console.log(colerror);
        });
        
    });

    res.status(201).json(subscription);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});