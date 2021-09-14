import { gql } from "@apollo/client/core";
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from "solid-js";
import { useClient } from "../App";
import { GetChannel } from "./__generated__/GetChannel";
import { GetChannels } from "./__generated__/GetChannels";
import {
  SentMessages,
  SentMessages_message as Message,
} from "./__generated__/SentMessages";
import { GetUsers, GetUsers_users as User } from "./__generated__/GetUsers";

const GET_CHANNELS = gql`
  query GetChannels {
    channels {
      id
      name
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`;

const GET_CHANNEL = gql`
  query GetChannel($channelId: String!) {
    channel(channelId: $channelId) {
      messages {
        message
        id
        from {
          name
          id
        }
      }
    }
  }
`;

const SENT_MESSAGES_SUBSCRIPTION = gql`
  subscription SentMessages($channelId: String!) {
    message(channelId: $channelId) {
      message
      id
      from {
        name
        id
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage(
    $channelId: String!
    $userId: String!
    $message: String!
  ) {
    addMessage(message: $message, from: $userId, channelId: $channelId) {
      id
    }
  }
`;

const Chat: Component = () => {
  const [selectedChannel, setSelectedChannel] = createSignal("");
  const [selectedUser, setSelectedUser] = createSignal<User>();
  const [messages, setMessages] = createSignal<Message[]>([]);
  const client = useClient();
  const [channels] = createResource(client, async () =>
    client()
      .query<GetChannels>({
        query: GET_CHANNELS,
      })
      .then(({ data }) => data.channels)
  );
  const [users] = createResource(client, async () =>
    client()
      .query<GetUsers>({
        query: GET_USERS,
      })
      .then(({ data }) => data.users)
  );

  createEffect(() => {
    const c = channels();
    if (c !== undefined) {
      setSelectedChannel(c[0].id);
    }
  });

  createEffect(() => {
    const channel = selectedChannel();

    console.log(client);

    if (channel !== "") {
      client()
        .query<GetChannel>({
          query: GET_CHANNEL,
          variables: { channelId: channel },
        })
        .then(({ data }) => setMessages(data.channel.messages));

      client()
        .subscribe<SentMessages>({
          query: SENT_MESSAGES_SUBSCRIPTION,
          variables: { channelId: channel },
        })
        .subscribe({
          next: ({ data }) => {
            setMessages((messages) => [...messages, data.message]);
          },
          error: (err) => {
            console.log(err);
          },
        });
    }
  });

  createEffect(() => {
    if (users() !== undefined) {
      setSelectedUser(users()[0]);
    }
  });

  const sendMessage = () => {
    const message = (
      document.getElementById("messageInput") as HTMLInputElement
    ).value;

    client().mutate({
      mutation: SEND_MESSAGE,
      variables: {
        channelId: selectedChannel(),
        userId: selectedUser().id,
        message,
      },
    });
  };

  return (
    <div>
      <For each={channels()}>
        {({ name, id }) => (
          <Show
            when={id === selectedChannel()}
            fallback={
              <button
                class='p-1 rounded bg-red-500 text-white'
                onclick={() => setSelectedChannel(id)}
              >
                {name}
              </button>
            }
          >
            <button class='p-1 rounded bg-blue-500 text-white'>{name}</button>
          </Show>
        )}
      </For>
      <For each={users()}>
        {({ name, id }) => (
          <Show
            when={id === selectedUser()?.id}
            fallback={
              <button
                class='p-1 rounded bg-red-500 text-white'
                onclick={() =>
                  setSelectedUser({ id, name, __typename: "User" })
                }
              >
                {name}
              </button>
            }
          >
            <button class='p-1 rounded bg-blue-500 text-white'>{name}</button>
          </Show>
        )}
      </For>
      <Show when={selectedChannel() !== "" && messages() !== null}>
        <br />
        <For each={messages()}>
          {({ message, from }) => (
            <>
              <span class='font-semibold'>{from.name}</span>: {message}
              <br />
            </>
          )}
        </For>
      </Show>
      <input type='text' id='messageInput' />
      <button onclick={() => sendMessage()}>Send</button>
    </div>
  );
};

export default Chat;
