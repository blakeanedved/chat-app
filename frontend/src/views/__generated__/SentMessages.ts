/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL subscription operation: SentMessages
// ====================================================

export interface SentMessages_message_from {
  __typename: "User";
  name: string;
  id: string;
}

export interface SentMessages_message {
  __typename: "Message";
  message: string;
  id: string;
  from: SentMessages_message_from;
}

export interface SentMessages {
  message: SentMessages_message | null;
}

export interface SentMessagesVariables {
  channelId: string;
}
