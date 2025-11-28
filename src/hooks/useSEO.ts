import { useEffect } from "react";
import { updateSEOMetaTags, seoMetadata } from "@/utils/seo";

export const useSEO = (page: keyof typeof seoMetadata) => {
  useEffect(() => {
    if (seoMetadata[page]) {
      updateSEOMetaTags(seoMetadata[page]);
    }
  }, [page]);
};
