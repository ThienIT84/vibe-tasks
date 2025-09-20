'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, RotateCcw, Loader2 } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types/task';

interface TaskFiltersProps {
  searchParams: {
    q?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    sort?: string;
    dir?: 'asc' | 'desc';
    page?: string;
  };
}

export default function TaskFilters({ searchParams }: TaskFiltersProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.q || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.q || '');
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input to reduce requests
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // Reduced from 500ms to 300ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const updateUrl = useCallback((newParams: Record<string, string | undefined>) => {
    console.log('TaskFilters: updateUrl called', {
      newParams,
      currentSearchParams: searchParams,
      currentPage: searchParams.page
    });
    
    // Check if params actually changed to avoid unnecessary requests
    const hasChanges = Object.entries(newParams).some(([key, value]) => {
      const currentValue = searchParams[key as keyof typeof searchParams];
      return currentValue !== value;
    });
    
    if (!hasChanges) {
      console.log('TaskFilters: No changes detected, skipping update');
      return;
    }
    
    console.log('TaskFilters: Changes detected, updating URL');
    setIsLoading(true);
    
    const params = new URLSearchParams();
    
    // Keep existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    
    // Update with new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newUrl = `/tasks?${params.toString()}`;
    router.replace(newUrl);
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 100);
  }, [searchParams, router]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== searchParams.q) {
      // Only reset to page 1 if there's an actual search query change
      const hasSearchQuery = debouncedQuery && debouncedQuery.trim() !== '';
      const hadSearchQuery = searchParams.q && searchParams.q.trim() !== '';
      
      // Only reset page if we're going from no search to search, or search to different search
      if (hasSearchQuery || hadSearchQuery) {
        updateUrl({ q: debouncedQuery || undefined, page: '1' });
      } else {
        // If clearing search, don't reset page
        updateUrl({ q: debouncedQuery || undefined });
      }
    }
  }, [debouncedQuery, searchParams.q, updateUrl]);

  // Reset loading state when searchParams change (data loaded)
  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  // Reset loading state on component mount
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleStatusChange = (status: string) => {
    console.log('TaskFilters: handleStatusChange called', {
      status,
      currentPage: searchParams.page,
      searchParams: searchParams
    });
    updateUrl({ 
      status: status === 'all' ? undefined : status as TaskStatus,
      page: '1' // Reset to page 1 when filtering
    });
  };

  const handlePriorityChange = (priority: string) => {
    updateUrl({ 
      priority: priority === 'all' ? undefined : priority as TaskPriority,
      page: '1' // Reset to page 1 when filtering
    });
  };

  const handleSortChange = (sort: string) => {
    updateUrl({ 
      sort: sort === 'inserted_at' ? undefined : sort,
      page: '1' // Reset to page 1 when sorting
    });
  };

  const handleDirChange = (dir: string) => {
    updateUrl({ 
      dir: dir === 'desc' ? undefined : dir as 'asc' | 'desc',
      page: '1' // Reset to page 1 when changing direction
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setIsLoading(true);
    router.replace('/tasks');
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 100);
  };

  const hasActiveFilters = searchParams.q || searchParams.status || searchParams.priority || 
                          searchParams.sort || searchParams.dir;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tasks by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <Select
            value={searchParams.status || 'all'}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Priority:</label>
          <Select
            value={searchParams.priority || 'all'}
            onValueChange={handlePriorityChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <Select
            value={searchParams.sort || 'inserted_at'}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inserted_at">Created Date</SelectItem>
              <SelectItem value="updated_at">Updated Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Direction */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Order:</label>
          <Select
            value={searchParams.dir || 'desc'}
            onValueChange={handleDirChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchParams.q && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchParams.q}"
              <button
                onClick={() => updateUrl({ q: undefined, page: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchParams.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {searchParams.status}
              <button
                onClick={() => updateUrl({ status: undefined, page: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchParams.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {searchParams.priority}
              <button
                onClick={() => updateUrl({ priority: undefined, page: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchParams.sort && searchParams.sort !== 'inserted_at' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {searchParams.sort}
              <button
                onClick={() => updateUrl({ sort: undefined, page: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchParams.dir && searchParams.dir !== 'desc' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Order: {searchParams.dir}
              <button
                onClick={() => updateUrl({ dir: undefined, page: undefined })}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
