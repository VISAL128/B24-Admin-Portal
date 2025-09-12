export interface MgtResponseList<T> {
  param: {
    pageIndex: number
    pageSize: number
    pageCount: number
    rowCount: number
    sorts: string
    filter: string
  },
  result: T[]
}