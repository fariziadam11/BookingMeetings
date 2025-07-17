import React from 'react';

const EmptyState = ({ title, description, icon: Icon }: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<any> 
}) => (
  <div className="text-center py-12">
    <Icon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

export default EmptyState; 