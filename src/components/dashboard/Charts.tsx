import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { ChartCard } from './ChartCard';
import { useCurrency } from '@/contexts/CurrencyContext';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))'
];

interface CostByToolChartProps {
  data: Array<{ name: string; cost: number }>;
}

export function CostByToolChart({ data }: CostByToolChartProps) {
  const chartData = data.slice(0, 8); // Show top 8 tools
  const { formatCurrency, convertAmount, currency } = useCurrency();

  return (
    <ChartCard 
      title="Monthly Cost by Tool" 
      description="Top spending tools ranked by monthly cost"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData.map(item => ({ ...item, cost: convertAmount(item.cost) }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value).split('.')[0]}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Monthly Cost']}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="cost" 
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface CostByPersonChartProps {
  data: Array<{ person: string; cost: number }>;
}

export function CostByPersonChart({ data }: CostByPersonChartProps) {
  const { formatCurrency, convertAmount } = useCurrency();
  return (
    <ChartCard 
      title="Cost Distribution by Person" 
      description="Monthly spending allocation across team members"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.map(item => ({ ...item, cost: convertAmount(item.cost) }))} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="person" 
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value).split('.')[0]}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Monthly Cost']}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="cost" 
            fill="hsl(var(--chart-2))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface NeedVsWantChartProps {
  data: Array<{ name: string; value: number; cost: number }>;
}

export function NeedVsWantChart({ data }: NeedVsWantChartProps) {
  const { formatCurrency } = useCurrency();
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} tools • {formatCurrency(data.cost)}/month
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard 
      title="Need vs Want Distribution" 
      description="Tool categorization by necessity and cost impact"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface GunaHonestyTrendProps {
  data: Array<{ name: string; honesty: number }>;
}

export function GunaHonestyTrend({ data }: GunaHonestyTrendProps) {
  const chartData = data.slice(0, 10); // Show top 10 tools

  return (
    <ChartCard 
      title="Guna Honesty Meter by Tool" 
      description="Transparency and necessity assessment across tools"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            domain={[0, 10]}
            fontSize={12}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            formatter={(value: number) => [`${value}/10`, 'Honesty Score']}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="honesty" 
            stroke="hsl(var(--chart-3))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}