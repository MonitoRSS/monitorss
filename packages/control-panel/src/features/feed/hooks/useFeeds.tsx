import { useQuery } from 'react-query';
import { useState } from 'react';
import { getFeeds, GetFeedsOutput } from '../api';
import ApiAdapterError from '../../../utils/ApiAdapterError';

interface Props {
  serverId?: string
  initialLimit?: number
}

export const useFeeds = ({ serverId, initialLimit }: Props) => {
  const [limit, setLimit] = useState(initialLimit || 10);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [hasErrored, setHasErrored] = useState(false);

  const queryKey = ['feeds', {
    serverId,
    limit,
    offset,
    search: search || '',
  }];

  const {
    data,
    status,
    error,
    isFetching,
    isPreviousData,
    isLoading,
  } = useQuery<GetFeedsOutput, ApiAdapterError>(
    queryKey,
    async () => {
      if (!serverId) {
        throw new Error('Missing server ID when getting feeds');
      }

      console.log('refetching feeeds', queryKey);

      const result = await getFeeds({
        serverId,
        limit,
        offset,
        search,
      });

      return result;
    },
    {
      enabled: !!serverId && !hasErrored,
      keepPreviousData: true,
      onError: () => {
        setHasErrored(true);
      },
    },
  );

  const isFetchingNewPage = isLoading || (isFetching && isPreviousData);

  return {
    data,
    status,
    error,
    setLimit,
    setOffset,
    setSearch,
    isFetchingNewPage,
  };
};
