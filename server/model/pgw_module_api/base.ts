import type { FilterOperatorPgwModule } from '~/utils/enumModel'

export class QueryParamsPgwModuleApi {
  pageIndex: number = 1;
  pageSize: number = 10;
  pageCount: number = 0;
  rowCount: number = 0;
  sorts: string = '';
  filter: ParamFilterPgwModuleApi[] = [];
}

export interface ParamFilterPgwModuleApi {
  field: string;
  operator: FilterOperatorPgwModule;
  value: string | number | boolean | Date;
  manualFilter?: boolean;
}