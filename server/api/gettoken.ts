import {getToken} from "~~/server/logic/management_api_logic";

export default defineEventHandler(async (event) => {

    const token = await getToken();
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Token not found or expired'
        });
    }
    return {
        code: 'SUCCESS',
        message: 'Token retrieved successfully',
        data: {
            token: token
        }
    };
})