import React, { useState, useCallback } from 'react';
import ErrorMessage from '../Common/ErrorMessage';
import { Plus } from 'lucide-react';
import type { Room } from '../../types/room';

const RoomForm = ({ 
  onSubmit, 
  isLoading, 
  error, 
  success, 
  room, 
  onCancelEdit 
}: { 
  onSubmit: (name: string, description: string, capacity: number) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  room?: Room;
  onCancelEdit: () => void;
}) => {
  const [name, setName] = useState(room?.name || '');
  const [description, setDescription] = useState(room?.description || '');
  const [capacity, setCapacity] = useState(room?.capacity?.toString() || '');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim(), Number(capacity));
    setName('');
    setDescription('');
    setCapacity('');
  }, [name, description, capacity, onSubmit]);

  const handleCancelEdit = useCallback(() => {
    onCancelEdit();
    setName('');
    setDescription('');
    setCapacity('');
  }, [onCancelEdit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center space-x-2 mb-4">
        <Plus className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {room ? 'Edit Room' : 'Add New Room'}
        </h3>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter room name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter room description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
        <input
          className="block w-full mb-2 p-2 border rounded"
          type="number"
          placeholder="Kapasitas"
          value={capacity}
          onChange={e => setCapacity(e.target.value)}
          required
          min={1}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Menambah...' : 'Tambah Ruangan'}
        </button>
        {room && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Batal Edit
          </button>
        )}
      </div>
      
      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-700">
          Ruangan berhasil ditambah!
        </div>
      )}
    </form>
  );
};

export default RoomForm; 