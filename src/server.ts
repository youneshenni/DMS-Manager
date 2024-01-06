import Http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { PrismaClient, Role } from "@prisma/client";
import AdminJSExpress from "@adminjs/express";
import ApiRouter from "./api/router.js";
import { ExpressApp } from "./app.js";
import { userResource } from "./model/user/user_adminjs.js";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import AdminJS, { AdminJSOptions } from "adminjs";
import { Sql } from "@prisma/client/runtime/library.js";
import { compareSync, hash, hashSync } from "bcrypt";
import { emailResource } from "./model/email_adminjs.js";
import { userHasDomainResource } from "./model/user/user_has_domain.js";
import { domainResource } from "./model/domain.js";
import { componentLoader } from "./components/index.js";
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

    const adminOptions: AdminJSOptions = {
      rootPath: "/",
      loginPath: "/login",
      componentLoader: componentLoader,
      logoutPath: "/logout",
      // We pass Publisher to `resources`
      resources: [
        userResource,
        domainResource,
        userHasDomainResource,
        emailResource,
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

        cookiePassword: process.env.sessionsecret ?? "sessionsecret",
      },
      null,
      {
        resave: true,
        saveUninitialized: true,

        secret: process.env.sessionsecret ?? "sessionsecret",
        cookie: {
          httpOnly: process.env.NODE_ENV === "production",
          secure: process.env.NODE_ENV === "production",
        },
        name: "adminjs",
      }
    );
    this.expressApp.app.use("/", adminRouter);
    this.expressApp.app.use("/api2", ApiRouter);
    this.expressApp.app.use(cookieParser());

    return true;
  };
  authenticate = async (email: string, password: string) => {
    try {
      var user = await this.prisma.user.findFirstOrThrow({ where: { email } });

      console.log(user);

      console.log(hashSync(password, 10));
      if (!compareSync(password, user.password)) {
        return null;
      }

      return user;
    } catch (error) {
      console.log(error);

      return null;
    }
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
}
