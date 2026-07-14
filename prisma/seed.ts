import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const topics = [
  { name: "News", slug: "news" },
  { name: "Tech", slug: "tech" },
  { name: "Sports", slug: "sports" },
  { name: "Politics", slug: "politics" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Music", slug: "music" },
  { name: "Gaming", slug: "gaming" },
  { name: "Science", slug: "science" },
  { name: "Business", slug: "business" },
  { name: "Random", slug: "random" },
];

async function main() {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { slug: topic.slug },
      update: {},
      create: topic,
    });
  }
  console.log("Seeded topics:", topics.map((t) => t.name).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
