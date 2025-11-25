import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { searchService } from "@/services/search";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search as SearchIcon, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  products?: SearchItem[];
  gigs?: SearchItem[];
  jobs?: SearchItem[];
  users?: SearchItem[];
  total?: number;
}

interface SearchItem {
  objectID?: string;
  id?: string;
  title?: string;
  name?: string;
  full_name?: string;
  content?: string;
}

interface ResultSectionProps {
  title: string;
  items: SearchItem[];
  type: string;
}

export const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchItem[]>([]);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (query.length > 2) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const data = await searchService.searchAll(query);
          setResults(data);
        } catch (error) {
          console.error("Error searching:", error);
        }
      }, 300);
    } else if (query.length === 0) {
      setResults(null);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const handleSearch = (searchQuery: string, type?: string) => {
    const params = new URLSearchParams();
    params.set("q", searchQuery);
    if (type) params.set("type", type);
    navigate(`/search?${params.toString()}`);
    setOpen(false);
  };

  const ResultSection = ({ title, items, type }: ResultSectionProps) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="py-2 border-b last:border-b-0">
        <p className="text-xs font-semibold text-muted-foreground px-2 py-1">{title}</p>
        {items.slice(0, 3).map((item: SearchItem, idx: number) => (
          <div
            key={`${type}-${idx}`}
            className="px-2 py-2 hover:bg-muted rounded cursor-pointer text-sm"
            onClick={() => handleSearch(item.title || item.name || item.full_name || item.content || "", type)}
          >
            {item.title || item.name || item.full_name || (item.content?.substring(0, 50) ?? "")}
          </div>
        ))}
        {items.length > 3 && (
          <div
            className="px-2 py-2 text-sm text-primary hover:text-primary/80 cursor-pointer"
            onClick={() => handleSearch(query, type)}
          >
            View all {items.length} results →
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            className="pl-10 pr-4"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-96 overflow-y-auto">
          {results ? (
            <div className="p-2 space-y-1">
              <ResultSection title="Products" items={results.products} type="products" />
              <ResultSection title="Gigs" items={results.gigs} type="gigs" />
              <ResultSection title="Jobs" items={results.jobs} type="jobs" />
              <ResultSection title="Users" items={results.users} type="users" />
              {results.total === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          ) : query.length === 0 ? (
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">Recent Searches</p>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded group cursor-pointer"
                    onClick={() => handleSearch(search.query)}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {search.query}
                    </div>
                    <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
