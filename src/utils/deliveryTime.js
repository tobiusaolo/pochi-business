export const DELIVERY_TIME_OPTIONS = [
  { value: 'SAME_DAY', label: '24 hours' },
  { value: 'THREE_DAYS', label: '3 days' },
  { value: 'ONE_WEEK', label: '1 week' },
  { value: 'TWO_WEEKS', label: '2 weeks' },
  { value: 'THREE_WEEKS', label: '3 weeks' },
  { value: 'ONE_MONTH', label: '1 month' },
];

export const DEFAULT_DELIVERY_TIME = 'THREE_DAYS';

export const deliveryTimeLabel = (value) => {
  const match = DELIVERY_TIME_OPTIONS.find((opt) => opt.value === value);
  return match ? match.label : '3 days';
};
