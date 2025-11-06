
import React, { useState, useEffect } from "react";
import { MdCheckCircleOutline } from "react-icons/md";

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
  weight,
  selectedMode,
  currentSettings,
  settingsBeforeABG,
  onSettingsUpdate,
  onSettingsBeforeUpdate,
  resetTrigger
}) => {
  // state های مربوط به ABG
  const [abgValues, setAbgValues] = useState({
    pH: "",
    pCO2: "",
    pO2: "",
    HCO3: "",
  });
  const [abgInterpretation, setAbgInterpretation] = useState("");
  const [abgErrors, setAbgErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState([]);

  // اثر برای بازنشانی state های داخلی وقتی تنظیمات اصلی بازنشانی می‌شوند
  useEffect(() => {
    if (resetTrigger > 0) {
      resetABG();
    }
  }, [resetTrigger]);

  // محاسبه تهویه دقیقه‌ای
  const calculateMvent = (tv, rr) => {
    return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
  };

  // اعتبارسنجی مقادیر ABG  
  const validateABG = () => {
    const { pH, pCO2, pO2, HCO3 } = abgValues;
    const errors = {};
    let isValid = true;

    if (!pH) {
      errors.pH = "مقدار pH الزامی است";
      isValid = false;
    } else {
      const pHNum = parseFloat(pH);
      if (pHNum < 6.9 || pHNum > 7.6) {
        errors.pH = "مقدار pH باید بین 6.9 تا 7.6 باشد";
        isValid = false;
      } else if (pHNum < 7.35 || pHNum > 7.45) {
        errors.pH = "مقدار pH خارج از محدوده نرمال است";
      }
    }

    if (!pCO2) {
      errors.pCO2 = "مقدار pCO2 الزامی است";
      isValid = false;
    } else {
      const pCO2Num = parseFloat(pCO2);
      if (pCO2Num < 25 || pCO2Num > 120) {
        errors.pCO2 = "مقدار pCO2 باید بین 25 تا 120 mmHg باشد";
        isValid = false;
      } else if (pCO2Num < 35 || pCO2Num > 45) {
        errors.pCO2 = "مقدار pCO2 خارج از محدوده نرمال است";
      }
    }

    if (!pO2) {
      errors.pO2 = "مقدار pO2 الزامی است";
      isValid = false;
    } else {
      const pO2Num = parseFloat(pO2);
      if (pO2Num < 40 || pO2Num > 100) {
        errors.pO2 = "مقدار pO2 باید بین 40 تا 100 mmHg باشد";
        isValid = false;
      } else if (pO2Num < 80) {
        errors.pO2 = "مقدار pO2 پایین است (هیپوکسمی)";
      }
    }

    if (!HCO3) {
      errors.HCO3 = "مقدار HCO3 الزامی است";
      isValid = false;
    } else {
      const HCO3Num = parseFloat(HCO3);
      if (HCO3Num < 2 || HCO3Num > 32) {
        errors.HCO3 = "مقدار HCO3 باید بین 2 تا 32 mEq/L باشد";
        isValid = false;
      } else if (HCO3Num < 22 || HCO3Num > 26) {
        errors.HCO3 = "مقدار HCO3 خارج از محدوده نرمال است";
      }
    }

    setAbgErrors(errors);
    setShowValidation(true);
    return isValid;
  };

  // تفسیر ABG  
  const interpretABG = () => {
    if (!validateABG()) {
      return;
    }

    // ذخیره تنظیمات فعلی قبل از اعمال تغییرات
    if (onSettingsBeforeUpdate) {
      onSettingsBeforeUpdate(currentSettings);
    }

    const { pH, pCO2, pO2, HCO3 } = abgValues;
    const pHNum = parseFloat(pH);
    const pCO2Num = parseFloat(pCO2);
    const pO2Num = parseFloat(pO2);
    const HCO3Num = parseFloat(HCO3);

    let interpretation = "";
    
    // استفاده از تنظیمات فعلی برای محاسبه تغییرات
    let newSettings = { ...currentSettings };

    // تفسیر  
    if (pHNum < 7.35) {
      if (pCO2Num > 45) {
        interpretation = "اسیدوز تنفسی";
        newSettings.respiratoryRate = Math.min(
          35,
          parseInt(currentSettings.respiratoryRate) + 3
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = Math.min(
            weight * 10,
            parseFloat(currentSettings.tidalVolume) + 2
          ).toFixed(1);
        }
      } else if (HCO3Num < 22) {
        interpretation = "اسیدوز متابولیک";
        newSettings.tidalVolume = Math.min(
          weight * 10,
          parseFloat(currentSettings.tidalVolume) + 3
        ).toFixed(1);
      }
    } else if (pHNum > 7.45) {
      if (pCO2Num < 35) {
        interpretation = "آلکالوز تنفسی";
        newSettings.respiratoryRate = Math.max(
          12,
          parseInt(currentSettings.respiratoryRate) - 3
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = Math.max(
            weight * 5,
            parseFloat(currentSettings.tidalVolume) - 2
          ).toFixed(1);
        }
      } else if (HCO3Num > 26) {
        interpretation = "آلکالوز متابولیک";
        newSettings.tidalVolume = Math.max(
          weight * 5,
          parseFloat(currentSettings.tidalVolume) - 2
        ).toFixed(1);
      }
    } else {
      interpretation = "ABG نرمال";
    }

    // تنظیمات بر اساس اکسیژناسیون
    if (pO2Num < 60) {
      newSettings.fio2 = Math.min(80, parseInt(currentSettings.fio2) + 25);
      newSettings.peep = Math.min(12, parseInt(currentSettings.peep) + 3);
      interpretation += " - هیپوکسمی شدید";
    } else if (pO2Num < 80) {
      newSettings.fio2 = Math.min(60, parseInt(currentSettings.fio2) + 15);
      newSettings.peep = Math.min(10, parseInt(currentSettings.peep) + 2);
      interpretation += " - هیپوکسمی";
    } else if (pO2Num > 90 || pO2Num < 100) {
      newSettings.fio2 = Math.max(25, parseInt(currentSettings.fio2) - 10);
      interpretation += " - اکسیژناسیون خوب";
    }

    // محاسبه مقادیر وابسته
    newSettings.mvent = calculateMvent(
      newSettings.tidalVolume,
      newSettings.respiratoryRate
    );
    newSettings.vti = newSettings.tidalVolume;

    setAbgInterpretation(interpretation);
    
    // محاسبه تغییرات اعمال شده
    calculateAppliedChanges(currentSettings, newSettings);
    
    // ارسال تنظیمات جدید به کامپوننت والد
    if (onSettingsUpdate) {
      onSettingsUpdate(newSettings);
    }
  };

  // محاسبه تغییرات اعمال شده
  const calculateAppliedChanges = (beforeSettings, afterSettings) => {
    const changes = [];
    
    if (beforeSettings && afterSettings) {
      if (parseInt(beforeSettings.respiratoryRate) !== parseInt(afterSettings.respiratoryRate)) {
        changes.push({
          label: "RR",
          from: beforeSettings.respiratoryRate,
          to: afterSettings.respiratoryRate,
          unit: "/min"
        });
      }
      
      if (parseFloat(beforeSettings.tidalVolume) !== parseFloat(afterSettings.tidalVolume)) {
        changes.push({
          label: "TV",
          from: beforeSettings.tidalVolume,
          to: afterSettings.tidalVolume,
          unit: "ml"
        });
      }
      
      if (parseInt(beforeSettings.fio2) !== parseInt(afterSettings.fio2)) {
        changes.push({
          label: "FiO₂",
          from: beforeSettings.fio2,
          to: afterSettings.fio2,
          unit: "%"
        });
      }
      
      if (parseInt(beforeSettings.peep) !== parseInt(afterSettings.peep)) {
        changes.push({
          label: "PEEP",
          from: beforeSettings.peep,
          to: afterSettings.peep,
          unit: "cmH₂O"
        });
      }
      
      if (parseFloat(beforeSettings.mvent) !== parseFloat(afterSettings.mvent)) {
        changes.push({
          label: "MVent",
          from: beforeSettings.mvent,
          to: afterSettings.mvent,
          unit: "L/min"
        });
      }
    }
    
    setAppliedChanges(changes);
  };

  const handleAbgChange = (field, value) => {
    setAbgValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (abgErrors[field]) {
      setAbgErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const resetABG = () => {
    setAbgValues({
      pH: "",
      pCO2: "",
      pO2: "",
      HCO3: "",
    });
    setAbgInterpretation("");
    setAbgErrors({});
    setShowValidation(false);
    setAppliedChanges([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          تفسیر ABG و تنظیمات پیشنهادی - کودکان
        </h2>
        <button
          onClick={resetABG}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          پاک کردن
        </button>
      </div>

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
            onChange={(e) => handleAbgChange("pH", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pH
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="7.40"
            dir="ltr" 
          />
          {abgErrors.pH && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            onChange={(e) => handleAbgChange("pCO2", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pCO2
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="40"
            dir="ltr"   
          />
          {abgErrors.pCO2 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            onChange={(e) => handleAbgChange("pO2", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pO2
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="80"
            dir="ltr"
          />
          {abgErrors.pO2 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            onChange={(e) => handleAbgChange("HCO3", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.HCO3
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="24"
            dir="ltr" 
          />
          {abgErrors.HCO3 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
        onClick={interpretABG}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors mb-6 flex items-center justify-center gap-2"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        تفسیر ABG و اعمال تنظیمات
      </button>

      {/* نتایج تفسیر */}
      {abgInterpretation && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              تفسیر ABG:
            </h3>
            <p className="text-blue-700 font-semibold text-lg text-center">
              {abgInterpretation}
            </p>
          </div>

          {appliedChanges.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
            <MdCheckCircleOutline size={20}/>
                📝 تغییرات اعمال شده:
              </h3>
              <div className="space-y-2">
                {appliedChanges.map((change, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                    <span className="text-green-700 font-medium text-right flex-1">
                      {change.label}:
                    </span>
                    <span className="text-green-900 font-bold direction-ltr text-left flex-1" dir="ltr">
                      {change.from} {change.unit} → {change.to} {change.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* راهنمای تفسیر */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
              راهنمای تفسیر:
            </h3>
            <div className="text-purple-700 text-sm space-y-1 text-right">
              <p>• <strong>اسیدوز تنفسی</strong>: افزایش RR و TV</p>
              <p>• <strong>آلکالوز تنفسی</strong>: کاهش RR و TV</p>
              <p>• <strong>هیپوکسمی</strong>: افزایش FiO₂ و PEEP</p>
              <p>• <strong>هیپوکسمی شدید</strong>: افزایش قابل توجه FiO₂ و PEEP</p>
            </div>
          </div>
        </div>
      )}

   
    </div>
  );
};

export default ABGInterpretation;