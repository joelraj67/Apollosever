// server.js

const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

async function startApolloServer() {
  const app = express();

  // Create an ApolloServer instance and pass schema definitions and resolvers
  const server = new ApolloServer({ typeDefs, resolvers });

  // Start the ApolloServer
  await server.start();

  // Apply ApolloServer middleware to Express
  server.applyMiddleware({ app });

  // Set the port for the server
  const PORT = process.env.PORT || 4000;

  // Start the server
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startApolloServer().catch((err) => {
  console.error('Error starting ApolloServer:', err);
});
