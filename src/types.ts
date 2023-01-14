export type Moderation = {
  categories: {
    'hate': boolean,
    'hate/threatening': boolean,
    'self-harm': boolean,
    'sexual': boolean,
    'sexual/minors': boolean,
    'violence': boolean,
    'violence/graphic': boolean
  },
  category_scores: {
    'hate': number,
    'hate/threatening': number,
    'self-harm': number,
    'sexual': number,
    'sexual/minors': number,
    'violence': number,
    'violence/graphic': number
  },
  flagged: boolean
}

export interface GetResponse {
  data: {
    message: string,
    conversation_id: string,
    parent_id: string
  };
  status: number;
  statusText: string;
}
