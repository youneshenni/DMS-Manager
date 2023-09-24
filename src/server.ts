import Http from "http";
import dotenv from "dotenv";
import Connect from "connect-pg-simple";
import session from "express-session";
import cookieParser from "cookie-parser";
import { PrismaClient, Role } from "@prisma/client";
import AdminJSExpress from "@adminjs/express";
import { argon2d,  } from "argon2";
import { ExpressApp } from "./app.js";
import { mailService } from "./service/mail.service.js";
import { userResource } from "./model/user/user_adminjs.js";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import AdminJS from "adminjs";
import { Sql } from "@prisma/client/runtime/library.js";
import { compareSync, hash, hashSync } from "bcrypt";
import { customBeforeAddEmail, customBeforeDeleteEmail } from "./model/email_adminjs.js";
// import { buildRouter } from "adminjs/express/lib/buildRouter.js";
export class Server {
  expressApp = new ExpressApp();
  prisma = new PrismaClient();

  httpServer: Http.Server;
  admin;
  DEFAULT_ADMIN = {
    email: "admin",
    password: "admin",
  };

  constructor() {
    this.httpServer = new Http.Server(this.expressApp.app);
  }

  runServer = async (): Promise<void | Http.Server> => {
    return this.adminjsConnection().then(this.serverListen);
  };
  


  

  //TODO: add db connection
  adminjsConnection = async (): Promise<boolean> => {
    var l = await this.prisma.user.count();

    const adminOptions = {
      // We pass Publisher to `resources`
      resources: [
        userResource,
        {
          resource: {
            model: getModelByName("Domain"),
            client: this.prisma,
          },

          options: {},
        },
        {
          resource: {
            model: getModelByName("Email"),
            client: this.prisma,
          },

          options: {
            actions: {
              new: {
                before: [customBeforeAddEmail],
              },
              delete:{
                before:[customBeforeDeleteEmail]
              }
            },
          },
        },
      ],
    };
    AdminJS.registerAdapter({
      Resource: Resource,
      Database: Database,
    });
    this.admin = new AdminJS(adminOptions);
    if (process.env.NODE_ENV === "production") await this.admin.initialize();
    else this.admin.watch();

    AdminJSExpress;
    // const adminRouter = AdminJSExpress.buildRouter(this.admin);
    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
      this.admin,
      {
        authenticate: this.authenticate,
        cookieName: "adminjs",

        cookiePassword: "sessionsecret",
      },
      null,
      {
        resave: true,
        saveUninitialized: true,

        secret: "sessionsecret",
        cookie: {
          httpOnly: process.env.NODE_ENV === "production",
          secure: process.env.NODE_ENV === "production",
        },
        name: "adminjs",
      }
    );
    this.expressApp.app.use(this.admin.options.rootPath, adminRouter);
    this.expressApp.app.use(cookieParser());

    return true;
  };
  authenticate = async (email: string, password: string) => {
    try {
      var user = await this.prisma.user.findFirstOrThrow({ where: { email } });
      
      console.log(user);
      
      console.log(hashSync(password,10));
      if(!compareSync(password,user.password)){
        return null;
      }
      
      return user;
    } catch (error) {
      console.log(error);
      
      return null;
    }

    if (
      email === this.DEFAULT_ADMIN.email &&
      password === this.DEFAULT_ADMIN.password
    ) {
      return Promise.resolve(this.DEFAULT_ADMIN);
    }
    return null;
  };
  serverListen = (): Http.Server => {
    dotenv.config({
      path: `${process.cwd()}/.env`,
    });
    const { PORT: port, HOST: host } = process.env;
    console.log(port);

    return this.httpServer.listen(port, (): void => {
      console.log(
        `AdminJS started on http://localhost:${port}${this.admin.options.rootPath}`
      );
      console.log(`Server is running on: http://${host}:${port}`);
    });
  };
  customAfter = (originalResponse, request, context) => {
    console.log(originalResponse.meta);

    return originalResponse;
  };
}
