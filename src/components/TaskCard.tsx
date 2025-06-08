
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Heart, ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  title: string;
  description: string;
  effort: string;
  price: string;
  location: string;
  postedTime: string;
  isHelper?: boolean;
  rating?: number;
  reviews?: number;
  image?: string;
}

const TaskCard = ({ 
  title, 
  description, 
  effort, 
  price, 
  location, 
  postedTime, 
  isHelper = false,
  rating = 4.8,
  reviews = 24,
  image
}: TaskCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const getEffortStyle = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden border-0 shadow-lg bg-white">
      {/* Image Section - Enhanced */}
      <div className="relative h-56 bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">
              {getEffortIcon(effort)}
            </div>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Heart icon - Modern style */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
        >
          <Heart 
            size={18} 
            className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'} transition-colors duration-300`}
          />
        </button>

        {/* Effort badge - Enhanced */}
        <div className="absolute top-4 left-4">
          <Badge className={`${getEffortStyle(effort)} font-semibold px-3 py-1 rounded-full border shadow-sm`}>
            {getEffortIcon(effort)} {effort} effort
          </Badge>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
          <Star size={14} className="text-yellow-400 fill-current" />
          <span className="text-sm font-semibold text-slate-900">{rating}</span>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Location and Time */}
        <div className="flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center">
            <MapPin size={14} className="mr-1 text-slate-400" />
            <span>{location}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1 text-slate-400" />
            <span>{postedTime}</span>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-slate-900">{price}</span>
              <span className="text-sm text-slate-500">RWF</span>
            </div>
            <span className="text-xs text-slate-400">total payment</span>
          </div>
          
          {isHelper ? (
            <Button 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Submit bid</span>
              <ArrowRight size={14} />
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-200 hover:border-orange-300 hover:text-orange-600 rounded-full px-6 py-2 font-semibold transition-all duration-300 flex items-center space-x-2"
            >
              <span>View details</span>
              <ArrowRight size={14} />
            </Button>
          )}
        </div>

        {/* Reviews info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>{reviews} reviews</span>
          <div className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>Available today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
