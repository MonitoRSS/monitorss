import {
  Route, Routes,
} from 'react-router-dom';
import Feed from './Feed';
import FeedFilters from './FeedFilters';
import FeedMessage from './FeedMessage';
import FeedMiscOptions from './FeedMiscOptions';
import FeedSubscribers from './FeedSubscribers';
import Home from './Home';
import ServerDasboard from './ServerDashboard';
import Servers from './Servers';
import { RequireAuth } from '@/features/auth';
import { PageContent } from '@/components/PageContent';
// import Webhooks from './Webhooks';
import { ServerSettings } from './ServerSettings';
import FeedClone from './FeedClone';
import FeedComparisons from './FeedComparisons';
import Feeds from './Feeds';
import { RequireDiscordServers } from '@/features/discordServers';

const Pages: React.FC = () => (
  <Routes>
    <Route
      path="/"
      element={<Home />}
    />
    <Route
      path="/servers"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <Servers />
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent>
              <ServerDasboard />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/settings"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent>
              <ServerSettings />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent>
              <Feeds />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    {/* <Route
      path="/servers/:serverId/webhooks"
      element={(
        <RequireAuth>
          <PageContent>
            <Webhooks />
          </PageContent>
        </RequireAuth>
    )}
    /> */}
    <Route
      path="/servers/:serverId/feeds/:feedId"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <Feed />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/message"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedMessage />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/filters"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedFilters />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/comparisons"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedComparisons />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/subscribers"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedSubscribers />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/misc-options"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedMiscOptions />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
    <Route
      path="/servers/:serverId/feeds/:feedId/clone"
      element={(
        <RequireAuth>
          <RequireDiscordServers>
            <PageContent requireFeed>
              <FeedClone />
            </PageContent>
          </RequireDiscordServers>
        </RequireAuth>
    )}
    />
  </Routes>
);

export default Pages;
