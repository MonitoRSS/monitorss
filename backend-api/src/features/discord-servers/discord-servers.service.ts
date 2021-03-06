import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordAPIError } from '../../common/errors/DiscordAPIError';
import { DiscordAPIService } from '../../services/apis/discord/discord-api.service';
import { Feed } from '../feeds/entities/feed.entity';
import { FeedsService } from '../feeds/feeds.service';
import { FeedStatus } from '../feeds/types/FeedStatus.type';
import {
  DiscordServerProfile,
  DiscordServerProfileModel,
} from './entities/discord-server-profile.entity';
import {
  DiscordGuild,
  DiscordGuildRole,
  DiscordGuildChannel,
} from '../../common';

interface ProfileSettings {
  dateFormat: string;
  dateLanguage: string;
  timezone: string;
}

@Injectable()
export class DiscordServersService {
  defaultDateFormat: string;
  defaultTimezone: string;
  defaultDateLanguage: string;

  constructor(
    @InjectModel(DiscordServerProfile.name)
    private readonly profileModel: DiscordServerProfileModel,
    private readonly configService: ConfigService,
    private readonly discordApiService: DiscordAPIService,
    private readonly feedsService: FeedsService,
  ) {
    this.defaultDateFormat = this.configService.get<string>(
      'defaultDateFormat',
    ) as string;
    this.defaultTimezone = this.configService.get<string>(
      'defaultTimezone',
    ) as string;
    this.defaultDateLanguage = this.configService.get<string>(
      'defaultDateLanguage',
    ) as string;
  }

  async getServerProfile(serverId: string): Promise<ProfileSettings> {
    const profile = await this.profileModel.findById(serverId);

    return this.getProfileSettingsWithDefaults(profile);
  }

  async updateServerProfile(
    serverId: string,
    updates: {
      dateFormat?: string;
      dateLanguage?: string;
      timezone?: string;
    },
  ) {
    const toUpdate: { $set: Partial<DiscordServerProfile> } = {
      $set: {},
    };

    if (updates.dateFormat) {
      toUpdate.$set.dateFormat = updates.dateFormat;
    }

    if (updates.dateLanguage) {
      toUpdate.$set.dateLanguage = updates.dateLanguage;
    }

    if (updates.timezone) {
      toUpdate.$set.timezone = updates.timezone;
    }

    const updated = await this.profileModel.findOneAndUpdate(
      { _id: serverId },
      toUpdate,
      {
        upsert: true,
        new: true,
      },
    );

    return this.getProfileSettingsWithDefaults(updated);
  }

  async getServerFeeds(
    serverId: string,
    options: {
      search?: string;
      limit: number;
      offset: number;
    },
  ): Promise<(Feed & { status: FeedStatus })[]> {
    return this.feedsService.getServerFeeds(serverId, options);
  }

  async countServerFeeds(
    serverId: string,
    options?: {
      search?: string;
    },
  ): Promise<number> {
    return this.feedsService.countServerFeeds(serverId, {
      search: options?.search,
    });
  }

  async getServer(serverId: string) {
    try {
      const guild: DiscordGuild =
        await this.discordApiService.executeBotRequest(`/guilds/${serverId}`);

      return guild;
    } catch (err) {
      const statusCodeForNull = [HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN];

      if (
        err instanceof DiscordAPIError &&
        statusCodeForNull.includes(err.statusCode)
      ) {
        return null;
      }

      throw err;
    }
  }

  async getChannelsOfServer(serverId: string) {
    const channels: DiscordGuildChannel[] =
      await this.discordApiService.executeBotRequest(
        `/guilds/${serverId}/channels`,
      );

    return channels;
  }

  async getRolesOfServer(serverId: string) {
    const roles: DiscordGuildRole[] =
      await this.discordApiService.executeBotRequest(
        `/guilds/${serverId}/roles`,
      );

    return roles;
  }

  private getProfileSettingsWithDefaults(
    profile?: DiscordServerProfile | null,
  ) {
    return {
      dateFormat: profile?.dateFormat || this.defaultDateFormat,
      timezone: profile?.timezone || this.defaultTimezone,
      dateLanguage: profile?.dateLanguage || this.defaultDateLanguage,
    };
  }
}
