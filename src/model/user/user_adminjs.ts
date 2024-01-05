import { getModelByName } from "@adminjs/prisma";
import { PrismaClient, Role } from "@prisma/client";
import {
  ActionRequest,
  ListActionResponse,
  RecordActionResponse,
  ResourceWithOptions,
} from "adminjs";
import { hash } from "bcrypt";
import { log } from "console";
import { prisma } from "../prisma.js";
import { skip } from "node:test";
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
          console.log(request.payload);

          if (request.payload?.password) {
            request.payload.password = await hash(request.payload.password, 10);
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
        before: async (request: ActionRequest) => {
          // no need to hash on GET requests, we'll remove passwords there anyway
          if (request.method === "post") {
            log("post" + JSON.stringify(request.payload));
            // hash only if password is present, delete otherwise
            // so we don't overwrite it
            if (request.payload?.password && request.payload?.password !== "***") {
              request.payload.password = await hash(
                request.payload.password,
                10
              );
            } else {
              console.log("was delete");

              delete request.payload?.password;
            }
          } else {
          }
          return request;
        },
        after: async (response: RecordActionResponse, req: ActionRequest) => {
          if (req.method === "post") {
            const list = Object.keys(req.payload)
              .filter((key) => key.startsWith("UserHasDomain."))
              .map((key) => req.payload[key]);
            const userId = response.record.params.id;
            await prisma.userHasDomain.deleteMany({
              where: { userId: Number(userId) },
            });
            await prisma.userHasDomain.createMany({
              data: list.map((domainId) => ({
                userId: Number(userId),
                domainId: Number(domainId),
              })),
              skipDuplicates: true,
            });
            console.log(list);
          }

          response.record.params.password = "***";
          const recordId = req.params.recordId;
          var listDomain = await prisma.userHasDomain.findMany({
            where: { userId: Number(recordId) },
          });

          const domainIds = listDomain.reduce(
            (pro, curr, index) => ({
              ...pro,
              ...{ [`UserHasDomain.${index}`]: curr.domainId },
            }),
            {}
          );
          console.log(domainIds);
          

          response.record.params = {
            ...response.record.params,
            ...domainIds,
          };

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
      UserHasDomain: {
        type: "reference",

        reference: "Domain",

        isArray: true,
      },
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
