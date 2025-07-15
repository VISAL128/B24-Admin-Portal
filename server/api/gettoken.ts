import type {SettlementInquiryRequest, SettlementInquiryResponse} from "~~/server/model/management_api/settlement";
import { inquirySettlementWallet } from "../logic/management_api_logic";

export default defineEventHandler(async (_event) => {

    const walletInquiryRequest: SettlementInquiryRequest = {
        main_supplier_id: '36de3400-9705-4f1f-9f4f-85de083af423',
        currency: 'KHR',
        cutoff_date: new Date().toISOString().split('T')[0] // Current date in ISO format
        ,
        parties: []
    };

    const response: SettlementInquiryResponse = await inquirySettlementWallet(walletInquiryRequest);
    return {
        code: 'SUCCESS',
        message: 'Success',
        data: response
    };
})