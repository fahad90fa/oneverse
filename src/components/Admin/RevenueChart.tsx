import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  title: string;
  type?: 'line' | 'bar';
  isLoading?: boolean;
}

export const RevenueChart = ({
  data,
  title,
  type = 'line',
  isLoading = false
}: RevenueChartProps) => {
  if (isLoading) {
    return (
      <Card className="glass-effect border-border p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-effect border-border p-6">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                dot={false}
                strokeWidth={2}
                name="Revenue ($)"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                dot={false}
                strokeWidth={2}
                name="Orders"
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
              <Bar dataKey="orders" fill="#10b981" name="Orders" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
};
