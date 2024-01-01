import { PrismaClient } from "@prisma/client";


export const addUsers = async (prismaClient:PrismaClient): Promise<void> => {
   await prismaClient.user.create({
        data:{
            email:"ihab",
            password:"ihab",
            role:"SUPER_ADMIN"
        }
    })
   
};