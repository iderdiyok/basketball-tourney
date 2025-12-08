import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AdminQuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
  enabled?: boolean;
  count?: number;
}

interface AdminDashboardCardProps {
  action: AdminQuickAction;
}

export function AdminDashboardCard({ action }: AdminDashboardCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      icon: 'bg-blue-600 text-white',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'hover:border-blue-300',
      text: 'text-blue-800'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      icon: 'bg-green-600 text-white',
      button: 'bg-green-600 hover:bg-green-700',
      border: 'hover:border-green-300',
      text: 'text-green-800'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      icon: 'bg-orange-600 text-white',
      button: 'bg-orange-600 hover:bg-orange-700',
      border: 'hover:border-orange-300',
      text: 'text-orange-800'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      icon: 'bg-purple-600 text-white',
      button: 'bg-purple-600 hover:bg-purple-700',
      border: 'hover:border-purple-300',
      text: 'text-purple-800'
    }
  };

  const classes = colorClasses[action.color];

  return (
    <Card className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-gray-200 ${classes.border} ${classes.bg}`}>
      <CardHeader className="text-center pb-4">
        <div className={`w-20 h-20 mx-auto ${classes.icon} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
          {action.icon}
        </div>
        <CardTitle className={`text-2xl font-bold ${classes.text}`}>
          {action.title}
          {action.count !== undefined && (
            <span className="ml-2 text-lg font-normal">({action.count})</span>
          )}
        </CardTitle>
        <CardDescription className={`text-lg ${classes.text} opacity-80`}>
          {action.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {action.enabled !== false ? (
          <Link href={action.href}>
            <Button size="lg" className={`w-full h-14 text-lg font-semibold ${classes.button} text-white`}>
              {action.icon}
              <span className="ml-3">{action.title}</span>
            </Button>
          </Link>
        ) : (
          <Button size="lg" disabled className="w-full h-14 text-lg">
            {action.icon}
            <span className="ml-3">Nicht verfügbar</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}