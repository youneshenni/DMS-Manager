import { getModelByName } from "@adminjs/prisma";
import { PrismaClient, Role } from "@prisma/client";
import {
  ListActionResponse,
  RecordActionResponse,
  ResourceWithOptions,
} from "adminjs";
import { hash } from "bcrypt";
import { log } from "console";
const prisma = new PrismaClient();
const userResource: ResourceWithOptions = {
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
            request.payload.password = hash(request.payload.password,10);
          }
          return request;
        },
      },
      show: {
        isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,    
        after: async (response: RecordActionResponse) => {
          response.record.params.password = "";
          return response;
        },
      },
      edit: {
        isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
        before: async (request) => {
          // no need to hash on GET requests, we'll remove passwords there anyway
          if (request.method === "post") {
            log("post"+request.payload?.password)
            // hash only if password is present, delete otherwise
            // so we don't overwrite it
            if (request.payload?.password) {
              request.payload.password = hash(request.payload.password,10);
            } else {
                console.log("was delete");
                
              delete request.payload?.password;
            }
          }
          return request;
        },
        after: async (response: RecordActionResponse) => {
          response.record.params.password = "";
          return response;
        },
      },
      list: {
        isVisible: ({ currentAdmin }) => currentAdmin.role === Role.SUPER_ADMIN,
        after: async (response: ListActionResponse) => {
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
          edit: true, // we only show it in the edit view
        },
      },
    },
  },
};

export { userResource };
