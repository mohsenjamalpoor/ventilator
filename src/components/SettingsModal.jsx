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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* هدر مودال */}
        <div className="bg-teal-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              ویرایش تنظیمات - {currentMode.name}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-teal-200 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-teal-100 mt-2">
            پارامترهای مد {currentMode.name} را تنظیم کنید
          </p>
        </div>

        {/* محتوای مودال */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentMode.parameters.map((param) => (
              <div key={param.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.label}
                  {param.unit && (
                    <span className="text-gray-500"> ({param.unit})</span>
                  )}
                </label>

                {param.type === "select" ? (
                  <select
                    value={tempSettings[param.key]}
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
                      value={tempSettings[param.key]}
                      onChange={(e) => onSettingChange(param.key, e.target.value)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                    />
                    <input
                      type="range"
                      value={tempSettings[param.key]}
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