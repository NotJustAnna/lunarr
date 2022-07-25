import { AsyncInit } from '@/common/init/interfaces';
import { Container, Service } from 'typedi';
import { PrismaClient } from '@prisma/client';
import { localGenerator, NanoflakeLocalGenerator } from 'nanoflakes';

@Service()
export class DependenciesSetup implements AsyncInit {
  init() {
    Container.set(NanoflakeLocalGenerator, localGenerator(1653700000000, 0));
    Container.set(PrismaClient, new PrismaClient());
  }
}
