import Link from 'next/link';
import { Palette, Cpu, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardHeader } from '@/components/navigation';

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-auto">
      <DashboardHeader />
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/dashboard/overlay-builder" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Overlay Builder</CardTitle>
                <CardDescription>
                  Design custom overlays with our canvas editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open Builder
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/widgets" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mb-4 group-hover:bg-info/20 transition-colors">
                  <Cpu className="h-6 w-6 text-info" />
                </div>
                <CardTitle>Widget Library</CardTitle>
                <CardDescription>
                  Browse and customize pre-built widgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Browse Widgets
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/badges" className="group">
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:bg-success/20 transition-colors">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <CardTitle>Badge Designer</CardTitle>
                <CardDescription>
                  Create custom badges for your channel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Design Badges
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
