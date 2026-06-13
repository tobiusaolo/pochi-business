import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';

/** Invalidate React Query caches when WebSocket / window events fire. */
export default function CacheSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidate = (keys) => () => {
      keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    };

    const onOrder = invalidate([queryKeys.orders, queryKeys.stats, queryKeys.notifications]);
    const onPayout = invalidate([
      queryKeys.paymentsSummary,
      queryKeys.paymentsTransactions,
      queryKeys.paymentsDisbursements,
      queryKeys.payoutAccount,
      queryKeys.business,
      queryKeys.stats,
    ]);
    const onKyc = invalidate([queryKeys.business, queryKeys.stats]);

    window.addEventListener('poch-biz-order-new', onOrder);
    window.addEventListener('poch-biz-order-status-changed', onOrder);
    window.addEventListener('poch-biz-payout-sent', onPayout);
    window.addEventListener('poch-biz-kyc-changed', onKyc);

    return () => {
      window.removeEventListener('poch-biz-order-new', onOrder);
      window.removeEventListener('poch-biz-order-status-changed', onOrder);
      window.removeEventListener('poch-biz-payout-sent', onPayout);
      window.removeEventListener('poch-biz-kyc-changed', onKyc);
    };
  }, [queryClient]);

  return null;
}
