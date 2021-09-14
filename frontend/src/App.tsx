import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createSignal,
  lazy,
  useContext,
} from "solid-js";
import { Router, Routes, Route } from "solid-app-router";
// import { Client, createClient } from "@urql/core";
import {
  ApolloClient,
  gql,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client/core";
import { WebSocketLink } from "apollo-link-ws";
import { HttpLink } from "apollo-link-http";
import { ApolloLink, split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";

const httpLink = new HttpLink({
  uri: "http://localhost:4000", // use https for secure endpoint
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000", // use wss for a secure endpoint
  options: {
    reconnect: true,
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const def = getMainDefinition(query);
    if (def.kind === "OperationDefinition") {
      return def.operation === "subscription";
    } else {
      return false;
    }
  },
  wsLink,
  httpLink
);

const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: link as any,
  cache: new InMemoryCache(),
});

const Home = lazy(() => import("./views/Home"));
const About = lazy(() => import("./views/About"));
const Chat = lazy(() => import("./views/Chat"));

export const GraphqlContext =
  createContext<Accessor<ApolloClient<NormalizedCacheObject>>>();

const App: Component = () => {
  const [client] = createSignal(apolloClient);

  createEffect(() => console.log(client()));

  return (
    <GraphqlContext.Provider value={client}>
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </Router>
    </GraphqlContext.Provider>
  );
};

export default App;

export function useClient() {
  return useContext(GraphqlContext);
}
