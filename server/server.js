const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

mongoose.connect('mongodb://127.0.0.1:27017/Books', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    genre: String,
});

const BookModel = mongoose.model('Book', bookSchema);

const typeDefs = `
  type Book {
    id: ID!
    title: String!
    author: String!
    genre: String!
  }

  type Query {
    books: [Book]
  }

  type Mutation {
    addBook(title: String!, author: String!, genre: String!): Book
    deleteBook(id: ID!): Book
  }
`;

const resolvers = {
    Query: {
        books: async () => {
            try {
                const books = await BookModel.find();
                return books;
            } catch (error) {
                console.error('Error fetching books:', error);
                throw error;
            }
        },
    },
    Mutation: {
        addBook: async (_, { title, author, genre }) => {
            try {
                const newBook = await BookModel.create({ title, author, genre });
                return newBook;
            } catch (error) {
                console.error('Error adding book:', error);
                throw error;
            }
        },
        deleteBook: async (_, { id }) => {
            try {
                const deletedBook = await BookModel.findByIdAndDelete(id);
                return deletedBook;
            } catch (error) {
                console.error('Error deleting book:', error);
                throw error;
            }
        },
    },
};

const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    '/graphql',
    graphqlHTTP({
        schema: executableSchema,
        graphiql: true,
    })
);

app.listen(port, () => {
    console.log(`Running a server at http://localhost:${port}`);
});
