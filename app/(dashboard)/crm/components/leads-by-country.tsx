"use client";

import WorldMap, { CountryContext } from "react-svg-worldmap";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { CardOptionsMenu } from "@/components/CardActionMenus";

const data = [
  { country: "KZ", value: 1250 },
  { country: "RU", value: 840 },
  { country: "UZ", value: 560 },
  { country: "KG", value: 320 },
  { country: "TR", value: 410 }
];

const countries = [
  {
    id: 1,
    country: "Казахстан",
    lead_count: "1 250",
    bounce_rate: "5.1%"
  },
  {
    id: 2,
    country: "Россия",
    lead_count: "840",
    bounce_rate: "4.0%"
  },
  {
    id: 3,
    country: "Узбекистан",
    lead_count: "560",
    bounce_rate: "4.8%"
  },
  {
    id: 4,
    country: "Кыргызстан",
    lead_count: "320",
    bounce_rate: "3.1%"
  },
  {
    id: 5,
    country: "Турция",
    lead_count: "410",
    bounce_rate: "5.4%"
  }
];

const getStyle = ({ countryCode }: CountryContext) => {
  let fillColor = "var(--muted)";
  switch (countryCode) {
    case "KZ":
      fillColor = "var(--chart-1)";
      break;
    case "RU":
      fillColor = "var(--chart-2)";
      break;
    case "UZ":
      fillColor = "var(--chart-3)";
      break;
    case "KG":
      fillColor = "var(--chart-4)";
      break;
    case "TR":
      fillColor = "var(--chart-5)";
      break;

    default:
      break;
  }
  return {
    fill: fillColor,
    stroke: "var(--primary)",
    strokeWidth: 1,
    strokeOpacity: 0.2,
    cursor: "pointer"
  };
};

export function LeadsByCountryCard() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle>Лиды по регионам</CardTitle>
        <CardOptionsMenu />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="grid items-center gap-4 lg:grid-cols-2">
          <div className="flex justify-center">
            {isClient ? (
              <WorldMap
                backgroundColor="hsl(var(--background))"
                value-suffix="лидов"
                data={data}
                size="md"
                styleFunction={getStyle}
              />
            ) : null}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Страна</TableHead>
                <TableHead>Лиды</TableHead>
                <TableHead className="text-right">Отказ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium">{country.country}</TableCell>
                  <TableCell>{country.lead_count}</TableCell>
                  <TableCell className="text-right">{country.bounce_rate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
