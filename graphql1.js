var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const MongoClient = require("mongodb").MongoClient;

const CONNECTION_URL = "mongodb+srv://nhu:aron1903!@denzel-movies-lzipq.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "denzel-movies";
const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./src/imdb');


MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
    if(error) {
        throw error;
    }
    database = client.db(DATABASE_NAME);
    collection = database.collection("denzel");
    console.log("Connected to `" + DATABASE_NAME + "`!");
});



// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
    populate : Int
    movies: [Movie]
  }

  type Movie {
    id : String
    metascore : Int
    rating : Int
    title : String
    year : Int
  }
`);


// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },

  populate: async() => {
    //const movies = await sandbox.movies;
    const DENZEL_IMDB_ID = 'nm0000243';
    const movies = await imdb(DENZEL_IMDB_ID);
    collection = database.collection("denzel");

    await collection.insertMany(movies);
    return collection.countDocuments();
  },

  movies: async() => {
    const random_movie = await collection.aggregate([{$sample: {size : 1}}]).toArray();
    return random_movie;
  }

};


var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
