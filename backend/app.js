const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema'); 
const app = express();
const port = 5000;

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true, 
}));

const cors = require('cors');
app.use(cors());


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
});
