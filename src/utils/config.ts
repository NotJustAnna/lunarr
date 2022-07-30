import { Exclude, instanceToPlain, plainToInstance } from 'class-transformer';
import * as fs from 'fs-extra';
import { createLogger } from '@/app/logger';
import { Constructable } from 'typedi';

const _parent = Symbol('_parent');
const _children = Symbol('_children');
const _file = Symbol('_file');

export abstract class Configuration {
  private static readonly logger = createLogger('Configuration');

  @Exclude()
  [_children]: ConfigurationChild[] = [];

  @Exclude()
  [_file]!: string;

  static async load<T extends Configuration>(cls: Constructable<T>, file: string): Promise<T> {
    try {
      const config = plainToInstance(cls, await fs.readJson(file));
      config[_file] = file;
      config.register();
      return config;
    } catch (error: any) {
      // don't warn if file not found
      if (error.code !== 'ENOENT') {
        Configuration.logger.error('Failed to load config', { error });
      }
      const config = new cls();
      config[_file] = file;
      config.register();
      return config;
    }
  }

  async save() {
    try {
      const json = instanceToPlain(this);
      await fs.writeJson(this[_file], json, { spaces: 2 });
    } catch (error) {
      Configuration.logger.error('Failed to save config', { error });
    }
  }

  overrideFromEnv(): void {
    for (const child of this[_children]) {
      child.overrideFromEnv();
    }
  }

  protected register() {
  }

  protected children<T extends ConfigurationChild>(...children: T[]) {
    for (let child of children) {
      child[_parent] = this;
      this[_children].push(child);
    }
  }
}

export abstract class ConfigurationChild {
  [_parent]!: Configuration;

  overrideFromEnv(): void {
    // do nothing
  }

  save(): void {
    this[_parent].save();
  }

  protected children<T extends ConfigurationChild>(children: T[]) {
    for (let child of children) {
      child[_parent] = this[_parent];
      this[_parent][_children].push(child);
    }
  }

  protected register() {
  }
}
