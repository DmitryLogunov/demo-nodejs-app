export type ServiceHandlerResponse<T> = {
  status: 'SUCCESS' | 'ERROR';
  info?: string;
  httpCode?: number;
  data?: T;
}
