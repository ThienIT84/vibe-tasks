'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle, ThemeToggleSimple } from '@/components/ui/theme-toggle';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { ColorPaletteDemo } from './color-palette-demo';

export function ThemeDemo() {
  const { theme, actualTheme } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme System Demo
            </CardTitle>
            <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Current Theme</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  (Actual: {actualTheme === 'light' ? 'Light' : 'Dark'})
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Theme Toggle</h3>
              <ThemeToggleSimple />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Light Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clean and bright interface for daytime use
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">Dark Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easy on the eyes for nighttime use
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">System</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically follows your system preference
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Color Palette Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <div className="h-12 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-medium">Primary</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Primary</p>
              </div>
              <div className="space-y-1">
                <div className="h-12 bg-secondary rounded-md flex items-center justify-center">
                  <span className="text-secondary-foreground text-xs font-medium">Secondary</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Secondary</p>
              </div>
              <div className="space-y-1">
                <div className="h-12 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground text-xs font-medium">Muted</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Muted</p>
              </div>
              <div className="space-y-1">
                <div className="h-12 bg-accent rounded-md flex items-center justify-center">
                  <span className="text-accent-foreground text-xs font-medium">Accent</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Accent</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-muted-foreground">
              Theme preference is saved locally and persists across sessions. 
              System theme automatically updates when your OS theme changes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Demo */}
      <ColorPaletteDemo />
    </div>
  );
}
