"use client";

import { useQuery } from "@apollo/client/react";
import ProductCard from "./ProductCard";
import { RecommendedProductsDocument, type RecommendedProductsQuery } from "@/lib/graphql/generated/graphql";

export default function ThankYouRecommendedProductSection() {
  const { data, loading, error } = useQuery(RecommendedProductsDocument, {
    variables: { limit: 10 },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sop-neutral-gray-300">Loading recommendations...</p>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching recommended products:", error);
    return null;
  }

  const products = data?.recommendedProducts ?? [];

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="sop-heading-lg-medium text-sop-neutral-gray-200 mb-6">
        Recommended for You
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product: RecommendedProductsQuery["recommendedProducts"][number]) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
