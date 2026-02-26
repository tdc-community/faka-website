import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
    console.log("Migration script: converting existing usernames to lowercase...");
    const users = await prisma.user.findMany();

    for (const user of users) {
        const lowerUsername = user.username.toLowerCase();
        if (user.username !== lowerUsername) {
            console.log(`Updating ${user.username} to ${lowerUsername}`);

            // Handle edge cases where a lowercase version might already exist
            // (unlikely if usernames were strictly unique, but safe to check)
            const existing = await prisma.user.findUnique({ where: { username: lowerUsername } });
            if (existing) {
                console.log(`  ERROR: User ${lowerUsername} already exists! Skipping ${user.username}...`);
                continue;
            }

            await prisma.user.update({
                where: { id: user.id },
                data: { username: lowerUsername }
            });
        }
    }

    console.log("Migration complete!");
    process.exit(0);
}

run().catch(console.error);
