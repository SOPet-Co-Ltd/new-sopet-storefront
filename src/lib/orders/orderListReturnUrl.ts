const ORDERS_LIST_RETURN_URL_KEY = 'sopet.orders.listReturnUrl';

export function saveOrdersListReturnUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ORDERS_LIST_RETURN_URL_KEY, url);
  } catch {
    // ignore storage failures
  }
}

export function getOrdersListReturnUrl(): string {
  if (typeof window === 'undefined') return '/user/orders';

  try {
    const stored = sessionStorage.getItem(ORDERS_LIST_RETURN_URL_KEY);
    if (stored && stored.startsWith('/user/orders')) {
      return stored;
    }
  } catch {
    // ignore storage failures
  }

  return '/user/orders';
}
