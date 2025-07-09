import { PgwModuleResponse } from "~/models/baseModel";
import { requestToPgwModuleApi } from "~~/server/logic/pgw_module_api_logic";
import { PgwModuleProfile } from "~~/server/model/pgw_module_api/profile";

export default defineEventHandler(
  async (event): Promise<PgwModuleResponse<PgwModuleProfile>> => {

    return {
      code: '000',
      message: 'SUCCESS',
      message_kh: 'ជោគជ័យ',
      data: {
        id: 'uuid-1234',
        name: 'Mock User',
        code: '1234'
      }
    }
    // const response = await requestToPgwModuleApi('/current', 'GET', {});
    // return response.data as PgwModuleResponse<PgwModuleProfile>;
  }
);
