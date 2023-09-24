import { getModelByName } from "@adminjs/prisma";
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcrypt";
import { log } from "console";
const prisma = new PrismaClient();
const userResource = {
    resource: {
        model: getModelByName("User"),
        client: prisma,
    },
    options: {
        actions: {
            new: {
                isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
                before: async (request) => {
                    if (request.payload?.password) {
                        request.payload.password = hash(request.payload.password, 10);
                    }
                    return request;
                },
            },
            show: {
                isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
                after: async (response) => {
                    response.record.params.password = "";
                    return response;
                },
            },
            edit: {
                isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
                before: async (request) => {
                    if (request.method === "post") {
                        log("post" + request.payload?.password);
                        if (request.payload?.password) {
                            request.payload.password = hash(request.payload.password, 10);
                        }
                        else {
                            console.log("was delete");
                            delete request.payload?.password;
                        }
                    }
                    return request;
                },
                after: async (response) => {
                    response.record.params.password = "";
                    return response;
                },
            },
            list: {
                isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
                after: async (response) => {
                    response.records.forEach((record) => {
                        record.params.password = "";
                    });
                    return response;
                },
            },
        },
        properties: {
            password: {
                isVisible: {
                    list: false,
                    filter: false,
                    show: false,
                    edit: true,
                },
            },
        },
    },
};
export { userResource };
