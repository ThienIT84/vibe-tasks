'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Search, X, RotateCcw } from 'lucide-react';
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== searchParams.q) {
      updateUrl({ q: debouncedQuery || undefined, page: undefined });
    }
  }, [debouncedQuery]);

  const updateUrl = useCallback((newParams: Record<string, string | undefined>) => {
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
    router.push(newUrl);
  }, [searchParams, router]);

  const handleStatusChange = (status: string) => {
    updateUrl({ 
      status: status === 'all' ? undefined : status as TaskStatus,
      page: undefined 
    });
  };

  const handlePriorityChange = (priority: string) => {
    updateUrl({ 
      priority: priority === 'all' ? undefined : priority as TaskPriority,
      page: undefined 
    });
  };

  const handleSortChange = (sort: string) => {
    updateUrl({ 
      sort: sort === 'inserted_at' ? undefined : sort,
      page: undefined 
    });
  };

  const handleDirChange = (dir: string) => {
    updateUrl({ 
      dir: dir === 'desc' ? undefined : dir as 'asc' | 'desc',
      page: undefined 
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    router.push('/tasks');
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
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <Select
            value={searchParams.status || 'all'}
            onValueChange={handleStatusChange}
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
