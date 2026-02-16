import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Seeding database...")

    // Create a dummy user
    const user = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            name: "Admin User",
            username: "admin",
            password: "password123", // Note: In a real app, this should be hashed
            status: "ONLINE",
            preferences: {
                create: {
                    theme: "default",
                    mode: "light",
                    radius: "0.5",
                    layout: "vertical",
                    direction: "ltr",
                },
            },
        },
    })

    console.log({ user })
    console.log("Seeding finished.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
