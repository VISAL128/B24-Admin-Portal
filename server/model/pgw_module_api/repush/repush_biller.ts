export type RepushStatus = 'success' | 'failed' | 'pending';
export type RepushType = 'webhook' | 'queue';

export interface RepushBillerModel<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
  TMeta extends Record<string, unknown> = Record<string, unknown>,
  TRepushDetail extends Record<string, unknown> = Record<string, unknown>
> {
  id: string;
  transactionId: string;
  transactionNo: string;

  /** Total number of times this transaction has been re-pushed */
  totalRepush: number;

  /** ISO-8601 string e.g. "2025-09-01T17:13:42+07:00" */
  date: string;

  status: RepushStatus;
  type: RepushType;

  /** Dynamic meta (headers, status codes, routing info, etc.) */
  metaData: TMeta;

  /** Dynamic payload (provider-specific fields) */
  payload: TPayload;

  /** Optional attempt logs or audit trail entries (dynamic) */
  repushDetails: TRepushDetail[];
}
