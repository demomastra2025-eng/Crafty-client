"use client";

import { useState } from "react";
import {
  Heart,
  MapPin,
  Bed,
  Users,
  Bath,
  Maximize2,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const propertyTypes = [
  { id: "house", label: "Дом", icon: "🏠" },
  { id: "apartment", label: "Квартира", icon: "🏢" },
  { id: "commercial", label: "Коммерция", icon: "🏪" },
  { id: "land", label: "Участок", icon: "🏞️" }
];

const properties = [
  {
    id: 1,
    title: "ЖК Тимирязева Skyline",
    location: "Алматы, Бостандыкский район",
    price: 125000000,
    bedrooms: 3,
    guests: 4,
    baths: 2,
    area: "128 м²",
    image: "/logo.png",
    featured: true
  },
  {
    id: 2,
    title: "Апартаменты Expo",
    location: "Астана, Есильский район",
    price: 98500000,
    bedrooms: 2,
    guests: 3,
    baths: 2,
    area: "94 м²",
    image: "/logo.png",
    featured: false
  },
  {
    id: 3,
    title: "Вилла у Каспия",
    location: "Актау, 16-й микрорайон",
    price: 210000000,
    bedrooms: 4,
    guests: 6,
    baths: 3,
    area: "240 м²",
    image: "/logo.png",
    featured: false
  },
  {
    id: 4,
    title: "Лофт Aktobe Plaza",
    location: "Актобе, центр",
    price: 65000000,
    bedrooms: 1,
    guests: 2,
    baths: 1,
    area: "62 м²",
    image: "/logo.png",
    featured: false
  }
];

const basicCriteria = [
  { id: "newly-built", label: "Новостройка" },
  { id: "parking", label: "Паркинг" },
  { id: "furnished", label: "С мебелью" },
  { id: "pool", label: "Бассейн" }
];

export default function RealEstateListings() {
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState(["apartment"]); // ЖК по умолчанию
  const [priceRange, setPriceRange] = useState([120, 320]); // млн ₸
  const [selectedRooms, setSelectedRooms] = useState([2]);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [searchLocation, setSearchLocation] = useState("");
  const placeholderImage = "/free-icon-house-building-9062738.png";

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0
    }).format(price);

  const toggleFavorite = (propertyId: number) => {
    setFavorites((prev) =>
      prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
    );
  };

  const togglePropertyType = (typeId: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
  };

  const toggleRoom = (roomCount: number) => {
    setSelectedRooms((prev) =>
      prev.includes(roomCount) ? prev.filter((count) => count !== roomCount) : [...prev, roomCount]
    );
  };

  const toggleCriteria = (criteriaId: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criteriaId) ? prev.filter((id) => id !== criteriaId) : [...prev, criteriaId]
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Filters */}
      <div className="w-80 border-r bg-white p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Фильтры</h2>

            {/* Location Search */}
            <div className="space-y-2">
              <Label htmlFor="location">Локация</Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="location"
                  placeholder="Введите город или ЖК..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="mb-3 font-medium">Тип недвижимости</h3>
            <div className="grid grid-cols-2 gap-2">
              {propertyTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedPropertyTypes.includes(type.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePropertyType(type.id)}
                  className="h-auto flex-col justify-start gap-1 p-3">
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="mb-3 font-medium">Диапазон цены (млн ₸)</h3>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={450}
                min={50}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{priceRange[0]} млн</span>
                <span>{priceRange[1]} млн</span>
              </div>
            </div>
          </div>

          {/* Number of Rooms */}
          <div>
            <h3 className="mb-3 font-medium">Комнат</h3>
            <div className="flex gap-2">
              {[1, 2, 3, "4+"].map((room) => (
                <Button
                  key={room}
                  variant={
                    selectedRooms.includes(typeof room === "number" ? room : 4)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => toggleRoom(typeof room === "number" ? room : 4)}
                  className="h-12 w-12">
                  {room}
                </Button>
              ))}
            </div>
          </div>

          {/* Basic Criteria */}
          <div>
            <h3 className="mb-3 font-medium">Критерии</h3>
            <div className="space-y-3">
              {basicCriteria.map((criteria) => (
                <div key={criteria.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={criteria.id}
                    checked={selectedCriteria.includes(criteria.id)}
                    onCheckedChange={() => toggleCriteria(criteria.id)}
                  />
                  <Label htmlFor={criteria.id} className="text-sm">
                    {criteria.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Все фильтры
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Найдено {properties.length} объекта</h1>
        </div>

        <div className="space-y-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="relative h-48 w-80">
                    <img
                      src={property.image || placeholderImage}
                      alt={property.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = placeholderImage;
                      }}
                    />
                    {property.featured && (
                      <Badge className="absolute top-3 left-3 bg-blue-600">В приоритете</Badge>
                    )}
                  </div>

                  <div className="flex flex-1 justify-between p-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-1 h-4 w-4" />
                        {property.location}
                      </div>

                      <h3 className="text-xl font-semibold">{property.title}</h3>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms} комнат
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {property.guests} гостей
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.baths} санузла
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Maximize2 className="h-4 w-4" />
                        {property.area}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(property.id)}
                        className="p-2">
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.includes(property.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </Button>

                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatPrice(property.price)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
