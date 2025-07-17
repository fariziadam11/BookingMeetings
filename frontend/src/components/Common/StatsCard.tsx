import React from 'react';

const StatsCard = ({ 
  title, 
  count, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  count: number; 
  icon: React.ComponentType<any>; 
  color: 'amber' | 'green' | 'red' 
}) => {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  const textColorClasses = {
    amber: 'text-amber-900',
    green: 'text-green-900',
    red: 'text-red-900'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center">
        <Icon className="h-8 w-8" />
        <div className="ml-4">
          <p className="text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{count}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 