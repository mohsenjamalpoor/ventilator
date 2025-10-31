import React from "react";
import { PiBellLight } from "react-icons/pi";

const AlarmModal = ({ show, onClose, alarmRanges }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="bg-blue-600 text-white rounded-t-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiBellLight className="w-6 h-6" />
              <h2 className="text-xl font-bold">Alarm Profile - کودکان</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                Respiratory Rate (RR)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-100 rounded-lg p-2">
                  <p className="text-xs text-red-600">پایین</p>
                  <p className="font-bold text-red-800">{alarmRanges.rr.low}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <p className="text-xs text-green-600">فعلی</p>
                  <p className="font-bold text-green-800">{alarmRanges.rr.current}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <p className="text-xs text-yellow-600">بالا</p>
                  <p className="font-bold text-yellow-800">{alarmRanges.rr.high}</p>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2 text-center">
                واحد: {alarmRanges.rr.unit}
              </p>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <h3 className="font-bold text-teal-800 mb-2 flex items-center gap-2">
                تهویه دقیقه‌ای (MVent)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-100  rounded-lg p-2">
                  <p className="text-xs text-red-600">پایین</p>
                  <p className="font-bold text-red-800">{alarmRanges.mvent.low}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <p className="text-xs text-green-600">فعلی</p>
                  <p className="font-bold text-green-800">{alarmRanges.mvent.current}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <p className="text-xs text-yellow-600">بالا</p>
                  <p className="font-bold text-yellow-800">{alarmRanges.mvent.high}</p>
                </div>
              </div>
              <p className="text-xs text-teal-600 mt-2 text-center">
                واحد: {alarmRanges.mvent.unit}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                PEEP
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-red-100 rounded-lg p-2">
                  <p className="text-xs text-red-600">پایین</p>
                  <p className="font-bold text-red-800">{alarmRanges.peep.low}</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                  <p className="text-xs text-green-600">فعلی</p>
                  <p className="font-bold text-green-800">{alarmRanges.peep.current}</p>
                </div>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <p className="text-xs text-yellow-600">بالا</p>
                  <p className="font-bold text-yellow-800">{alarmRanges.peep.high}</p>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2 text-center">
                واحد: {alarmRanges.peep.unit}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmModal;