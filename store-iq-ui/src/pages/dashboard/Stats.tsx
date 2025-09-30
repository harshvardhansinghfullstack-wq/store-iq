"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const VIDEO_TYPE_OPTIONS = [
  { value: "all-videos", label: "All videos" },
  { value: "published", label: "Published" },
  { value: "drafts", label: "Drafts" },
];

const DATE_RANGE_OPTIONS = [
  { value: "last-1-day", label: "Last 1 day" },
  { value: "last-7-days", label: "Last 7 days" },
  { value: "last-30-days", label: "Last 30 days" },
  { value: "last-90-days", label: "Last 90 days" },
];

const CHART_TYPES = [
  { value: "area", label: "Area Chart" },
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
];

const COLORS = {
  videoGenerated: "#ef4444",
  imageGenerated: "#f59e42",
  scriptGenerated: "#10b981",
  published: "#3b82f6",
  background: {
    card: "bg-storiq-card-bg",
    chart: "#1c1c24",
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-storiq-card-bg border border-storiq-border rounded-lg p-4 shadow-lg">
        <p className="text-white font-semibold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white">{entry.name}:</span>
            <span className="font-semibold text-white ml-2">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Stats = () => {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [chartType, setChartType] = useState("area");

  type Stat = {
    title: string;
    value: string | number;
    change: string;
    changeType: "positive" | "negative";
    comparison: string;
    icon?: string;
  };

  type TimeseriesPoint = {
    label: string;
    aiVideosGeneratedCount?: number;
    aiImagesGeneratedCount?: number;
    scriptGeneratedCount: number;
    publishedCount: number;
  };

  const [stats, setStats] = useState<Stat[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert dateRange to startDate and endDate
  function getDateRangeParams(range: string) {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (range) {
      case "last-1-day":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        endDate = now;
        break;
      case "last-7-days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        endDate = now;
        break;
      case "last-30-days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 29);
        endDate = now;
        break;
      case "last-90-days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 89);
        endDate = now;
        break;
      default:
        startDate = null;
        endDate = null;
    }
    // Always use full ISO string for backend compatibility
    return {
      startDate: startDate ? startDate.toISOString() : "",
      endDate: endDate ? endDate.toISOString() : "",
    };
  }

  useEffect(() => {
    let ignore = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { startDate, endDate } = getDateRangeParams(dateRange);
        const params = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        const query = params.length ? `?${params.join("&")}` : "";

        const [summaryRes, timeseriesRes] = await Promise.all([
          fetch(`/api/stats/summary${query}`),
          fetch(`/api/stats/timeseries${query}`),
        ]);

        if (!summaryRes.ok || !timeseriesRes.ok) {
          throw new Error("Failed to fetch stats");
        }

        const [summaryData, timeseriesData] = await Promise.all([
          summaryRes.json(),
          timeseriesRes.json(),
        ]);

        if (!ignore) {
          setStats(summaryData.stats || []);
          setTimeseries(timeseriesData.data || []);
        }
      } catch (e) {
        if (!ignore)
          setError(e instanceof Error ? e.message : "Error loading stats");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [dateRange]);

  // Calculate total metrics for pie chart
  const totalMetrics = timeseries.reduce(
    (acc, point) => ({
      videoGenerated: acc.videoGenerated + (point.aiVideosGeneratedCount || 0),
      imageGenerated: acc.imageGenerated + (point.aiImagesGeneratedCount || 0),
      scriptGenerated: acc.scriptGenerated + point.scriptGeneratedCount,
      published: acc.published + point.publishedCount,
    }),
    { videoGenerated: 0, imageGenerated: 0, scriptGenerated: 0, published: 0 }
  );

  const pieData = [
    {
      name: "Videos Generated",
      value: totalMetrics.videoGenerated,
      color: COLORS.videoGenerated,
    },
    {
      name: "Images Generated",
      value: totalMetrics.imageGenerated,
      color: COLORS.imageGenerated,
    },
    {
      name: "Scripts Generated",
      value: totalMetrics.scriptGenerated,
      color: COLORS.scriptGenerated,
    },
    {
      name: "Published",
      value: totalMetrics.published,
      color: COLORS.published,
    },
  ].filter((item) => item.value > 0);

  const renderChart = () => {
    if (chartType === "line") {
      return (
        <LineChart
          data={timeseries}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fill: "#9CA3AF" }} axisLine={false} />
          <YAxis tick={{ fill: "#9CA3AF" }} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="aiVideosGeneratedCount"
            name="Videos Generated"
            stroke={COLORS.videoGenerated}
            strokeWidth={3}
            dot={{ fill: COLORS.videoGenerated, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="aiImagesGeneratedCount"
            name="Images Generated"
            stroke={COLORS.imageGenerated}
            strokeWidth={3}
            dot={{ fill: COLORS.imageGenerated, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="scriptGeneratedCount"
            name="Scripts Generated"
            stroke={COLORS.scriptGenerated}
            strokeWidth={3}
            dot={{ fill: COLORS.scriptGenerated, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="publishedCount"
            name="Published"
            stroke={COLORS.published}
            strokeWidth={3}
            dot={{ fill: COLORS.published, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    if (chartType === "bar") {
      return (
        <BarChart
          data={timeseries}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fill: "#9CA3AF" }} axisLine={false} />
          <YAxis tick={{ fill: "#9CA3AF" }} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="aiVideosGeneratedCount"
            name="Videos Generated"
            fill={COLORS.videoGenerated}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="aiImagesGeneratedCount"
            name="Images Generated"
            fill={COLORS.imageGenerated}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="scriptGeneratedCount"
            name="Scripts Generated"
            fill={COLORS.scriptGenerated}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="publishedCount"
            name="Published"
            fill={COLORS.published}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      );
    }

    // Default area chart
    return (
      <AreaChart
        data={timeseries}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorVideoGenerated" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={COLORS.videoGenerated}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={COLORS.videoGenerated}
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="colorImageGenerated" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={COLORS.imageGenerated}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={COLORS.imageGenerated}
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="colorScriptGenerated" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={COLORS.scriptGenerated}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={COLORS.scriptGenerated}
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.published} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.published} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="label" tick={{ fill: "#9CA3AF" }} axisLine={false} />
        <YAxis tick={{ fill: "#9CA3AF" }} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="aiVideosGeneratedCount"
          name="Videos Generated"
          stroke={COLORS.videoGenerated}
          fill="url(#colorVideoGenerated)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="aiImagesGeneratedCount"
          name="Images Generated"
          stroke={COLORS.imageGenerated}
          fill="url(#colorImageGenerated)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="scriptGeneratedCount"
          name="Scripts Generated"
          stroke={COLORS.scriptGenerated}
          fill="url(#colorScriptGenerated)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="publishedCount"
          name="Published"
          stroke={COLORS.published}
          fill="url(#colorPublished)"
          strokeWidth={2}
        />
      </AreaChart>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Performance Analytics
            </h1>
            <p className="text-white/60">
              Track and analyze your content performance metrics
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              Real-time Data
            </Badge>
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300"
            >
              {dateRange.replace("last-", "").replace("-", " ")}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-storiq-card-bg border-storiq-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="space-y-2">
                <label className="text-sm text-white/60">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full lg:w-48 bg-storiq-card-bg/50 border-storiq-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-storiq-card-bg border-storiq-border">
                    {DATE_RANGE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-white"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-storiq-card-bg border-storiq-border">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-1/3 bg-white/10 mb-2" />
                  <Skeleton className="h-8 w-2/3 bg-white/20 mb-2" />
                  <Skeleton className="h-6 w-16 bg-white/10" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card className="col-span-5 bg-storiq-card-bg border-storiq-border">
              <CardContent className="p-6 text-center">
                <span className="text-red-400">Error: {error}</span>
              </CardContent>
            </Card>
          ) : stats.length === 0 ? (
            <Card className="col-span-5 bg-storiq-card-bg border-storiq-border">
              <CardContent className="p-6 text-center">
                <span className="text-white/60">
                  No statistics available for the selected filters.
                </span>
              </CardContent>
            </Card>
          ) : (
            <>
              {stats.slice(0, 4).map((stat, index) => (
                <Card
                  key={index}
                  className="group relative bg-gradient-to-br from-storiq-card-bg to-storiq-card-bg/80 border border-storiq-border/50 hover:border-storiq-purple/40 transition-all duration-300 hover:shadow-lg hover:shadow-storiq-purple/10 overflow-hidden"
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-storiq-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardContent className="relative p-5">
                    {/* Header with icon placeholder and badge */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {/* Icon based on stat type */}
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            stat.title.includes("Video")
                              ? "bg-red-500/20 text-red-400"
                              : stat.title.includes("Image")
                              ? "bg-orange-500/20 text-orange-400"
                              : stat.title.includes("Script")
                              ? "bg-green-500/20 text-green-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {stat.title.includes("Video") ? (
                            // Play Button SVG
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <polygon
                                points="10,8 16,12 10,16"
                                fill="currentColor"
                              />
                            </svg>
                          ) : stat.title.includes("Image") ? (
                            // Landscape/Photo SVG
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <rect
                                x="4"
                                y="4"
                                width="16"
                                height="16"
                                rx="3"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <circle
                                cx="8.5"
                                cy="9"
                                r="1.5"
                                fill="currentColor"
                              />
                              <path
                                d="M4 17l4.5-6 4.5 6 4-5 3 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          ) : stat.title.includes("Script") ? (
                            // Document/Text SVG
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <rect
                                x="5"
                                y="4"
                                width="14"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="none"
                              />
                              <line
                                x1="8"
                                y1="8"
                                x2="16"
                                y2="8"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="8"
                                y1="12"
                                x2="16"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <line
                                x1="8"
                                y1="16"
                                x2="13"
                                y2="16"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          ) : (
                            // Chart/Bar SVG
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="w-6 h-6"
                            >
                              <rect
                                x="4"
                                y="13"
                                width="3"
                                height="7"
                                rx="1"
                                fill="currentColor"
                              />
                              <rect
                                x="9"
                                y="9"
                                width="3"
                                height="11"
                                rx="1"
                                fill="currentColor"
                              />
                              <rect
                                x="14"
                                y="6"
                                width="3"
                                height="14"
                                rx="1"
                                fill="currentColor"
                              />
                              <rect
                                x="19"
                                y="3"
                                width="3"
                                height="17"
                                rx="1"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                        </div>
                        <CardDescription className="text-white/70 text-xs font-medium">
                          {stat.title === "Videos Published to YouTube"
                            ? "Published Videos"
                            : stat.title}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          stat.changeType === "positive"
                            ? "default"
                            : "destructive"
                        }
                        className={`text-xs px-2 py-1 ${
                          stat.changeType === "positive"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {stat.change}
                      </Badge>
                    </div>

                    {/* Main value */}
                    <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-storiq-purple/90 transition-colors">
                      {stat.value}
                    </CardTitle>

                    {/* Comparison text */}
                    {/* Comparison text removed */}

                    {/* Bottom accent line */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        stat.title.includes("Video")
                          ? "bg-red-500/30"
                          : stat.title.includes("Image")
                          ? "bg-orange-500/30"
                          : stat.title.includes("Script")
                          ? "bg-green-500/30"
                          : "bg-blue-500/30"
                      } group-hover:h-1 transition-all duration-300`}
                    />
                  </CardContent>
                </Card>
              ))}

              {/* Fifth card with special styling if it exists */}
              {stats.length > 4 && (
                <Card className="group relative bg-gradient-to-br from-storiq-purple/10 to-storiq-card-bg border border-storiq-purple/30 hover:border-storiq-purple/50 transition-all duration-300 hover:shadow-lg hover:shadow-storiq-purple/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-storiq-purple/5 via-transparent to-transparent opacity-50" />

                  <CardContent className="relative p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-storiq-purple/20 text-storiq-purple flex items-center justify-center text-sm font-bold">
                          ⭐
                        </div>
                        <CardDescription className="text-white/70 text-xs font-medium">
                          {stats[4].title === "Videos Published to YouTube"
                            ? "Published Videos"
                            : stats[4].title}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          stats[4].changeType === "positive"
                            ? "default"
                            : "destructive"
                        }
                        className={`text-xs px-2 py-1 ${
                          stats[4].changeType === "positive"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {stats[4].change}
                      </Badge>
                    </div>

                    <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-storiq-purple transition-colors">
                      {stats[4].value}
                    </CardTitle>

                    {/* Comparison text removed */}

                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-storiq-purple/40 group-hover:h-1 transition-all duration-300" />
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 bg-storiq-card-bg border-storiq-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Performance Trends</CardTitle>
                <CardDescription className="text-white/60">
                  Activity over time
                </CardDescription>
              </div>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32 bg-storiq-card-bg/50 border-storiq-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-storiq-card-bg border-storiq-border">
                  {CHART_TYPES.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-white"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="w-full h-64 bg-white/10 rounded-xl" />
                  </div>
                ) : error ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-red-400">{error}</span>
                  </div>
                ) : timeseries.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/60">
                      No chart data available
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart and Summary */}
          <Card className="bg-storiq-card-bg border-storiq-border">
            <CardHeader>
              <CardTitle className="text-white">Distribution</CardTitle>
              <CardDescription className="text-white/60">
                Total metrics breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="w-48 h-48 rounded-full bg-white/10" />
                  </div>
                ) : pieData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/60">
                      No data for distribution
                    </span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Summary Stats */}
              <div className="space-y-3 mt-4 overflow-x-auto">
                {pieData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between min-w-0 flex-wrap"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white/70 text-sm truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-white font-semibold break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
      </div>
    </DashboardLayout>
  );
};

export default Stats;
