export {
  getAnalyticsConfig,
  isAnalyticsKillSwitchOff,
  isValidGa4MeasurementId,
  isValidGtmId,
  type AnalyticsConfig,
} from './config';

export { callGtag, ensureDataLayer, pushToDataLayer, type DataLayerObject } from './dataLayer';

export {
  trackAddToCart,
  trackBeginCheckout,
  trackPageView,
  trackPurchase,
  trackShare,
  trackViewItem,
  type AnalyticsItem,
  type EcommercePayload,
  type PageViewParams,
} from './events';

export { cartLineToAnalyticsItem, orderLineToAnalyticsItem, sumItemValue } from './items';
