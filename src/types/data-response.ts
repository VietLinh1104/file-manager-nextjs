export type DataResponse<T> = {
  status: string;
  message: string;
  meta: Meta;
  data: T[];
};

export type Meta = {
  page: number,
  pageSize: number,
  total: number
};

