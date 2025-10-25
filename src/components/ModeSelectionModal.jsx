import React from "react";

const ModeSelectionModal = ({
  show,
  onClose,
  modes,
  selectedMode,
  onModeChange,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* هدر مودال */}
        <div className="bg-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">انتخاب مد ونتیلاتور</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-teal-100 mt-2">
            مد مناسب را بر اساس شرایط بیمار انتخاب کنید
          </p>
        </div>

        {/* محتوای مودال */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(modes).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => onModeChange(key)}
                className={`text-right p-4 rounded-xl border-2 transition-all ${
                  selectedMode === key
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <div className="font-bold text-lg">{mode.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {mode.description}
                    </div>
                  </div>
                </div>

                {/* اطلاعات تکمیلی هر مد */}
                <div className="mt-3 text-xs text-gray-500 text-right">
                  {key === "SIMV" && "مناسب برای weaning از ونتیلاتور"}
                  {key === "CPAP" && "مناسب برای بیماران با تنفس خودبخودی"}
                  {key === "PRVC" && "ترکیب مزایای VCV و PCV"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* فوتر مودال */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              مد فعلی:{" "}
              <span className="font-bold text-teal-600">
                {modes[selectedMode]?.name}
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;