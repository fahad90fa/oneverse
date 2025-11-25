import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from 'react-countup';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  gradient: string;
  trend?: number;
  onClick?: () => void;
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  onClick,
  isLoading = false
}: StatCardProps) => {
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className="glass-effect border-border relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <TrendingUp className="h-4 w-4" />
                {trend >= 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            
            {isLoading ? (
              <div className="h-8 bg-muted rounded animate-pulse" />
            ) : (
              <motion.div
                key={value}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-bold"
              >
                {isNumeric ? (
                  <CountUp 
                    end={value as number} 
                    duration={1}
                    separator=","
                    prefix={typeof value === 'number' && value > 1000 ? '$' : ''}
                  />
                ) : (
                  value
                )}
              </motion.div>
            )}
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      </Card>
    </motion.div>
  );
};
