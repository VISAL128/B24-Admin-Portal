

export interface UploadFileResponse {
  code: string
  message: string
  messageKh: string
  data: {
    name: string
    url: string
  }
}