import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchService, SearchFilters } from "@/services/search";
import { SearchFilters as SearchFilterComponent } from "@/components/Search/SearchFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  
  interface SearchResultItem {
    id?: string;
    objectID?: string;
    title?: string;
    name?: string;
    full_name?: string;
    description?: string;
    content?: string;
    bio?: string;
    price?: number;
    budget?: number;
    rating?: number;
    location?: string;
    category?: string;
  }

  interface SearchAllResults {
    products?: SearchResultItem[];
    gigs?: SearchResultItem[];
    jobs?: SearchResultItem[];
    users?: SearchResultItem[];
    total?: number;
  }

  const [results, setResults] = useState<SearchResultItem[] | SearchAllResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        let searchResults;
        
        switch (type) {
          case "products":
            searchResults = await searchService.searchProducts(query, filters);
            break;
          case "gigs":
            searchResults = await searchService.searchGigs(query, filters);
            break;
          case "jobs":
            searchResults = await searchService.searchJobs(query, filters);
            break;
          case "users":
            searchResults = await searchService.searchUsers(query);
            break;
          default:
            searchResults = await searchService.searchAll(query);
        }

        if (Array.isArray(searchResults)) {
          const sorted = searchService.sortResults(searchResults, filters.sortBy);
          const filtered = searchService.applyFilters(sorted, filters);
          setResults(filtered);
        } else {
          setResults(searchResults);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, type, filters]);

  const ResultCard = ({ item, resultType }: { item: SearchResultItem; resultType: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-2">
          <h3 className="font-semibold truncate">{item.title || item.name || item.full_name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description || item.content || item.bio}
          </p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {resultType === "products" && item.price && (
              <div className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                ${item.price}
              </div>
            )}
            {resultType === "jobs" && item.budget && (
              <div className="inline-flex items-center gap-1 text-sm">
                <Briefcase className="h-3 w-3" />
                ${item.budget}
              </div>
            )}
            {(resultType === "gigs" || resultType === "jobs") && item.rating && (
              <div className="inline-flex items-center gap-1 text-sm">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating}
              </div>
            )}
            {item.location && (
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {item.location}
              </div>
            )}
            {item.category && (
              <span className="inline-block bg-muted px-2 py-1 rounded text-xs">
                {item.category}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const categories = ["Web Development", "Graphic Design", "Writing", "Marketing", "Other"];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {query && `Showing results for "${query}"`}
            {loading && " (searching...)"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SearchFilterComponent
              categories={categories}
              onFiltersChange={setFilters}
              initialFilters={filters}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
              </div>
            ) : Array.isArray(results) && results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((item, idx) => (
                  <ResultCard key={`${type}-${idx}`} item={item} resultType={type} />
                ))}
              </div>
            ) : results && typeof results === "object" && !Array.isArray(results) ? (
              <div className="space-y-6">
                {results.products?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Products ({results.products.length})</h2>
                    <div className="grid gap-3">
                      {results.products.slice(0, 5).map((item: SearchResultItem, idx: number) => (
                        <ResultCard key={`product-${idx}`} item={item} resultType="products" />
                      ))}
                    </div>
                  </div>
                )}
                {results.gigs?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Gigs ({results.gigs.length})</h2>
                    <div className="grid gap-3">
                      {results.gigs.slice(0, 5).map((item: SearchResultItem, idx: number) => (
                        <ResultCard key={`gig-${idx}`} item={item} resultType="gigs" />
                      ))}
                    </div>
                  </div>
                )}
                {results.jobs?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Jobs ({results.jobs.length})</h2>
                    <div className="grid gap-3">
                      {results.jobs.slice(0, 5).map((item: SearchResultItem, idx: number) => (
                        <ResultCard key={`job-${idx}`} item={item} resultType="jobs" />
                      ))}
                    </div>
                  </div>
                )}
                {results.users?.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Users ({results.users.length})</h2>
                    <div className="grid gap-3">
                      {results.users.slice(0, 5).map((item: SearchResultItem, idx: number) => (
                        <ResultCard key={`user-${idx}`} item={item} resultType="users" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No results found for "{query}"</p>
                <Button variant="outline">Clear search</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
