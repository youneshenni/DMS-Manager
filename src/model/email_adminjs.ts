import { PrismaClient } from "@prisma/client";
import { mailService } from "../service/mail.service.js";
import {
  ActionQueryParameters,
  ActionRequest,
  BaseRecord,
  Filter,
  RecordJSON,
  ResourceWithOptions,
  SortSetter,
  flat,
  populator,
} from "adminjs";
import { convertFilter, getModelByName } from "@adminjs/prisma";
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

  const oldEmail = await prisma.email.findFirst({
    where: { email },
  });
  if (oldEmail) {
  }

  const domain = await prisma.domain.findFirst({
    where: { id: Number(payload.domain) },
  });
  console.log(domain);

  if (email.split("@")[1] !== domain.url) {
    throw new Error("not your domain");
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
      },
      domain: {
        props: {
          fetchUrl: `${process.env.API_URL}/domain/me`,
        },
      },
      admin: {
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
        before: [customBeforeAddEmail],
      },
      delete: {
        before: [customBeforeDeleteEmail],
      },
      list: {
        handler: async (request, response, context) => {
          //filter
          if (request.method !== "get") {
            return response;
          }
          const userId = context?.currentAdmin?.id;
          if (!userId) {
            throw new Error("no user");
          }
          const listDomain = await prisma.userHasDomain.findMany({
            where: { userId: Number(userId) },
          });
          const domainIds = listDomain.map((domain) => domain.domainId);

          const PER_PAGE_LIMIT = 500;
          const { query } = request;
          const {
            sortBy,
            direction,
            filters = {},
          } = flat.unflatten(query || {}) as ActionQueryParameters;
          const { resource, _admin } = context;
          let { page, perPage } = flat.unflatten(
            query || {}
          ) as ActionQueryParameters;

          if (perPage) {
            perPage = +perPage > PER_PAGE_LIMIT ? PER_PAGE_LIMIT : +perPage;
          } else {
            perPage = _admin.options.settings?.defaultPerPage ?? 10;
          }
          page = Number(page) || 1;

          const listProperties = resource.decorate().getListProperties();
          const firstProperty = listProperties.find((p) => p.isSortable());
          let sort;
          if (firstProperty) {
            sort = SortSetter(
              { sortBy, direction },
              firstProperty.name(),
              resource.decorate().options
            );
          }

          const filter = await new Filter(filters, resource).populate(context);
          let records;
          var total = 0;

          records = await prisma.email
            .findMany({
              where: {
                ...convertFilter(getModelByName("Email"), filter),
                domainId: {
                  in: domainIds,
                },
              },
              include: { domain: true, admin: true },
              take: perPage,
              skip: (page - 1) * perPage,
            })
            .then((v) => v.map((data) => new BaseRecord(data, resource)));
          total = await prisma.email.count({
            where: {
              ...convertFilter(getModelByName("Email"), filter),
              domainId: {
                in: domainIds,
              },
            },
          });

          const { currentAdmin } = context;

          const populatedRecords = await populator(records, context);

          // eslint-disable-next-line no-param-reassign
          context.records = populatedRecords;




          return {
            meta: {
              total,
              perPage,
              page,
              direction: sort?.direction,
              sortBy: sort?.sortBy,
            },
            records: populatedRecords.map((r) => r.toJSON(currentAdmin)),
          };
        },
      },
      edit: {
        before: [customBeforeEdit],
        after: [customAfterEdit],
      },
    },
  },
};
