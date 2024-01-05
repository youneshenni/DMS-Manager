import { getModelByName } from "@adminjs/prisma";
import { ResourceWithOptions } from "adminjs";
import { prisma } from "../prisma.js";

export const userHasDomainResource: ResourceWithOptions = {
  resource: {
    model: getModelByName("UserHasDomain"),
    client: prisma,
  },
  options: {
    navigation: false,
  },
};
