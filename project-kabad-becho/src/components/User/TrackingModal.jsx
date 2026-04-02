import React from 'react';
import { X, User, Phone, MapPin, Download, Star } from 'lucide-react';
import TrackingTimeline from './TrackingTimeline';
import LiveMap from './LiveMap';
import { useRealtimeTracking } from '../../hooks/useRealtimeTracking';
import { generateInvoice } from '../../utils/invoiceGenerator';

const TrackingModal = ({ selectedPickup, onClose, getStatusColor }) => {
  const { trackingData, eta, updateStatus } = useRealtimeTracking(selectedPickup.id, selectedPickup);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${getStatusColor(trackingData.status || selectedPickup.status)} p-8 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-6xl">{trackingData.emoji || selectedPickup.emoji}</div>
            <div>
              <div className="text-sm opacity-90">Booking Details</div>
              <div className="text-3xl font-bold">{trackingData.id || selectedPickup.id}</div>
              <div className="text-sm opacity-90 mt-1">{trackingData.scrapType || selectedPickup.scrapType}</div>
              
              {/* Show ETA only if tracking is active (not completed/paid) */}
              {eta && trackingData.status !== 'completed' && trackingData.status !== 'Payment Done' && (
                <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className="text-xs uppercase tracking-wider font-bold opacity-80">Live ETA</div>
                  <div className="text-lg font-bold">{eta}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6">
          

          {/* Pickup Info */}
          <div>
            <h3 className="text-xl font-bold text-[#5D4037] mb-4">Pickup Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#E8F5E9] p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Date</div>
                <div className="font-bold text-[#5D4037]">{trackingData.date || selectedPickup.date}</div>
              </div>
              <div className="bg-[#E8F5E9] p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Time Slot</div>
                <div className="font-bold text-[#5D4037]">{trackingData.time || selectedPickup.time}</div>
              </div>
              <div className="bg-[#E8F5E9] p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Weight</div>
                <div className="font-bold text-[#5D4037]">{trackingData.weight || selectedPickup.weight}</div>
              </div>
              <div className="bg-[#E8F5E9] p-4 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Amount</div>
                <div className="font-bold text-[#66BB6A] text-xl">{trackingData.amount || selectedPickup.amount}</div>
              </div>
            </div>
          </div>

          {/* Live Map - Only show if not completed/paid */}
          {trackingData.status !== 'completed' && trackingData.status !== 'Payment Done' && (
            <div>
              <h3 className="text-xl font-bold text-[#5D4037] mb-4">Live Tracking Map</h3>
              <LiveMap 
                  driverLocation={trackingData.driverLocation} 
                  pickupLocation={trackingData.pickupLocation} 
                  deliveryLocation={trackingData.deliveryLocation}
              />
            </div>
          )}

          {/* Status Timeline */}
          <TrackingTimeline statusHistory={trackingData.statusHistory || selectedPickup.statusHistory} />

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-[#5D4037] mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <User className="text-[#66BB6A]" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Customer</div>
                  <div className="font-medium text-gray-700">{trackingData.customer || selectedPickup.customer}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Phone className="text-[#66BB6A]" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium text-gray-700">{trackingData.phone || selectedPickup.phone}</div>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <MapPin className="text-[#66BB6A] shrink-0 mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <div className="font-medium text-gray-700">{trackingData.address || selectedPickup.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => generateInvoice({ ...selectedPickup, ...trackingData })}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#66BB6A] to-[#4CAF50] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Download size={20} />
              <span>
                {trackingData.status === 'completed' || trackingData.status === 'Payment Done' 
                  ? 'Download Receipt' 
                  : 'Download Order Summary'}
              </span>
            </button>
            {(trackingData.status === 'completed' || trackingData.status === 'Payment Done') && !selectedPickup.rating && (
              <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-[#66BB6A] text-[#66BB6A] font-bold rounded-xl hover:bg-[#E8F5E9] transition-all duration-300">
                <Star size={20} />
                <span>Rate Service</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;
