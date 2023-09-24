import express from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
export class ExpressApp {
    app = express();
    constructor() {
        this.setAppSettings();
        this.setAppRouter();
    }
    setAppSettings = () => {
        this.app.use(express.json());
        this.app.use((req, res, next) => {
            this.app.use(cors());
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            next();
        });
    };
    setAppRouter = () => {
        this.app.use("/upload", express.static("upload"));
        this.app.use("/", apiRouter, (error, request, response, next) => {
            response.status(400).json({
                success: false,
                error: error.message,
            });
        });
    };
}
