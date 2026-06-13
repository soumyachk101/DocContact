// Prisma 7 configuration file.
// Provides the database URL for CLI commands (migrate, studio, etc.).
// The application code uses a driver adapter instead.

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
