const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginDrainHttpServer,
  gql,
} = require("apollo-server-core");
const express = require("express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { PubSub, withFilter } = require("graphql-subscriptions");

const data = require("./data");

const pubsub = new PubSub();

let users = data.users;
let messages = data.messages;
let channels = data.channels;

const typeDefsString = fs.readFileSync("../schema.graphql", "utf-8").toString();

const typeDefs = gql`
  ${typeDefsString}
`;

const getUser = (userId) => users.find((user) => user.id === userId);
const getChannel = (channelId) => {
  return {
    ...channels.find((channel) => channel.id === channelId),
  };
};

const getMessagesForChannel = (channelId) =>
  messages
    .filter((message) => message.channel === channelId)
    .map((message) => {
      return {
        ...message,
        from: getUser(message.from),
        channel: getChannel(message.channel),
      };
    });

const resolvers = {
  Query: {
    channel: (_, { channelId }, context, info) => {
      let channel = channels.find((channel) => channel.id === channelId);
      if (channel !== undefined) {
        return {
          ...channel,
          messages: getMessagesForChannel(channelId),
        };
      }
    },
    user: (_, { userId }, context, info) => getUser(userId),
    channels: () => channels,
    users: () => users,
    messages: () =>
      messages.map((message) => {
        return {
          ...message,
          from: getUser(message.from),
          channel: getChannel(message.channel),
        };
      }),
  },
  Mutation: {
    addUser: (_, { name }) => {
      if (users.find((user) => user.name === name) === undefined) {
        const user = { name, id: uuidv4() };
        users.push(user);
        return user;
      }
    },
    addChannel: (_, { name }) => {
      if (channels.find((channel) => channel.name === name) === undefined) {
        const channel = { name, id: uuidv4() };
        channels.push(channel);
        return { ...channel, messages: [] };
      }
    },
    addMessage: (_, { message, from, channelId }) => {
      if (channels.find((channel) => channel.id === channelId) !== undefined) {
        const m = { message, from, channel: channelId, id: uuidv4() };
        messages.push(m);
        const full_message = {
          ...m,
          from: getUser(from),
          channel: getChannel(channelId),
        };
        pubsub.publish("MESSAGE_SENT", { message: full_message });
        return full_message;
      }
    },
    removeUser: (_, { id }) => {
      let user = users.find((user) => user.id === id);
      if (user !== undefined) {
        users.splice(users.indexOf(user), 1);
      }
      return user;
    },
    removeChannel: (_, { id }) => {
      let channel = channels.find((channel) => channel.id === id);
      const removed_messages = messages.filter(
        (message) => message.channel === id
      );
      if (channel !== undefined) {
        channels.splice(channels.indexOf(channel), 1);
        messages = messages.filter((message) => message.channel !== id);
      }
      return { ...channel, messages: removed_messages };
    },
    removeMessage: (_, { id }) => {
      const message = messages.find((message) => message.id === id);
      if (message !== undefined) {
        messages.splice(messages.indexOf(message), 1);
      }
      return {
        ...message,
        from: getUser(message.from),
        channel: getChannel(message.channel),
      };
    },
  },
  Subscription: {
    message: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["MESSAGE_SENT"]),
        (payload, variables) => {
          return payload.message.channel.id === variables.channelId;
        }
      ),
    },
  },
  Channel: {
    messages: ({ id }) => getMessagesForChannel(id),
  },
};

async function startApolloServer(typeDefs, resolvers) {
  // Required logic for integrating with Express
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
  });

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: "/",
  });

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  // Modified server startup
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(
    `🚀 Query endpoint ready at http://localhost:4000${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscription endpoint ready at http://localhost:4000${server.graphqlPath}`
  );
}

startApolloServer(typeDefs, resolvers);

// const server = new ApolloServer({ typeDefs, resolvers });

// server.listen().then(({ url }) => {
//   console.log(`🚀  Server ready at ${url}`);
// });
