import React from "react";

// کامپوننت نمایش محدوده نرمال برای کودکان
const NormalRangeIndicator = ({ value, normalMin, normalMax, unit }) => {
  const numValue = parseFloat(value);
  if (!value) return null;

  let status = "";
  let color = "";

  if (numValue < normalMin) {
    status = "پایین";
    color = "text-red-600";
  } else if (numValue > normalMax) {
    status = "بالا";
    color = "text-yellow-600";
  } else {
    status = "نرمال";
    color = "text-green-600";
  }

  return (
    <div className={`text-xs mt-1 ${color}`}>
      {status} (نرمال کودکان: {normalMin}-{normalMax} {unit})
    </div>
  );
};

const ABGInterpretation = ({
  abgValues,
  abgErrors,
  showValidation,
  abgInterpretation,
  initialSettings,
  currentSettings,
  onAbgChange,
  onInterpretABG
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        تفسیر ABG و تنظیمات پیشنهادی - کودکان
      </h2>

      {/* فرم ورود ABG */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pH
          </label>
          <input
            type="number"
            step="0.01"
            value={abgValues.pH}
            onChange={(e) => onAbgChange("pH", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pH
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="7.40"
          />
          {abgErrors.pH && (
            <p className="text-red-500 text-xs mt-1">
              {abgErrors.pH}
            </p>
          )}
          {showValidation && (
            <NormalRangeIndicator
              value={abgValues.pH}
              normalMin={7.35}
              normalMax={7.45}
              unit=""
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pCO₂ (mmHg)
          </label>
          <input
            type="number"
            step="0.1"
            value={abgValues.pCO2}
            onChange={(e) => onAbgChange("pCO2", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pCO2
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="40"
          />
          {abgErrors.pCO2 && (
            <p className="text-red-500 text-xs mt-1">
              {abgErrors.pCO2}
            </p>
          )}
          {showValidation && (
            <NormalRangeIndicator
              value={abgValues.pCO2}
              normalMin={35}
              normalMax={45}
              unit="mmHg"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pO₂ (mmHg)
          </label>
          <input
            type="number"
            step="0.1"
            value={abgValues.pO2}
            onChange={(e) => onAbgChange("pO2", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pO2
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="80"
          />
          {abgErrors.pO2 && (
            <p className="text-red-500 text-xs mt-1">
              {abgErrors.pO2}
            </p>
          )}
          {showValidation && (
            <NormalRangeIndicator
              value={abgValues.pO2}
              normalMin={80}
              normalMax={100}
              unit="mmHg"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HCO₃ (mEq/L)
          </label>
          <input
            type="number"
            step="0.1"
            value={abgValues.HCO3}
            onChange={(e) => onAbgChange("HCO3", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.HCO3
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="24"
          />
          {abgErrors.HCO3 && (
            <p className="text-red-500 text-xs mt-1">
              {abgErrors.HCO3}
            </p>
          )}
          {showValidation && (
            <NormalRangeIndicator
              value={abgValues.HCO3}
              normalMin={22}
              normalMax={26}
              unit="mEq/L"
            />
          )}
        </div>
      </div>

      <button
        onClick={onInterpretABG}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors mb-6"
      >
        تفسیر ABG و اعمال تنظیمات
      </button>

      {/* نتایج تفسیر */}
      {abgInterpretation && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">
              تفسیر ABG:
            </h3>
            <p className="text-blue-700 font-semibold text-lg">
              {abgInterpretation}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">
              📝 تغییرات اعمال شده:
            </h3>
            <div className="text-green-700">
              {initialSettings.respiratoryRate !==
                currentSettings.respiratoryRate && (
                <p>
                  • میزان تنفس: {initialSettings.respiratoryRate} →{" "}
                  <strong>{currentSettings.respiratoryRate}</strong>{" "}
                  /min
                </p>
              )}
              {initialSettings.tidalVolume !==
                currentSettings.tidalVolume && (
                <p>
                  • حجم جاری: {initialSettings.tidalVolume} →{" "}
                  <strong>{currentSettings.tidalVolume}</strong> ml
                </p>
              )}
              {initialSettings.fio2 !== currentSettings.fio2 && (
                <p>
                  • FiO₂: {initialSettings.fio2}% →{" "}
                  <strong>{currentSettings.fio2}%</strong>
                </p>
              )}
              {initialSettings.peep !== currentSettings.peep && (
                <p>
                  • PEEP: {initialSettings.peep} →{" "}
                  <strong>{currentSettings.peep}</strong> cmH₂O
                </p>
              )}
              {initialSettings.mvent !== currentSettings.mvent && (
                <p>
                  • تهویه دقیقه‌ای: {initialSettings.mvent} →{" "}
                  <strong>{currentSettings.mvent}</strong> L/min
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABGInterpretation;