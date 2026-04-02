import React, { useState } from 'react';
import { 
  MapPin, Clock, Calendar, Ban, CheckCircle, 
  Settings as SettingsIcon, ToggleLeft, ToggleRight,
  Save, X, Plus, Trash2
} from 'lucide-react';

const SettingsControls = () => {
  const [serviceAreas, setServiceAreas] = useState([
    { id: 1, location: 'MG Road, Bangalore', enabled: true, pincode: '560001' },
    { id: 2, location: 'Koramangala, Bangalore', enabled: true, pincode: '560034' },
    { id: 3, location: 'Whitefield, Bangalore', enabled: true, pincode: '560066' },
    { id: 4, location: 'Indiranagar, Bangalore', enabled: false, pincode: '560038' },
    { id: 5, location: 'HSR Layout, Bangalore', enabled: true, pincode: '560102' },
  ]);

  const [workingHours, setWorkingHours] = useState({
    weekdays: { start: '09:00', end: '18:00' },
    saturday: { start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '10:00', end: '13:00' },
  });

  const [holidays, setHolidays] = useState([
    { id: 1, date: '2025-01-26', name: 'Republic Day', enabled: true },
    { id: 2, date: '2025-03-25', name: 'Holi', enabled: true },
    { id: 3, date: '2025-08-15', name: 'Independence Day', enabled: true },
    { id: 4, date: '2025-10-02', name: 'Gandhi Jayanti', enabled: true },
  ]);

  const [cancellationPolicy, setCancellationPolicy] = useState({
    allowCancellation: true,
    cancellationWindow: 24, // hours before pickup
    maxCancellationsPerMonth: 3,
    penaltyAfterLimit: true,
  });

  const [platformToggles, setPlatformToggles] = useState({
    autoAcceptRequests: false,
    emailNotifications: true,
    smsNotifications: true,
    maintenanceMode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const toggleServiceArea = (id) => {
    setServiceAreas(serviceAreas.map(area =>
      area.id === id ? { ...area, enabled: !area.enabled } : area
    ));
    setHasChanges(true);
  };

  const addServiceArea = () => {
    const newArea = {
      id: Date.now(),
      location: 'New Location',
      enabled: true,
      pincode: '000000'
    };
    setServiceAreas([...serviceAreas, newArea]);
    setHasChanges(true);
  };

  const removeServiceArea = (id) => {
    setServiceAreas(serviceAreas.filter(area => area.id !== id));
    setHasChanges(true);
  };

  const togglePlatformSetting = (setting) => {
    setPlatformToggles({
      ...platformToggles,
      [setting]: !platformToggles[setting]
    });
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Simulate API call
    setTimeout(() => {
      alert('Settings saved successfully!');
      setHasChanges(false);
    }, 500);
  };

  const discardChanges = () => {
    // Reset to original values
    setHasChanges(false);
    alert('Changes discarded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5D4037]">Settings & Controls</h1>
          <p className="text-gray-600 mt-1">System-level configuration and platform settings</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={discardChanges}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={18} />
              <span>Discard</span>
            </button>
            <button
              onClick={saveSettings}
              className="flex items-center gap-2 px-4 py-2 bg-[#66BB6A] text-white rounded-lg hover:bg-[#4CAF50] transition-colors"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Service Area Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="text-[#66BB6A]" size={24} />
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Service Area Management</h2>
              <p className="text-sm text-gray-600">Enable or disable service locations</p>
            </div>
          </div>
          <button
            onClick={addServiceArea}
            className="flex items-center gap-2 px-4 py-2 bg-[#5D4037] text-white rounded-lg hover:bg-[#4E342E] transition-colors"
          >
            <Plus size={18} />
            <span>Add Area</span>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {serviceAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <MapPin size={20} className={area.enabled ? 'text-[#66BB6A]' : 'text-gray-400'} />
                  <div>
                    <p className="font-medium text-gray-900">{area.location}</p>
                    <p className="text-sm text-gray-500">Pincode: {area.pincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    area.enabled
                      ? 'bg-[#C8E6C9] text-[#2E7D32]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {area.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleServiceArea(area.id)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    {area.enabled ? (
                      <ToggleRight size={28} className="text-[#66BB6A]" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => removeServiceArea(area.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Working Hours Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="text-[#5D4037]" size={24} />
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Working Hours Configuration</h2>
              <p className="text-sm text-gray-600">Set operational hours for different days</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Weekdays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-[#E8F5E9] rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Monday - Friday</p>
              <p className="text-sm text-gray-500">Weekdays</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={workingHours.weekdays.start}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    weekdays: { ...workingHours.weekdays, start: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={workingHours.weekdays.end}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    weekdays: { ...workingHours.weekdays, end: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <CheckCircle className="text-[#66BB6A]" size={20} />
              <span className="text-sm font-medium text-[#66BB6A]">Active</span>
            </div>
          </div>

          {/* Saturday */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-[#E8F5E9] rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Saturday</p>
              <p className="text-sm text-gray-500">Weekend</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={workingHours.saturday.start}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    saturday: { ...workingHours.saturday, start: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={workingHours.saturday.end}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    saturday: { ...workingHours.saturday, end: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <CheckCircle className="text-[#66BB6A]" size={20} />
              <span className="text-sm font-medium text-[#66BB6A]">Active</span>
            </div>
          </div>

          {/* Sunday */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-[#E8F5E9] rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Sunday</p>
              <p className="text-sm text-gray-500">Weekend</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={workingHours.sunday.start}
                disabled={!workingHours.sunday.enabled}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    sunday: { ...workingHours.sunday, start: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent disabled:opacity-50"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={workingHours.sunday.end}
                disabled={!workingHours.sunday.enabled}
                onChange={(e) => {
                  setWorkingHours({
                    ...workingHours,
                    sunday: { ...workingHours.sunday, end: e.target.value }
                  });
                  setHasChanges(true);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setWorkingHours({
                    ...workingHours,
                    sunday: { ...workingHours.sunday, enabled: !workingHours.sunday.enabled }
                  });
                  setHasChanges(true);
                }}
              >
                {workingHours.sunday.enabled ? (
                  <>
                    <CheckCircle className="text-[#66BB6A]" size={20} />
                    <span className="text-sm font-medium text-[#66BB6A] ml-2">Active</span>
                  </>
                ) : (
                  <>
                    <Ban className="text-red-600" size={20} />
                    <span className="text-sm font-medium text-red-600 ml-2">Closed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday / No-Service Dates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="text-[#5D4037]" size={24} />
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Holiday / No-Service Dates</h2>
              <p className="text-sm text-gray-600">Manage days when service is unavailable</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={20} className={holiday.enabled ? 'text-[#5D4037]' : 'text-gray-400'} />
                  <div>
                    <p className="font-medium text-gray-900">{holiday.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    holiday.enabled
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {holiday.enabled ? 'Service Closed' : 'Service Open'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Ban className="text-[#5D4037]" size={24} />
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Cancellation Policy Settings</h2>
              <p className="text-sm text-gray-600">Configure user cancellation rules</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-[#E8F5E9] rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Window (hours before pickup)
              </label>
              <input
                type="number"
                value={cancellationPolicy.cancellationWindow}
                onChange={(e) => {
                  setCancellationPolicy({
                    ...cancellationPolicy,
                    cancellationWindow: parseInt(e.target.value)
                  });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Users can cancel up to this many hours before scheduled pickup
              </p>
            </div>

            <div className="p-4 bg-[#E8F5E9] rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Cancellations Per Month
              </label>
              <input
                type="number"
                value={cancellationPolicy.maxCancellationsPerMonth}
                onChange={(e) => {
                  setCancellationPolicy({
                    ...cancellationPolicy,
                    maxCancellationsPerMonth: parseInt(e.target.value)
                  });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#66BB6A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum allowed cancellations before penalties apply
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform-Wide Toggles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SettingsIcon className="text-[#5D4037]" size={24} />
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">Platform-Wide Controls</h2>
              <p className="text-sm text-gray-600">Global system toggles and features</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Auto Accept Requests */}
          <div className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors">
            <div>
              <p className="font-medium text-gray-900">Auto-Accept Requests</p>
              <p className="text-sm text-gray-500">Automatically accept all incoming pickup requests</p>
            </div>
            <button
              onClick={() => togglePlatformSetting('autoAcceptRequests')}
              className="p-2"
            >
              {platformToggles.autoAcceptRequests ? (
                <ToggleRight size={32} className="text-[#66BB6A]" />
              ) : (
                <ToggleLeft size={32} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email notifications to users</p>
            </div>
            <button
              onClick={() => togglePlatformSetting('emailNotifications')}
              className="p-2"
            >
              {platformToggles.emailNotifications ? (
                <ToggleRight size={32} className="text-[#66BB6A]" />
              ) : (
                <ToggleLeft size={32} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-center justify-between p-4 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-500">Send SMS alerts to users</p>
            </div>
            <button
              onClick={() => togglePlatformSetting('smsNotifications')}
              className="p-2"
            >
              {platformToggles.smsNotifications ? (
                <ToggleRight size={32} className="text-[#66BB6A]" />
              ) : (
                <ToggleLeft size={32} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-900">Maintenance Mode</p>
              <p className="text-sm text-red-600">Disable all user-facing services</p>
            </div>
            <button
              onClick={() => togglePlatformSetting('maintenanceMode')}
              className="p-2"
            >
              {platformToggles.maintenanceMode ? (
                <ToggleRight size={32} className="text-red-600" />
              ) : (
                <ToggleLeft size={32} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsControls;
