export interface YouTubeLiveChatMessageListResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pollingIntervalMillis?: number;
  pageInfo: PageInfo;
  items: YouTubeLiveChatMessage[];
}

export interface YouTubeLiveChatMessage {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeLiveChatMessageSnippet;
  authorDetails: YouTubeLiveChatAuthorDetails;
}

export interface YouTubeLiveChatMessageSnippet {
  type: 'textMessageEvent' | 'superChatEvent';
  liveChatId: string;
  authorChannelId: string;
  publishedAt: string;
  hasDisplayContent: boolean;
  displayMessage: string;
  textMessageDetails?: {
    messageText: string;
  };
  superChatDetails?: YouTubeLiveChatSuperChatDetails;
}

export interface YouTubeLiveChatAuthorDetails {
  channelId: string;
  channelUrl: string;
  displayName: string;
  profileImageUrl: string;
  isVerified: boolean;
  isChatOwner: boolean;
  isChatSponsor: boolean;
  isChatModerator: boolean;
}

export interface YouTubeLiveChatSuperChatDetails {
  amountMicros: string;
  currency: string;
  amountDisplayString: string;
  userComment: string;
  tier: number;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
