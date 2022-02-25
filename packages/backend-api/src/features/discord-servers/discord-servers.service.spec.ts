import { HttpStatus } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { DiscordAPIError } from '../../common/errors/DiscordAPIError';
import { DiscordAPIService } from '../../services/apis/discord/discord-api.service';
import { createTestFailRecord } from '../../test/data/failrecords.test-data';
import { createTestFeed } from '../../test/data/feeds.test-data';
import {
  setupIntegrationTests,
  teardownIntegrationTests,
} from '../../utils/integration-tests';
import { MongooseTestModule } from '../../utils/mongoose-test.module';
import {
  FailRecord,
  FailRecordFeature,
  FailRecordModel,
} from '../feeds/entities/fail-record.entity';
import { Feed, FeedFeature, FeedModel } from '../feeds/entities/Feed.entity';
import { DiscordServersService } from './discord-servers.service';
import { DetailedFeedStatus } from './types/DetailedFeed.type';

describe('DiscordServersService', () => {
  let service: DiscordServersService;
  let feedModel: FeedModel;
  let failRecordModel: FailRecordModel;
  let discordApiService: DiscordAPIService;

  beforeEach(async () => {
    const { module } = await setupIntegrationTests({
      providers: [
        DiscordServersService,
        {
          provide: DiscordAPIService,
          useValue: {
            executeBotRequest: jest.fn(),
          },
        },
      ],
      imports: [
        MongooseTestModule.forRoot(),
        MongooseModule.forFeature([FeedFeature, FailRecordFeature]),
      ],
    });

    service = module.get<DiscordServersService>(DiscordServersService);
    feedModel = module.get<FeedModel>(getModelToken(Feed.name));
    failRecordModel = module.get<FailRecordModel>(
      getModelToken(FailRecord.name),
    );
    discordApiService = module.get<DiscordAPIService>(DiscordAPIService);
  });

  afterEach(async () => {
    await teardownIntegrationTests();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServerFeeds', () => {
    it('returns the sorted feeds, respecting limit and offset', async () => {
      const guild = 'server-1';
      const feedsToInsert = await Promise.all([
        createTestFeed({
          addedAt: new Date(2020),
          title: '2020',
          guild,
        }),
        createTestFeed({
          addedAt: new Date(2019),
          title: '2019',
          guild,
        }),
        createTestFeed({
          addedAt: new Date(2022),
          title: '2022',
          guild,
        }),
        createTestFeed({
          addedAt: new Date(2021),
          title: '2021',
          guild,
        }),
      ]);

      await feedModel.insertMany(feedsToInsert);

      const found = await service.getServerFeeds(guild, {
        limit: 2,
        offset: 1,
      });

      const foundTitles = found.map((feed) => feed.title);

      expect(foundTitles).toEqual(['2021', '2020']);
    });

    it('returns with the correct statuses', async () => {
      const guild = 'server-1';
      const feedsToInsert = [
        createTestFeed({
          addedAt: new Date(2020),
          title: '2020',
          guild,
          url: 'url-1',
        }),
        createTestFeed({
          addedAt: new Date(2019),
          title: '2019',
          guild,
          url: 'url-2',
        }),
      ];

      const faiLRecordsToInsert = [
        createTestFailRecord({
          _id: feedsToInsert[0].url,
        }),
      ];

      await feedModel.insertMany(feedsToInsert);
      await failRecordModel.insertMany(faiLRecordsToInsert);

      const found = await service.getServerFeeds(guild, {
        limit: 10,
        offset: 0,
      });

      expect(
        found.find((feed) => feed.url === feedsToInsert[0].url)?.status,
      ).toEqual(DetailedFeedStatus.FAILED);
      expect(
        found.find((feed) => feed.url === feedsToInsert[1].url)?.status,
      ).toEqual(DetailedFeedStatus.OK);
    });
  });

  describe('countServerFeeds', () => {
    it('returns the correct count', async () => {
      const guild = 'server-1';
      const feedsToInsert = await Promise.all([
        createTestFeed({
          title: '2020',
          guild,
        }),
        createTestFeed({
          title: '2019',
          guild,
        }),
      ]);

      await feedModel.insertMany(feedsToInsert);

      const count = await service.countServerFeeds(guild);

      expect(count).toEqual(2);
    });
  });

  describe('getServer', () => {
    it('returns the guild', async () => {
      const mockGuild = {
        id: 'server-1',
      };
      jest
        .spyOn(discordApiService, 'executeBotRequest')
        .mockResolvedValue(mockGuild);

      const guild = await service.getServer(mockGuild.id);

      expect(guild).toEqual(mockGuild);
    });

    it('returns null if the bot was forbidden', async () => {
      jest
        .spyOn(discordApiService, 'executeBotRequest')
        .mockRejectedValue(
          new DiscordAPIError('Forbidden', HttpStatus.FORBIDDEN),
        );

      const guild = await service.getServer('server-1');

      expect(guild).toBeNull();
    });

    it('throws for an unhandled error', async () => {
      jest
        .spyOn(discordApiService, 'executeBotRequest')
        .mockRejectedValue(new Error('Unhandled error'));

      await expect(service.getServer('server-1')).rejects.toThrow();
    });
  });
});