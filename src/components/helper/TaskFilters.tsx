
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Filter, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskFiltersProps {
  selectedHours: string[];
  selectedCategories: string[];
  onHoursChange: (hours: string) => void;
  onCategoryChange: (category: string) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  selectedHours,
  selectedCategories,
  onHoursChange,
  onCategoryChange
}) => {
  const hourOptions = [
    { value: '1-2 hours', label: '1-2 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '2-4 hours', label: '2-4 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '4-6 hours', label: '4-6 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '6-8 hours', label: '6-8 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '8-12 hours', label: '8-12 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '12-24 hours', label: '12-24 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '24-48 hours', label: '24-48 hours', color: 'bg-orange-100 text-orange-800' },
    { value: '48+ hours', label: '48+ hours', color: 'bg-orange-100 text-orange-800' }
  ];

  const categoryOptions = [
    { value: 'cleaning', label: 'Cleaning', color: 'bg-blue-100 text-blue-800' },
    { value: 'gardening', label: 'Gardening', color: 'bg-green-100 text-green-800' },
    { value: 'moving', label: 'Moving', color: 'bg-orange-100 text-orange-800' },
    { value: 'home_maintenance', label: 'Home Maintenance', color: 'bg-purple-100 text-purple-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  // Remove the handleClearFilters function and any buttons from the filter UI

  const hasActiveFilters = selectedHours.length > 0 || selectedCategories.length > 0;

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active Filters</Label>
            {/* Removed Clear Filters Button */}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedHours.map(hours => (
              <Badge key={hours} variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {hours}
                {/* Removed Clear Hours Button */}
              </Badge>
            ))}
            {selectedCategories.map(category => (
              <Badge key={category} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {categoryOptions.find(c => c.value === category)?.label}
                {/* Removed Clear Category Button */}
              </Badge>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Hours Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Duration
        </Label>
        <div className="space-y-3">
          {hourOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <Checkbox
                id={option.value}
                checked={selectedHours.includes(option.value)}
                onCheckedChange={() => onHoursChange(option.value)}
              />
              <Label
                htmlFor={option.value}
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <span className="text-sm">{option.label}</span>
                {/* Removed duration badge */}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Select task durations you're available for
        </p>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Category
        </Label>
        <div className="space-y-3">
          {categoryOptions.map((category) => (
            <div key={category.value} className="flex items-center space-x-3">
              <Checkbox
                id={category.value}
                checked={selectedCategories.includes(category.value)}
                onCheckedChange={() => onCategoryChange(category.value)}
              />
              <Label
                htmlFor={category.value}
                className="flex-1 cursor-pointer flex items-center justify-between"
              >
                <span className="text-sm">
                  {category.value === 'home_maintenance'
                    ? (<span>Home<br/>Maintenance</span>)
                    : category.label}
                </span>
                {/* Removed category badge */}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Choose task categories that match your skills
        </p>
      </div>
    </div>
  );
};
