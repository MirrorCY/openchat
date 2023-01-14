export interface GetResponse {
  data: {
    message: string,
    conversation_id: string,
    parent_id: string
  };
  status: number;
  statusText: string;
}
