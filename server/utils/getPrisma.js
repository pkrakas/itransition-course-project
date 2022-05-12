import pkg from "@prisma/client";
const { PrismaClient } = pkg

export default function getPrisma() {
    if(!global.prisma) 
        global.prisma = new PrismaClient()
    return global.prisma
}