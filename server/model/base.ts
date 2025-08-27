// This model use for standard response between app server and client
export interface BaseResponse<T> {
  success: boolean
  data: T
  message: string
}
