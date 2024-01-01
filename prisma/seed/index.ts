import { PrismaClient } from "@prisma/client";
import { addUsers } from "./user";



async function main(){
    // 1. Create a new user called `ihab`
    const  prisma = new PrismaClient();
    prisma.$connect();

    await addUsers(prisma);

    prisma.$disconnect();
}

main().catch((e)=>{
    console.log(e);
    process.exit(1);
});