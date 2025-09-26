'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { getTimeRemaining, getUrgencyClasses, formatDueDate } from '@/lib/time-utils';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CountdownBadgeProps {
  dueDate: string;
  showIcon?: boolean;
  showFullDate?: boolean;
  className?: string;
}

export function CountdownBadge({ 
  dueDate, 
  showIcon = true, 
  showFullDate = false,
  className = '' 
}: CountdownBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(dueDate));
  
  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(dueDate));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [dueDate]);
  
  const urgencyClasses = getUrgencyClasses(timeRemaining.urgencyLevel, timeRemaining.isOverdue);
  
  const getIcon = () => {
    if (timeRemaining.isOverdue) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    
    switch (timeRemaining.urgencyLevel) {
      case 'critical':
        return <AlertTriangle className="h-3 w-3" />;
      case 'high':
        return <Clock className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };
  
  const getDisplayText = () => {
    if (showFullDate) {
      return formatDueDate(dueDate);
    }
    return timeRemaining.timeRemaining;
  };
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && getIcon()}
      <Badge 
        className={`${urgencyClasses.badge} text-xs font-medium px-2 py-1`}
        variant="outline"
      >
        {getDisplayText()}
      </Badge>
    </div>
  );
}

// Compact version for table rows
export function CompactCountdownBadge({ dueDate }: { dueDate: string }) {
  return (
    <CountdownBadge 
      dueDate={dueDate} 
      showIcon={false} 
      className="text-xs"
    />
  );
}

// Full version with date and time
export function FullCountdownBadge({ dueDate }: { dueDate: string }) {
  return (
    <CountdownBadge 
      dueDate={dueDate} 
      showIcon={true} 
      showFullDate={true}
      className="text-sm"
    />
  );
}

