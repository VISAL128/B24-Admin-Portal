export interface RepushSummary {
  id: string
  transactionId: string
  transactionNo: string
  totalRepush: number
  date: string // ISO timestamp string
  status: RepushStatus
  type: RepushType
  metaData: WebhookMeta | RmqMeta | Record<string, unknown>
  payload: Record<string, any>
  repushDetails: RepushDetail[]
}

export interface WebhookMeta {
  url?: string
  [key: string]: any
}

export interface RmqMeta {
  connection_url: string
  [key: string]: any
}

export enum RepushStatus {
  Success = 'Success',
  Failed = 'Failed',
  Pending = 'Pending',
}

export enum RepushType {
  Webhook = 'webhook',
  Rmq = 'rmq',
}

export interface RepushDetail {
  id: number
  date: string
  status: RepushStatus
  metaData: Record<string, any> // flexible structure (statusCode, responseHeader, etc.)
}
