import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

const TrackingTimeline = ({ statusHistory }) => {
  // Define all possible statuses in order
  const orderedStatuses = [
    'Booked',
    'Confirmed',
    'Driver Assigned',
    'Out for Pickup',
    'Collected',
    'Payment Done'
  ];

  // Provide a default history if none is available
  const history = statusHistory || orderedStatuses.map(status => ({
    status,
    completed: false,
    date: '',
    time: ''
  }));

  return (
    <div>
      <h3 className="text-xl font-bold text-[#5D4037] mb-4">Tracking Status</h3>
      <div className="space-y-4">
        {history.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-4">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                item.completed 
                  ? 'bg-gradient-to-br from-[#66BB6A] to-[#4CAF50] text-white'
                  : 'bg-gray-200 text-gray-400'
              } shadow-lg`}>
                {item.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
              </div>
              {idx < history.length - 1 && (
                <div className={`absolute top-10 left-5 w-0.5 h-12 ${
                  item.completed ? 'bg-[#66BB6A]' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
            <div className="flex-1">
              <div className={`font-bold ${item.completed ? 'text-[#5D4037]' : 'text-gray-400'}`}>
                {item.status}
              </div>
              {item.completed && item.date && (
                <div className="text-sm text-gray-600">
                  {item.date} at {item.time}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingTimeline;
