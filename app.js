const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const CONNECTION_URL = "mongodb+srv://nhu:aron1903!@denzel-movies-lzipq.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel-movies";
const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./src/imdb');

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("denzel");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});


app.get("/movies/populate", async(request, response) => {
  //const movies = await sandbox.movies;
  const movies = await imdb(DENZEL_IMDB_ID);
  collection = database.collection("denzel");
  collection.insertMany(movies, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result.result);
  });
});


app.get("/movies", async (request, response) => {
    await collection.aggregate([
            {$match: {metascore: {$gte: 70}}},
            {$sample: {size: 1}}
        ]).toArray(function(err, docs){
        response.send(docs);
    });
});

app.get("/movies/:id", async (request, response) => {
    collection.findOne({ "id": request.params.id }, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies/search", async (request, response) => {
    var par1 = request.query.limit;
    var par2 = request.query.metascore;
    await collection.aggregate([
            {$match: {metascore: {$gte: Number(par2)}}},
            {$sort: {metascore: -1}},
            {$limit: Number(par1)}
        ]).toArray(function(err, docs){
        response.send(docs);
    });
});
