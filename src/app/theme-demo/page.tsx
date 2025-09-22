import { ThemeDemo } from '@/components/ui/theme-demo';

export default function ThemeDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Theme System Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of our dynamic theme system with seamless light/dark mode switching
          </p>
        </div>
        <ThemeDemo />
      </div>
    </div>
  );
}
