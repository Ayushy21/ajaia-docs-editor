import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USERS = [
  { name: "Ayush", email: "ayush@demo.local" },
  { name: "Alex", email: "alex@demo.local" },
  { name: "Maya", email: "maya@demo.local" },
];

async function main() {
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name },
      create: u,
    });
  }

  const ayush = await prisma.user.findUniqueOrThrow({ where: { email: "ayush@demo.local" } });
  const existing = await prisma.document.count({ where: { ownerId: ayush.id } });
  if (existing === 0) {
    await prisma.document.create({
      data: {
        title: "Welcome to DraftSpace",
        content: JSON.stringify({
          type: "doc",
          content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Welcome to DraftSpace" }] },
            { type: "paragraph", content: [{ type: "text", text: "This is a seeded demo document. Try editing, sharing, and importing files." }] },
          ],
        }),
        ownerId: ayush.id,
      },
    });
  }

  console.log("Seed complete:", DEMO_USERS.map((u) => u.email).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
