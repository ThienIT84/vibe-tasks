'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ColorPaletteDemo() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Improved Color Palette Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badges */}
          <div className="space-y-3">
            <h3 className="font-semibold">Status Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                Done
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300">
                In Progress
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                Pending
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300">
                Archived
              </Badge>
            </div>
          </div>

          {/* Priority Badges */}
          <div className="space-y-3">
            <h3 className="font-semibold">Priority Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300">
                Urgent
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300">
                High
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                Medium
              </Badge>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                Low
              </Badge>
            </div>
          </div>

          {/* Selectors */}
          <div className="space-y-3">
            <h3 className="font-semibold">Selectors</h3>
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="w-32 h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-20 h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <h3 className="font-semibold">Action Buttons</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                👁️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-500 hover:text-red-600 dark:hover:text-red-400"
              >
                🗑️
              </Button>
            </div>
          </div>

          {/* Task Card Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold">Task Card Preview</h3>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sample Task
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This is a sample task description to show the improved color scheme.
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300">
                  Done
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300">
                  Medium
                </Badge>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Due: Oct 01, 2025
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
