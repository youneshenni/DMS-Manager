import { PrismaClient } from "@prisma/client";
import { mailService } from "../service/mail.service.js";
const clien = new PrismaClient();
const customBeforeAddEmail = async (request, context) => {
    const { payload = {}, method } = request;
    console.log(payload, method);
    if (method !== "post")
        return request;
    const { email = null, password = null } = payload;
    if (!email || !password) {
        throw new Error("no email or password");
    }
    var isAdd = await mailService.add({ email, password });
    if (!isAdd) {
        throw new Error("faild Add");
    }
    return request;
};
const customBeforeDeleteEmail = async (request, context) => {
    const { payload = {}, method, params } = request;
    console.log(payload, method, params);
    if (method !== "post")
        return request;
    const { recordId } = params;
    if (!recordId) {
        throw new Error("no email ");
    }
    var email = await clien.email.findFirstOrThrow({ where: { id: Number(recordId) } });
    var isAdd = await mailService.delete(email.email);
    if (!isAdd) {
        throw new Error("faild Add");
    }
    return request;
};
export { customBeforeAddEmail, customBeforeDeleteEmail };
