import {getToken, inquirySettlementWallet} from "~~/server/logic/management_api_logic";
import {SettlementInquiryRequest, SettlementInquiryResponse} from "~~/server/model/management_api/settlement";

export default defineEventHandler(async (event) => {

    let walletInquiryRequest: SettlementInquiryRequest = {
        main_supplier_id: '36de3400-9705-4f1f-9f4f-85de083af423',
        currency: 'KHR',
        cutoff_date: new Date().toISOString().split('T')[0] // Current date in ISO format
    };

    let response: SettlementInquiryResponse = await inquirySettlementWallet(walletInquiryRequest);
    return {
        code: 'SUCCESS',
        message: 'Success',
        data: response
    };
})