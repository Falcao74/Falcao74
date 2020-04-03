const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');


const app = express();

const eventos = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    
    schema: buildSchema(`

        type Event{
            _id: ID!
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        input EventInput {
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuerry {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput : EventInput ) : Event

        }

        schema {
            query: RootQuerry
            mutation: RootMutation
        }
    
    
    `),
    rootValue: {
        events : ()=>{
            return eventos;

        },
        createEvent: (args) => {
            const event = {
                _id: Math.random().toString(),
                ...args.eventInput 
                //Substiuiu todo código abaixo
                // name: args.eventInput.name,
                // description: args.eventInput.description,
                // price: +args.eventInput.price,
                // date: args.eventInput.date
            };
            eventos.push(event);
            return event;
        },
        
    },
    graphiql: true
})
);

app.listen(3000);
