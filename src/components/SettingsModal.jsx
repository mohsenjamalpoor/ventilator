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
  isInfant = false
}) => {
  if (!show) return null;

  const currentMode = modes[selectedMode];

  // استفاده از پارامترهای داینامیک از فایل ventilatorModes
  const parameters = currentMode?.parameters ? 
    (typeof currentMode.parameters === 'function' 
      ? currentMode.parameters(weight, isInfant)
      : currentMode.parameters) 
    : [];

  const getValue = (param) => {
    return tempSettings[param.key] !== undefined
      ? tempSettings[param.key]
      : param.default !== undefined 
        ? param.default 
        : param.min;
  };

  // تابع برای مدیریت تغییر نسبت I:E
  const handleIERatioChange = (iValue, eValue) => {
    onSettingChange("ieRatio", `${iValue}:${eValue}`);
  };

  // تابع برای استخراج مقادیر I و E از رشته ذخیره شده
  const getIERatioValues = () => {
    const ieValue = getValue({ key: "ieRatio" });
    if (ieValue && typeof ieValue === "string" && ieValue.includes(":")) {
      const [i, e] = ieValue.split(":").map(Number);
      return { i: i || 1, e: e || 2 }; // مقادیر پیش فرض 1:2
    }
    return { i: 1, e: 2 };
  };

  const { i: currentI, e: currentE } = getIERatioValues();

  // نمایش محدوده پیشنهادی برای پارامترها
  const getRangeInfo = (param) => {
    if (param.infantRange && param.pediatricRange) {
      return isInfant ? param.infantRange : param.pediatricRange;
    }
    if (param.min !== undefined && param.max !== undefined) {
      return `${param.min} - ${param.max} ${param.unit || ''}`;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* هدر مودال */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                ویرایش تنظیمات - {currentMode?.name}
              </h2>
              <p className="text-teal-100 mt-1">
                {isInfant ? " نوزادان" : " کودکان"} - وزن: {weight} kg
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
          {parameters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              هیچ پارامتری برای این مد تعریف نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {parameters.map((param) => (
                <div key={param.key} className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {param.label}
                      {param.unit && (
                        <span className="text-gray-500"> ({param.unit})</span>
                      )}
                    </label>
                    {getRangeInfo(param) && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {getRangeInfo(param)}
                      </span>
                    )}
                  </div>

                  {param.type === "select" ? (
                    <select
                      value={getValue(param)}
                      onChange={(e) => onSettingChange(param.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {param.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : param.type === "ieratio" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Inspiratory (I)
                          </label>
                          <input
                            type="number"
                            value={currentI}
                            onChange={(e) =>
                              handleIERatioChange(
                                parseFloat(e.target.value) || 1,
                                currentE
                              )
                            }
                            min={0.1}
                            max={4}
                            step={0.1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <input
                            type="range"
                            value={currentI}
                            onChange={(e) =>
                              handleIERatioChange(
                                parseFloat(e.target.value),
                                currentE
                              )
                            }
                            min={0.1}
                            max={4}
                            step={0.1}
                            className="w-full mt-2"
                          />
                        </div>
                        <div className="text-lg font-bold text-gray-600 mt-5">
                          :
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">
                            Expiratory (E)
                          </label>
                          <input
                            type="number"
                            value={currentE}
                            onChange={(e) =>
                              handleIERatioChange(
                                currentI,
                                parseFloat(e.target.value) || 1
                              )
                            }
                            min={0.1}
                            max={4}
                            step={0.1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <input
                            type="range"
                            value={currentE}
                            onChange={(e) =>
                              handleIERatioChange(
                                currentI,
                                parseFloat(e.target.value)
                              )
                            }
                            min={0.1}
                            max={4}
                            step={0.1}
                            className="w-full mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          نسبت فعلی: {currentI}:{currentE}
                        </span>
                        <span>گام: 0.1</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="number"
                        value={getValue(param)}
                        onChange={(e) => {
                          const value = e.target.value === '' ? param.min : parseFloat(e.target.value);
                          onSettingChange(param.key, value);
                        }}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-left"
                      />
                      <input
                        type="range"
                        value={getValue(param)}
                        onChange={(e) =>
                          onSettingChange(param.key, parseFloat(e.target.value))
                        }
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>حداقل: {param.min}</span>
                        <span className="font-medium text-teal-600">
                          فعلی: {getValue(param)}
                        </span>
                        <span>حداکثر: {param.max}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* فوتر مودال */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              لغو
            </button>
            <div className="flex gap-3">
              <button
                onClick={onReset}
                className="px-6 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                بازنشانی
              </button>
              <button
                onClick={onSave}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-colors font-medium shadow-md"
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