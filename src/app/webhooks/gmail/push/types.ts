export interface PubSubMessage {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
    attributes?: Record<string, string>;
  };
  subscription: string;
}

export interface GmailPushPayload {
  emailAddress: string;
  historyId: string;
}
