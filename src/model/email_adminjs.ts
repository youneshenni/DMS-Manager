import { PrismaClient } from "@prisma/client";
import { mailService } from "../service/mail.service.js";
import { ResourceWithOptions } from "adminjs";
import { getModelByName } from "@adminjs/prisma";
import { prisma } from "./prisma.js";

const customBeforeAddEmail = async (request, context) => {
  const { payload = {}, method } = request;
  console.log(payload, method);

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
const customBeforeDeleteEmail = async (request, context) => {
  const { payload = {}, method, params } = request;
  console.log(payload, method, params);

  if (method !== "post") return request;
  const { recordId } = params as {
    recordId?: number;
    password?: string;
  };
  if (!recordId) {
    throw new Error("no email ");
  }
  var email = await prisma.email.findFirstOrThrow({ where: { id: Number(recordId) } });

  var isAdd = await mailService.delete(email.email);
  if (!isAdd) {
    throw new Error("faild Add");
  }
  return request;
};
const  customBeforeEdit =   async (request, context) => {
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
  var isAdd = await mailService.edit({ email, newPassword:password });
  if (!isAdd) {
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
      actions: {
        new: {
          before: [customBeforeAddEmail],
        },
        delete: {
          before: [customBeforeDeleteEmail],
        },
        edit: {
          before: [customBeforeEdit],
        },
      },
    },
  
};

