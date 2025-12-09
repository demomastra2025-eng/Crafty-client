"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

interface ChartDataPoint {
  period: string;
  value: number;
}

interface ChartDataStructure {
  day: ChartDataPoint[];
  week: ChartDataPoint[];
  month: ChartDataPoint[];
  year: ChartDataPoint[];
}

const chartData = {
  day: [
    { period: "00:00", value: 180 },
    { period: "02:00", value: 120 },
    { period: "04:00", value: 90 },
    { period: "06:00", value: 150 },
    { period: "08:00", value: 280 },
    { period: "10:00", value: 320 },
    { period: "12:00", value: 450 },
    { period: "14:00", value: 380 },
    { period: "16:00", value: 420 },
    { period: "18:00", value: 500 },
    { period: "20:00", value: 350 },
    { period: "22:00", value: 500 }
  ],
  week: [
    { period: "Пн", value: 820 },
    { period: "Вт", value: 650 },
    { period: "Ср", value: 900 },
    { period: "Чт", value: 750 },
    { period: "Пт", value: 1100 },
    { period: "Сб", value: 850 },
    { period: "Вс", value: 1000 }
  ],
  month: [
    { period: "Янв", value: 8500 },
    { period: "Фев", value: 4200 },
    { period: "Мар", value: 9800 },
    { period: "Апр", value: 12200 },
    { period: "Май", value: 8500 },
    { period: "Июн", value: 10800 },
    { period: "Июл", value: 7900 },
    { period: "Авг", value: 11100 },
    { period: "Сен", value: 9400 },
    { period: "Окт", value: 14200 },
    { period: "Ноя", value: 10800 },
    { period: "Дек", value: 9600 }
  ],
  year: [
    { period: "2026", value: 8500 },
    { period: "2025", value: 7200 },
    { period: "2024", value: 9800 },
    { period: "2023", value: 11200 },
    { period: "2022", value: 7500 },
    { period: "2021", value: 10500 },
    { period: "2020", value: 8000 }
  ]
};

const chartConfig = {
  views: {
    label: "Визиты"
  },
  desktop: {
    label: "Десктоп",
    color: "var(--chart-1)"
  },
  mobile: {
    label: "Мобильные",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

const filterLabels = {
  day: "24 часа",
  week: "7 дней",
  month: "30 дней",
  year: "12 месяцев"
};

export default function PerformanceAnalytics() {
  const [selectedFilter, setSelectedFilter] = React.useState<keyof ChartDataStructure>("month");
  const currentData = chartData[selectedFilter];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Выручка</CardTitle>
        <CardDescription>
          Динамика трафика и сделок за последние {filterLabels[selectedFilter]}
        </CardDescription>
        <CardAction>
          <Tabs
            defaultValue={selectedFilter}
            onValueChange={(value) => setSelectedFilter(value as keyof ChartDataStructure)}>
            <TabsList>
              {Object.keys(chartData).map((filter, i) => (
                <TabsTrigger key={i} value={filter} className="capitalize">
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <LineChart accessibilityLayer data={currentData}>
            <CartesianGrid vertical={false} />
            <YAxis axisLine={false} tickLine={false} dx={-20} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              dy={10}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{
                strokeWidth: 1,
                stroke: "var(--chart-1)",
                r: 4
              }}
              activeDot={{
                stroke: "var(--chart-primary)",
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
