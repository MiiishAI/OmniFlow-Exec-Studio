import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, CheckCircle, Flame } from 'lucide-react';
import { Task, AppTheme } from '../types';
import { getThemeConfig } from '../utils/theme';

interface ProductivityTrendChartProps {
  tasks: Task[];
  theme?: AppTheme;
}

export const ProductivityTrendChart: React.FC<ProductivityTrendChartProps> = ({ tasks, theme = 'executive_gold' }) => {
  const themeConfig = getThemeConfig(theme);
  // Generate the last 7 calendar days
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - idx));
    const isoDate = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const dayName = dayNames[d.getDay()];
    const dateFormatted = `${monthNames[d.getMonth()]} ${d.getDate()}`;

    // Filter tasks completed on this date
    const completedTasksOnDay = tasks.filter((t) => {
      if (!t.completed) return false;
      if (t.completedAt) {
        return t.completedAt === isoDate;
      }
      // If completedAt is missing, fall back to createdAt if matching or spread realistically
      return t.createdAt === isoDate;
    });

    return {
      date: isoDate,
      dayLabel: idx === 6 ? 'Today' : `${dayName} ${d.getDate()}`,
      fullLabel: `${dayName}, ${dateFormatted}`,
      completed: completedTasksOnDay.length,
      taskTitles: completedTasksOnDay.map((t) => t.title),
    };
  });

  const totalCompleted7Days = last7DaysData.reduce((acc, curr) => acc + curr.completed, 0);
  const peakThroughput = Math.max(...last7DaysData.map((d) => d.completed), 1);
  const todayCount = last7DaysData[6]?.completed || 0;

  // Custom luxury tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div
          className="p-3 rounded-xl shadow-xl shadow-black/80 space-y-1 border"
          style={{
            backgroundColor: themeConfig.bgApp,
            borderColor: themeConfig.borderAccent,
          }}
        >
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-white">{dataPoint.fullLabel}</span>
            <span
              className="font-mono font-bold px-1.5 py-0.5 rounded border text-[11px]"
              style={{
                color: themeConfig.accentColor,
                backgroundColor: themeConfig.badgeBg,
                borderColor: themeConfig.borderAccent,
              }}
            >
              {dataPoint.completed} {dataPoint.completed === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          {dataPoint.taskTitles.length > 0 ? (
            <div className="pt-1 border-t border-white/5 space-y-0.5">
              {dataPoint.taskTitles.slice(0, 3).map((title: string, i: number) => (
                <div key={i} className="text-[10px] text-[#B8BAC2] truncate max-w-[200px]">
                  • {title}
                </div>
              ))}
              {dataPoint.taskTitles.length > 3 && (
                <div className="text-[10px] text-[#797C86]">
                  +{dataPoint.taskTitles.length - 3} more items
                </div>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-[#797C86]">No task completions recorded</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header Stat Strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-[#16171D] border border-white/5">
          <span className="text-[10px] sm:text-[11px] text-[#797C86] block">7-Day Total</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-[#E5C158] font-mono tabular-nums">
              {totalCompleted7Days}
            </span>
            <span className="text-[10px] text-[#797C86]">Cleared</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#16171D] border border-white/5">
          <span className="text-[10px] sm:text-[11px] text-[#797C86] block">Peak Day</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
              {peakThroughput}
            </span>
            <span className="text-[10px] text-[#797C86]">Tasks/Day</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl bg-[#16171D] border border-white/5">
          <span className="text-[10px] sm:text-[11px] text-[#797C86] block">Today</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-[#c3d3be] font-mono tabular-nums">
              {todayCount}
            </span>
            <span className="text-[10px] text-[#c3d3be] font-medium">Logged</span>
          </div>
        </div>
      </div>

      {/* Recharts Area / Line Chart Container */}
      <div className="w-full h-52 sm:h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="themeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeConfig.chartStopStart} stopOpacity={0.28} />
                <stop offset="95%" stopColor={themeConfig.chartStopEnd} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              stroke="#797C86"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#797C86"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="completed"
              stroke={themeConfig.chartStroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#themeAreaGrad)"
              dot={{ r: 3.5, fill: themeConfig.bgApp, stroke: themeConfig.chartStroke, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: themeConfig.chartStroke, stroke: themeConfig.bgApp, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#797C86] border-t border-white/5 pt-2">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" style={{ color: themeConfig.accentColor }} />
          Velocity tracking refreshed live
        </span>
        <span className="text-[10px] font-mono" style={{ color: themeConfig.accentColor }}>
          Last 7 Rolling Days
        </span>
      </div>
    </div>
  );
};
