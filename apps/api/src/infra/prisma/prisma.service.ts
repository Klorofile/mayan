import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // Prisma 5 no longer exposes beforeExit with the same type shape; Nest shutdown hooks can be enabled at bootstrap.
}
