import React from 'react';

interface StrengthBadgeProps {
  score?: number;
  showLabel?: boolean;
}

export function StrengthBadge({ score, showLabel = true }: StrengthBadgeProps) {
  let label = 'Unknown';
  let color = 'bg-muted';
  let textColor = 'text-muted-foreground';

  if (score !== undefined) {
    if (score <= 1) {
      label = 'Weak';
      color = 'bg-destructive';
      textColor = 'text-destructive';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-orange-500';
      textColor = 'text-orange-500';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-blue-500';
      textColor = 'text-blue-500';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-500';
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={`h-1.5 w-4 rounded-full transition-colors ${score !== undefined && i <= score ? color : 'bg-muted'}`} 
          />
        ))}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${textColor}`}>
          {label}
        </span>
      )}
    </div>
  );
}
