/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetChannel
// ====================================================

export interface GetChannel_channel_messages_from {
  __typename: "User";
  name: string;
  id: string;
}

export interface GetChannel_channel_messages {
  __typename: "Message";
  message: string;
  id: string;
  from: GetChannel_channel_messages_from;
}

export interface GetChannel_channel {
  __typename: "Channel";
  messages: GetChannel_channel_messages[];
}

export interface GetChannel {
  channel: GetChannel_channel | null;
}

export interface GetChannelVariables {
  channelId: string;
}
