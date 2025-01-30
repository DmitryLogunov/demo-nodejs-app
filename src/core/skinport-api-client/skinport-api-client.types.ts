export interface SkinportApiClientInterface {
  sendRequest: (params: {
    method: string,
    endpoint: string,
    data?: { [key: string]: string | number | null },
    headers?: { [key: string]: string},
  }) => Promise<unknown>;
}
