import { createTestFeed } from '../../../test/data/feeds.test-data';
import { FeedWithRefreshRate } from '../types/FeedWithRefreshRate';
import { GetFeedOutputDto } from './GetFeedOutput.dto';

describe('GetFeedOutputDto', () => {
  describe('fromEntity', () => {
    it('returns the formatted dto object', () => {
      const feed = createTestFeed();
      const feedWithRefreshRate: FeedWithRefreshRate = {
        ...feed,
        refreshRateSeconds: 10,
      };

      const result = GetFeedOutputDto.fromEntity(feedWithRefreshRate);

      expect(result).toEqual({
        result: {
          refreshRateSeconds: feedWithRefreshRate.refreshRateSeconds,
          text: feed.text || '',
          checkDates: feed.checkDates,
          checkTitles: feed.checkTitles,
          directSubscribers: feed.directSubscribers,
          disabled: feed.disabled,
          formatTables: feed.formatTables,
          imgLinksExistence: feed.imgLinksExistence,
          imgPreviews: feed.imgPreviews,
          ncomparisons: feed.ncomparisons || [],
          pcomparisons: feed.pcomparisons || [],
          embeds: feed.embeds.map((embed) => ({
            title: embed.title,
            description: embed.description,
            url: embed.url,
            thumbnail: {
              url: embed.thumbnailURL,
            },
            author: {
              iconUrl: embed.authorIconURL,
              name: embed.authorName,
              url: embed.authorURL,
            },
            fields: embed.fields || [],
            color: embed.color,
            footer: {
              text: embed.footerText,
              iconUrl: embed.footerIconURL,
            },
            image: {
              url: embed.imageURL,
            },
            timestamp: embed.timestamp,
          })),
        },
      });
    });
  });
});