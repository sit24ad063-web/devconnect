import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@devconnect.com" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@devconnect.com",
      password,
      headline: "Full Stack Developer | React & Node.js",
      bio: "Building things for the web. Open source enthusiast.",
      location: "Bengaluru, India",
      githubUrl: "https://github.com/alice",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@devconnect.com" },
    update: {},
    create: {
      name: "Bob Martinez",
      email: "bob@devconnect.com",
      password,
      headline: "Backend Engineer | Python & Go",
      bio: "I like distributed systems and good coffee.",
      location: "Austin, TX",
      githubUrl: "https://github.com/bob",
    },
  });

  await prisma.project.create({
    data: {
      title: "TaskFlow — Kanban App",
      description:
        "A drag-and-drop kanban board built with React and Node.js, with real-time updates via websockets.",
      repoUrl: "https://github.com/alice/taskflow",
      demoUrl: "https://taskflow-demo.example.com",
      techStack: "React,Node.js,Socket.io,PostgreSQL",
      featured: true,
      ownerId: alice.id,
    },
  });

  await prisma.project.create({
    data: {
      title: "GoCache — In-memory Cache Server",
      description: "A lightweight, Redis-inspired in-memory caching server written in Go.",
      repoUrl: "https://github.com/bob/gocache",
      techStack: "Go,gRPC",
      featured: true,
      ownerId: bob.id,
    },
  });

  const post = await prisma.post.create({
    data: {
      title: "Why I Switched from REST to GraphQL",
      slug: "why-i-switched-from-rest-to-graphql",
      content:
        "## Background\n\nAfter years of building REST APIs, I moved a side project to GraphQL.\n\n## What I learned\n\n- Over-fetching disappears when clients ask for exactly what they need\n- Schema design takes real upfront thought\n- Tooling (codegen, playground) is excellent\n\n```graphql\ntype Query {\n  me: User\n}\n```\n",
      tags: "graphql,api,backend",
      authorId: alice.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Great write-up! Curious how you handled caching with GraphQL.",
      postId: post.id,
      authorId: bob.id,
    },
  });

  await prisma.connection.create({
    data: { requesterId: alice.id, addresseeId: bob.id, status: "ACCEPTED" },
  });

  // Skills + endorsements
  const skillNames = ["React", "Node.js", "PostgreSQL", "Go", "Docker"];
  const skills = await Promise.all(
    skillNames.map((name) => prisma.skill.upsert({ where: { name }, update: {}, create: { name } }))
  );
  const [reactSkill, nodeSkill, pgSkill, goSkill, dockerSkill] = skills;

  const aliceReact = await prisma.userSkill.create({
    data: { userId: alice.id, skillId: reactSkill.id },
  });
  await prisma.userSkill.create({ data: { userId: alice.id, skillId: nodeSkill.id } });
  await prisma.userSkill.create({ data: { userId: alice.id, skillId: pgSkill.id } });

  const bobGo = await prisma.userSkill.create({ data: { userId: bob.id, skillId: goSkill.id } });
  await prisma.userSkill.create({ data: { userId: bob.id, skillId: dockerSkill.id } });

  // Bob (connected to Alice) endorses her React skill, and vice versa.
  await prisma.endorsement.create({ data: { userSkillId: aliceReact.id, endorserId: bob.id } });
  await prisma.endorsement.create({ data: { userSkillId: bobGo.id, endorserId: alice.id } });

  console.log("Seed data created:");
  console.log("  alice@devconnect.com / password123");
  console.log("  bob@devconnect.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
