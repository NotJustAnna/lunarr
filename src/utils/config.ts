import { Exclude, instanceToPlain, plainToInstance, Type, TypeHelpOptions, TypeOptions } from 'class-transformer';
import * as fs from 'fs-extra';
import { createLogger } from '@/app/logger';
import { constructor } from 'tsyringe/dist/typings/types';

const _parent = Symbol('_parent');
const _children = Symbol('_children');
const _file = Symbol('_file');

export abstract class AbstractConfiguration {
  private static readonly logger = createLogger('Configuration');

  @Exclude()
  [_children]: AbstractConfigurationChild[] = [];

  @Exclude()
  [_file]!: string;

  static async load<T extends AbstractConfiguration>(cls: constructor<T>, file: string): Promise<T> {
    try {
      const config = plainToInstance(cls, await fs.readJson(file));
      AbstractConfiguration.postInit(config, file);
      return config;
    } catch (error: any) {
      // don't warn if file not found
      if (error.code !== 'ENOENT') {
        AbstractConfiguration.logger.error('Failed to load config', { error });
      }
      const config = new cls();
      AbstractConfiguration.postInit(config, file);
      return config;
    }
  }

  static Child(
    typeFunction?: (type?: TypeHelpOptions) => Function,
    options: TypeOptions = {},
  ) {
    const TypeDecorator = Type(typeFunction, options);
    return <C extends AbstractConfiguration>(target: C, propertyKey: string | symbol) => {
      TypeDecorator(target, propertyKey);
      const cls = (target.constructor as any);
      if (!cls[_children]) cls[_children] = [];
      cls[_children].push((target: any) => target[propertyKey]);
    };
  }

  private static postInit(config: AbstractConfiguration, file: string) {
    config[_file] = file;

    const cls = (config.constructor as any);
    if (!cls[_children]) cls[_children] = [];
    for (const getChild of cls[_children]) {
      const child = getChild(config);
      AbstractConfiguration.postInitChild(config, child);
    }
  }

  private static postInitChild(parent: AbstractConfiguration, config: AbstractConfigurationChild) {
    config[_parent] = parent;
    parent[_children].push(config);

    const cls = (config.constructor as any);
    if (!cls[_children]) cls[_children] = [];
    for (const getChild of cls[_children]) {
      const child = getChild(config);
      AbstractConfiguration.postInitChild(parent, child);
    }
  }

  overrideFromEnv(): void {
    for (const child of this[_children]) {
      child.overrideFromEnv();
    }
  }

  async save() {
    try {
      const json = instanceToPlain(this);
      await fs.writeJson(this[_file], json, { spaces: 2 });
    } catch (error) {
      AbstractConfiguration.logger.error('Failed to save config', { error });
    }
  }
}

export abstract class AbstractConfigurationChild {
  [_parent]!: AbstractConfiguration;

  overrideFromEnv(): void {
    // do nothing
  }

  static Child() {
    return <C extends AbstractConfigurationChild>(target: C, propertyKey: string) => {
      const cls = (target.constructor as any);
      if (!cls[_children]) cls[_children] = [];
      cls[_children].push((target: any) => target[propertyKey]);
    };
  }

  save(): Promise<void> {
    return this[_parent].save();
  }
}
