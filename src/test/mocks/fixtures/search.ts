export const sampleSearchProductSuggestions = [
  {
    id: 'prod-royal-canin',
    name: 'Royal Canin Cat Food',
    slug: 'royal-canin-cat-food',
    thumbnailUrl: 'https://example.com/royal-canin.jpg',
  },
  {
    id: 'prod-dog-treats',
    name: 'Premium Dog Treats',
    slug: 'premium-dog-treats',
    thumbnailUrl: null,
  },
];

export const sampleSearchQuerySuggestions = [
  { query: 'royal canin' },
  { query: 'royal canin kitten' },
];

export const sampleSearchSuggestionsPayload = {
  products: sampleSearchProductSuggestions,
  queries: sampleSearchQuerySuggestions,
};

export const sampleSearchRecoverySuggestions = ['อาหารแมว', 'Royal Canin', 'dog treats'];
