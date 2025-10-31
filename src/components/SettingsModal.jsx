import React from "react";

const SettingsModal = ({
  show,
  onClose,
  onSave,
  onReset,
  tempSettings,
  onSettingChange,
  selectedMode,
  modes,
  weight,
}) => {
  if (!show) return null;

  const currentMode = modes[selectedMode];

  // پارامترهای کاملاً جدا برای هر مد
  const modeParameters = {
    SIMV: [
      { key: "tidalVolume", label: "حجم جاری", unit: "ml", min: 10, max: 350, step: 10 },
      { key: "respiratoryRate", label: "میزان تنفس", unit: "/min", min: 1, max: 60, step: 1 },
      { key: "peep", label: "PEEP", unit: "cmH₂O", min: 0, max: 50, step: 1 },
      { key: "ti", label: "Ti", unit: "sec", min: 0.5, max: 3.0, step: 0.1 },
      { key: "ieRatio", label: "نسبت I:E", type: "select", options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3", "1:3.5", "1:4"] },
      { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
      { key: "trigger", label: "Trigger", unit: "cmH₂O", min: -20, max: 10, step: 1 },
      { key: "pressureSupport", label: "حمایت فشاری", unit: "cmH₂O", min: 0, max: 80, step: 1 },
     
    ],
    PRVC: [
      { key: "tidalVolume", label: "حجم جاری", unit: "ml", min: 200, max: 1000, step: 10 },
      { key: "respiratoryRate", label: "میزان تنفس", unit: "/min", min: 1, max: 60, step: 1 },
      { key: "peep", label: "PEEP", unit: "cmH₂O", min: 0, max: 20, step: 1 },
      { key: "ti", label: "Ti", unit: "sec", min: 0.5, max: 3.0, step: 0.1 },
      { key: "ieRatio", label: "نسبت I:E", type: "select", options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3", "1:3.5", "1:4"] },
      { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
     
    ],
    CPAP: [
      { key: "cpap", label: "سطح CPAP", unit: "cmH₂O", min: 3, max: 15, step: 0.5 },
      { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
      { key: "pressureSupport", label: "حمایت فشاری", unit: "cmH₂O", min: 5, max: 25, step: 1 },
    ]
  };

  const parameters = modeParameters[currentMode.name] || modeParameters.SIMV;

  const getValue = (param) => {
    return tempSettings[param.key] !== undefined ? tempSettings[param.key] : param.min;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* هدر مودال */}
        <div className="bg-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              ویرایش تنظیمات ودامنه آلارم ها - {currentMode.name}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 text-2xl"
            >
              ×
            </button>
          </div>
          
        </div>

        {/* محتوای مودال */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
         

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parameters.map((param) => (
              <div key={param.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.label}
                  {param.unit && (
                    <span className="text-gray-500"> ({param.unit})</span>
                  )}
                </label>

                {param.type === "select" ? (
                  <select
                    value={getValue(param)}
                    onChange={(e) => onSettingChange(param.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                  >
                    {param.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={getValue(param)}
                      onChange={(e) => onSettingChange(param.key, e.target.value)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                    />
                    <input
                      type="range"
                      value={getValue(param)}
                      onChange={(e) => onSettingChange(param.key, e.target.value)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>حداقل: {param.min}</span>
                      <span>حداکثر: {param.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* فوتر مودال */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              لغو
            </button>
            <div className="flex gap-2">
              <button
                onClick={onReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازنشانی
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                ذخیره تنظیمات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;