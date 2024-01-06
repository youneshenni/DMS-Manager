import { Router } from "express";
import { DomainApiController } from "./controller/domain.controller.js";

const  router = Router();
const   domainApiController =new DomainApiController()
router.get("/user", (req, res) => {
    const  user =(req.session as  any)?.adminUser
    delete user.password;
    res.json(user);
});
router.get("/domain/me",domainApiController.me)


export default router;