import { PrismaClient } from "@prisma/client";
import { mailService } from "../service/mail.service.js";
import { ActionRequest, RecordJSON, ResourceWithOptions } from "adminjs";
import { getModelByName } from "@adminjs/prisma";
import { prisma } from "./prisma.js";

const customBeforeAddEmail = async (request, context) => {
  const { payload = {}, method } = request;
  console.log(payload, method);
  const userId = context?.currentAdmin?.id;
  if (!userId) {
    throw new Error("no user");
  }
  request.payload.admin = userId;

  if (method !== "post") return request;
  const { email = null, password = null } = payload as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new Error("no email or password");
  }
  var isAdd = await mailService.add({ email, password });
  if (!isAdd) {
    throw new Error("faild Add");
  }
  return request;
};
const customBeforeDeleteEmail = async (request: ActionRequest, context) => {
  const { payload = {}, method, params } = request;
  console.log(payload, method, params);

  if (method !== "post") return request;
  const { recordId } = params as unknown as {
    recordId?: number;
    password?: string;
  };
  if (!recordId) {
    throw new Error("no email ");
  }

  var email = await prisma.email.findFirstOrThrow({
    where: { id: Number(recordId) },
  });

  var isAdd = await mailService.delete(email.email);

  if (!isAdd) {
    throw new Error("faild Add");
  }
  return request;
};

const customAfterEdit = async (originalResponse, request, context) => {
  if (request.method !== "get") {
    return originalResponse;
  }
  console.log(JSON.stringify(originalResponse.record.params));

  const userId = context?.currentAdmin?.id;

  var listDomain = await prisma.userHasDomain.findMany({
    where: { userId: Number(userId) },
    include: { domain: true },
  });

  let domainData: RecordJSON[];

  if (listDomain.length > 0) {
    domainData = listDomain.map((domain) => ({
      params: {
        id: domain.domainId,
        name: domain.domain.url,
      },
      id: domain.domainId.toString(),
      populated: {},
      baseError: null,
      bulkActions: [],
      errors: {},
      populatedVer: 0,
      recordActions: [],
      title: domain.domain.url,
    }));
  } else {
    domainData = [];
  }

  originalResponse.record.params = {
    ...originalResponse.record.params,
    DomainData: domainData,
  };
  console.log(originalResponse.record.params);

  return originalResponse;
};
const customBeforeEdit = async (request, context) => {
  const { payload = {}, method } = request;
  console.log(payload, method);

  if (method === "get") return request;
  const { email = null, password = null } = payload as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new Error("no email or password");
  }

  const userId = context?.currentAdmin?.id;
  if (!userId) {
    throw new Error("no user");
  }
  request.payload.admin = userId;

  var isEdit = await mailService.edit({ email, newPassword: password });
  if (!isEdit) {
    throw new Error("Failed Add");
  }
  return request;
};

export const emailResource: ResourceWithOptions = {
  resource: {
    model: getModelByName("Email"),
    client: prisma,
  },

  options: {
    properties: {
      adminId: {
        isVisible: false,
        custom:{
          value: (context) => context?.currentAdmin?.id,
        }
      },
      admin: {
        custom: (context) => ({
          value: context?.currentAdmin?.id,
        }),
        props: (context) => ({
          value: context?.currentAdmin?.id,
        }),
        isVisible: {
          show: true,
          edit: false,
          list: true,
          filter: true,
        },
      },
    },
    actions: {
      new: {

        // before: [customBeforeAddEmail],
        // after: [customAfterEdit],

        handler: async (request, response, context) => {
          console.log("new");
          return {
            record: {
              params: {},
            },
          };
        }
      },
      delete: {
        before: [customBeforeDeleteEmail],
      },
      edit: {
        before: [customBeforeEdit],
        after: [customAfterEdit],
      },
    },
  },
};
