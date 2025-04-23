const { MongoClient, ServerApiVersion } = require("mongodb");

// const uri = `mongodb+srv://doktorlich:${process.env.DB_PASSWORD}@cluster0.fehgica.mongodb.net/mydatabase?retryWrites=true&w=majority`;
const uri = `mongodb+srv://doktorlich:${process.env.DB_PASSWORD}@cluster0.fehgica.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

let _db;

const mongoConnect = callback => {
    MongoClient.connect(uri, options)
        .then(client => {
            console.log("Connected to MongoDB");
            _db = client.db("Cluster0");
            callback();
        })
        .catch(error => {
            console.error("Connection failed", error);
            throw error;
        });
};
const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found";
};

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;
