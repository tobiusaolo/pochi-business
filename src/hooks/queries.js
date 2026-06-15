import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import { STALE } from '../lib/queryClient';

export function useBusinessStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => api.get('/admin/business/stats').then((r) => r.data),
    staleTime: STALE.LONG,
  });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => api.get('/orders/business').then((r) => r.data),
    staleTime: STALE.MEDIUM,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const [assignedRes, platformRes] = await Promise.all([
        api.get('/categories/').then((r) => r.data || []).catch(() => []),
        api.get('/catalog/categories/').then((r) => r.data || []).catch(() => []),
      ]);
      const byId = new Map();
      for (const cat of [...platformRes, ...assignedRes]) {
        if (cat?.id) byId.set(String(cat.id), cat);
      }
      return Array.from(byId.values()).sort((a, b) => {
        const aPlatform = a.business_id == null ? 0 : 1;
        const bPlatform = b.business_id == null ? 0 : 1;
        if (aPlatform !== bPlatform) return aPlatform - bPlatform;
        return (a.name || '').localeCompare(b.name || '');
      });
    },
    staleTime: STALE.LONG,
  });
}

export function useProducts(viewerCurrency, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products(viewerCurrency),
    queryFn: () =>
      api
        .get('/products/my-products', {
          params: { viewer_currency: viewerCurrency },
        })
        .then((r) => r.data || []),
    staleTime: STALE.MEDIUM,
    enabled: enabled && !!viewerCurrency,
  });
}

export function useNotifications(options = {}) {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.get('/notifications').then((r) => r.data),
    staleTime: STALE.SHORT,
    ...options,
  });
}

export function usePaymentsSummary() {
  return useQuery({
    queryKey: queryKeys.paymentsSummary,
    queryFn: () => api.get('/payments/summary').then((r) => r.data),
    staleTime: STALE.MEDIUM,
  });
}

export function usePaymentsTransactions() {
  return useQuery({
    queryKey: queryKeys.paymentsTransactions,
    queryFn: () => api.get('/payments/transactions').then((r) => r.data || []),
    staleTime: STALE.MEDIUM,
  });
}

export function usePaymentsDisbursements() {
  return useQuery({
    queryKey: queryKeys.paymentsDisbursements,
    queryFn: () => api.get('/payments/disbursements').then((r) => r.data || []),
    staleTime: STALE.MEDIUM,
  });
}

export function usePayoutAccount() {
  return useQuery({
    queryKey: queryKeys.payoutAccount,
    queryFn: () => api.get('/payments/payout-account').then((r) => r.data),
    staleTime: STALE.MEDIUM,
  });
}

export function useFxRates() {
  return useQuery({
    queryKey: queryKeys.fxRates,
    queryFn: () => api.get('/pricing/fx-rates').then((r) => r.data?.rates || {}),
    staleTime: STALE.LONG,
  });
}

export function useGeoCurrency() {
  return useQuery({
    queryKey: queryKeys.geoCurrency,
    queryFn: () => api.get('/geo/currency').then((r) => r.data),
    staleTime: STALE.LONG,
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: queryKeys.promotions,
    queryFn: () => api.get('/business/promotions/promotions').then((r) => r.data || []),
    staleTime: STALE.MEDIUM,
  });
}

export function useCoupons() {
  return useQuery({
    queryKey: queryKeys.coupons,
    queryFn: () => api.get('/business/promotions/coupons').then((r) => r.data || []),
    staleTime: STALE.MEDIUM,
  });
}
