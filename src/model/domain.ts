import { getModelByName } from "@adminjs/prisma";
import { ResourceWithOptions } from "adminjs";
import { prisma } from "./prisma.js";
import { url } from "inspector";

export const domainResource: ResourceWithOptions = {
    resource: {
      model: getModelByName("Domain"),
      client: prisma,
    },

    options: {
        properties:{
            url:{
                isTitle: true,
                isId: true,
            }
        }
    },
  }
