import { EventService } from '@/services/events/index';
import { Awaitable } from '@/utils/types';
import { Events } from '@/services/events/interfaces';
import { bubbleWrap } from '@/utils/functions';
import { createLogger } from '@/app/logger';
import { Client, ClientEvents } from 'discord.js';
import { DiscordIntegration } from '@/init/integrations/discord';
import { singleton } from 'tsyringe';

const _builtinRegistrations = Symbol('_builtinRegistrations');
const _discordRegistrations = Symbol('_discordRegistrations');

@singleton()
export class ListenerService {
  private static readonly logger = createLogger(ListenerService.name);

  constructor(
    private readonly eventService: EventService,
    private readonly discordIntegration: DiscordIntegration,
  ) {}

  static RegisterBuiltin<K extends keyof Events>(event: K) {
    return (target: any, key: string, descriptor: TypedPropertyDescriptor<(data: Events[K]) => Awaitable>) => {
      if (!target[_builtinRegistrations]) {
        target[_builtinRegistrations] = [];
      }

      target[_builtinRegistrations].push((instance: any, eventService: EventService) => {
        eventService.on(event, bubbleWrap(descriptor.value!.bind(instance), error => {
          ListenerService.logger.error('Unhandled error', { error });
        }));
      });
    };
  }

  static RegisterDiscord<K extends keyof ClientEvents>(event: K) {
    return (target: any, key: string, descriptor: TypedPropertyDescriptor<(...args: ClientEvents[K]) => Awaitable>) => {
      if (!target[_discordRegistrations]) {
        target[_discordRegistrations] = [];
      }

      target[_discordRegistrations].push((instance: any, client: Client) => {
        const listener = bubbleWrap(descriptor.value!.bind(instance), error => {
          ListenerService.logger.error('Unhandled error', { error });
        });
        if (event === 'ready' && client.isReady()) {
          (listener as Function)(client);
        }
        client.on(event, listener);
      });
    };
  }

  registerListeners(service: any) {
    this.registerBuiltinListeners(service);
    this.registerDiscordListeners(service);
    return this;
  }

  registerBuiltinListeners(service: any) {
    if (service[_builtinRegistrations]) {
      for (const registration of service[_builtinRegistrations]) {
        registration(service, this.eventService);
      }
      delete service[_builtinRegistrations];
    }
    return this;
  }

  registerDiscordListeners(service: any) {
    if (service[_discordRegistrations]) {
      for (const registration of service[_discordRegistrations]) {
        registration(service, this.discordIntegration.client);
      }
      delete service[_discordRegistrations];
    }
    return this;
  }
}
