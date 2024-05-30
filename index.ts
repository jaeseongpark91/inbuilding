import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    let result = await prisma.main.findMany();
    console.log(result)
}

main()