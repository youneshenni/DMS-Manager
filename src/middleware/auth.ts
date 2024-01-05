import { NextFunction, Request, Response } from "express";



const isAuth = (req: Request, res: Response, next: NextFunction) => {
        //check ckokie

    const token = req.cookies.adminjs;
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }
    next();
}