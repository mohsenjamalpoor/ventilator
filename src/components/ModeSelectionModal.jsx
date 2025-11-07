import React from "react";

const ModeSelectionModal = ({
  show,
  onClose,
  modes,
  selectedMode,
  onModeChange,
  isInfant = false
}) => {
  if (!show) return null;

  // توضیحات مختصر برای هر مد
  const modeDescriptions = {
    SIMV: "مناسب برای weaning از ونتیلاتور",
    CPAP: "مناسب برای بیماران با تنفس خودبخودی",
    PRVC: "ترکیب مزایای VCV و PCV",
    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* هدر مودال */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">انتخاب مد ونتیلاتور</h2>
              <p className="text-teal-100 mt-2">
                مد مناسب را بر اساس شرایط بیمار انتخاب کنید
                {isInfant && " (حالت نوزادان)"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* محتوای مودال */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(modes).map(([key, mode]) => (
              <div
                key={key}
                className={`text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMode === key
                    ? "border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-800 shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm"
                }`}
                onClick={() => onModeChange(key)}
              >
                {/* نشانگر مد فعال */}
                {selectedMode === key && (
                  <div className="flex justify-start mb-2">
                    <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                      فعال
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <div className="font-bold text-lg mb-1">{mode.name}</div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {mode.description}
                    </div>
                  </div>
                  
                
                </div>

                {/* اطلاعات تکمیلی هر مد */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {modeDescriptions[key] || mode.description}
                  </div>
                  
                  {/* نکات مهم برای مدهای خاص */}
                  {key === "CPAP" && (
                    <div className="text-xs text-red-500 font-semibold mt-1">
                      • Back up فعال باشد
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* فوتر مودال */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              مد فعلی:{" "}
              <span className="font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded">
                {modes[selectedMode]?.name}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;