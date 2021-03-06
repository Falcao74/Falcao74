const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const Event = require('./models/event');
const User = require('./models/users');

const Schema = mongoose.Schema;

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({

    schema: buildSchema(`

        type Event {
            _id: ID!
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input EventInput {
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuerry {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput : EventInput ) : Event
            createUser(userInput : UserInput) : User

        }

        schema {
            query: RootQuerry
            mutation: RootMutation
        }
    
    
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {
                    return events.map(event => {
                        return { ...event._doc };
                    })
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });

        },
        createEvent: (args) => {

            const event = new Event({
                name: args.eventInput.name,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            });
            return event.save()
                .then(result => {
                    return { ...result._doc };
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });

        },
        createUser: (args) => {
            return User.findOne({ email: args.userInput.email }).then(user => {
                if (user) {
                    throw new Error('Usuário já existe');
                }
                return bcrypt
                    .hash(args.userInput.password, 12)
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save()
                            .then(result => {
                                return { ...result._doc, password: null };
                            })
                            .catch(err => {
                                console.log(err);
                                throw err;
                            });
                    })
                    .catch(err => {
                        throw err;
                    });
            });

        }

    },
    graphiql: true
})
);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-anhyt.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, {useNewUrlParser: true})
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });

