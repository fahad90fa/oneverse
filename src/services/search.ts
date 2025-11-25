import algoliasearch from 'algoliasearch';
import { supabase } from "@/integrations/supabase/client";

const client = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID || 'placeholder_app_id',
  import.meta.env.VITE_ALGOLIA_API_KEY || 'placeholder_api_key'
);

const productsIndex = client.initIndex('products');
const gigsIndex = client.initIndex('gigs');
const jobsIndex = client.initIndex('jobs');
const usersIndex = client.initIndex('users');

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  rating?: number;
  status?: string;
  skills?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

export const searchService = {
  async searchProducts(query: string, filters?: SearchFilters) {
    try {
      const facetFilters = [];
      const numericFilters = [];

      if (filters?.category) {
        facetFilters.push(`category:${filters.category}`);
      }

      if (filters?.status) {
        facetFilters.push(`status:${filters.status}`);
      }

      if (filters?.minPrice !== undefined) {
        numericFilters.push(`price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        numericFilters.push(`price <= ${filters.maxPrice}`);
      }

      const results = await productsIndex.search(query, {
        facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
        numericFilters: numericFilters.length > 0 ? numericFilters : undefined,
        hitsPerPage: 20
      });

      return results.hits;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  async searchGigs(query: string, filters?: SearchFilters) {
    try {
      const facetFilters = [];
      const numericFilters = [];

      if (filters?.category) {
        facetFilters.push(`category:${filters.category}`);
      }

      if (filters?.status) {
        facetFilters.push(`status:${filters.status}`);
      }

      if (filters?.minPrice !== undefined) {
        numericFilters.push(`price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        numericFilters.push(`price <= ${filters.maxPrice}`);
      }

      if (filters?.skills && filters.skills.length > 0) {
        const skillFilters = filters.skills.map(skill => `skills:${skill}`);
        facetFilters.push(skillFilters);
      }

      const results = await gigsIndex.search(query, {
        facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
        numericFilters: numericFilters.length > 0 ? numericFilters : undefined,
        hitsPerPage: 20
      });

      return results.hits;
    } catch (error) {
      console.error('Error searching gigs:', error);
      throw error;
    }
  },

  async searchJobs(query: string, filters?: SearchFilters) {
    try {
      const facetFilters = [];
      const numericFilters = [];

      if (filters?.status) {
        facetFilters.push(`status:${filters.status}`);
      }

      if (filters?.minPrice !== undefined) {
        numericFilters.push(`budget >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice !== undefined) {
        numericFilters.push(`budget <= ${filters.maxPrice}`);
      }

      if (filters?.skills && filters.skills.length > 0) {
        const skillFilters = filters.skills.map(skill => `skills_required:${skill}`);
        facetFilters.push(skillFilters);
      }

      const results = await jobsIndex.search(query, {
        facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
        numericFilters: numericFilters.length > 0 ? numericFilters : undefined,
        hitsPerPage: 20
      });

      return results.hits;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },

  async searchUsers(query: string) {
    try {
      const results = await usersIndex.search(query, {
        hitsPerPage: 10
      });

      return results.hits;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  async searchAll(query: string) {
    try {
      const [products, gigs, jobs, users] = await Promise.all([
        this.searchProducts(query),
        this.searchGigs(query),
        this.searchJobs(query),
        this.searchUsers(query)
      ]);

      return {
        products,
        gigs,
        jobs,
        users,
        total: products.length + gigs.length + jobs.length + users.length
      };
    } catch (error) {
      console.error('Error searching all:', error);
      throw error;
    }
  },

  async indexProduct(product: any) {
    try {
      await productsIndex.saveObject({
        objectID: product.id,
        ...product
      });
    } catch (error) {
      console.error('Error indexing product:', error);
    }
  },

  async indexGig(gig: any) {
    try {
      await gigsIndex.saveObject({
        objectID: gig.id,
        ...gig
      });
    } catch (error) {
      console.error('Error indexing gig:', error);
    }
  },

  async indexJob(job: any) {
    try {
      await jobsIndex.saveObject({
        objectID: job.id,
        ...job
      });
    } catch (error) {
      console.error('Error indexing job:', error);
    }
  },

  async indexUser(user: any) {
    try {
      await usersIndex.saveObject({
        objectID: user.id,
        ...user
      });
    } catch (error) {
      console.error('Error indexing user:', error);
    }
  },

  async deleteProduct(productId: string) {
    try {
      await productsIndex.deleteObject(productId);
    } catch (error) {
      console.error('Error deleting product from index:', error);
    }
  },

  async deleteGig(gigId: string) {
    try {
      await gigsIndex.deleteObject(gigId);
    } catch (error) {
      console.error('Error deleting gig from index:', error);
    }
  },

  async deleteJob(jobId: string) {
    try {
      await jobsIndex.deleteObject(jobId);
    } catch (error) {
      console.error('Error deleting job from index:', error);
    }
  },

  async getAutocompleteSuggestions(query: string, type: 'products' | 'gigs' | 'jobs' | 'users') {
    try {
      let index;
      switch (type) {
        case 'products':
          index = productsIndex;
          break;
        case 'gigs':
          index = gigsIndex;
          break;
        case 'jobs':
          index = jobsIndex;
          break;
        case 'users':
          index = usersIndex;
          break;
        default:
          return [];
      }

      const results = await index.search(query, {
        hitsPerPage: 5,
        attributesToRetrieve: ['objectID', 'title', 'name']
      });

      return results.hits.map(hit => ({
        id: hit.objectID,
        title: hit.title || hit.name,
        type
      }));
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error);
      return [];
    }
  },

  async saveSearch(userId: string, query: string, type: string, filters?: SearchFilters) {
    try {
      const { data, error } = (await supabase
        .from('saved_searches' as never)
        .insert({
          user_id: userId,
          query,
          search_type: type,
          filters: filters ? JSON.stringify(filters) : null,
        } as never)) as {
        data: unknown;
        error: unknown;
      };
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving search:', error);
    }
  },

  async getSavedSearches(userId: string) {
    try {
      const { data, error } = (await supabase
        .from('saved_searches' as never)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })) as {
        data: unknown;
        error: unknown;
      };
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }
  },

  async deleteSavedSearch(searchId: string) {
    try {
      const { error } = (await supabase
        .from('saved_searches' as never)
        .delete()
        .eq('id', searchId)) as {
        error: unknown;
      };
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  },

  applyFilters(items: any[], filters: SearchFilters) {
    let filtered = items;

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => (item.price || item.budget || 0) >= filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => (item.price || item.budget || 0) <= filters.maxPrice);
    }

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.rating !== undefined) {
      filtered = filtered.filter(item => (item.rating || 0) >= filters.rating);
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(item => 
        item.skills_required?.some((skill: string) => filters.skills!.includes(skill)) ||
        item.skills?.some((skill: string) => filters.skills!.includes(skill))
      );
    }

    return filtered;
  },

  sortResults(items: any[], sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating' = 'relevance') {
    const sorted = [...items];

    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => (a.price || a.budget || 0) - (b.price || b.budget || 0));
      case 'price_desc':
        return sorted.sort((a, b) => (b.price || b.budget || 0) - (a.price || a.budget || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'relevance':
      default:
        return sorted;
    }
  }
};
