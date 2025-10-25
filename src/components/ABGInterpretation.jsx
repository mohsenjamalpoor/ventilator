import React, { useState } from "react";

const ABGInterpretation = ({
  currentSettings,
  initialSettings,
  weight,
  selectedMode,
  onInterpretation,
}) => {
  const [abgValues, setAbgValues] = useState({
    pH: "",
    pCO2: "",
    pO2: "",
    HCO3: "",
  });
  const [abgInterpretation, setAbgInterpretation] = useState("");
  const [abgErrors, setAbgErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // محاسبه تهویه دقیقه‌ای
  const calculateMvent = (tv, rr) => {
    return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
  };

  // اعتبارسنجی مقادیر ABG برای کودکان
  const validateABG = () => {
    const { pH, pCO2, pO2, HCO3 } = abgValues;
    const errors = {};
    let isValid = true;

    if (!pH) {
      errors.pH = "مقدار pH الزامی است";
      isValid = false;
    } else {
      const pHNum = parseFloat(pH);
      if (pHNum < 6.8 || pHNum > 7.8) {
        errors.pH = "مقدار pH باید بین 6.8 تا 7.8 باشد";
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
      if (pCO2Num < 20 || pCO2Num > 100) {
        errors.pCO2 = "مقدار pCO2 باید بین 20 تا 100 mmHg باشد";
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
      if (pO2Num < 30 || pO2Num > 300) {
        errors.pO2 = "مقدار pO2 باید بین 30 تا 300 mmHg باشد";
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
      if (HCO3Num < 10 || HCO3Num > 40) {
        errors.HCO3 = "مقدار HCO3 باید بین 10 تا 40 mEq/L باشد";
        isValid = false;
      } else if (HCO3Num < 22 || HCO3Num > 26) {
        errors.HCO3 = "مقدار HCO3 خارج از محدوده نرمال است";
      }
    }

    setAbgErrors(errors);
    setShowValidation(true);
    return isValid;
  };

  // تفسیر پیشرفته ABG برای کودکان
  const interpretABG = () => {
    if (!validateABG()) {
      return;
    }

    const { pH, pCO2, pO2, HCO3 } = abgValues;
    const pHNum = parseFloat(pH);
    const pCO2Num = parseFloat(pCO2);
    const pO2Num = parseFloat(pO2);
    const HCO3Num = parseFloat(HCO3);

    let interpretation = "";
    let detailedInterpretation = "";
    let compensation = "";
    let newSettings = { ...currentSettings };

    // تشخیص نوع اختلال اسید-باز
    if (pHNum < 7.35) {
      if (pCO2Num > 45) {
        interpretation = "اسیدوز تنفسی";
        const expectedHCO3 = 24 + ((pCO2Num - 40) / 10) * 2.5;
        if (HCO3Num > expectedHCO3 + 2) {
          compensation = "جبران نشده";
        } else if (HCO3Num >= expectedHCO3 - 2 && HCO3Num <= expectedHCO3 + 2) {
          compensation = "جبران حاد";
        } else {
          compensation = "جبران مزمن";
        }

        newSettings.respiratoryRate = Math.min(
          20,
          currentSettings.respiratoryRate + 2
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = (weight * 10).toFixed(1);
        }
      } else if (HCO3Num < 22) {
        interpretation = "اسیدوز متابولیک";
        const expectedPCO2 = 1.5 * HCO3Num + 8;
        if (pCO2Num > expectedPCO2 + 2) {
          compensation = "اسیدوز تنفسی همراه";
        } else if (pCO2Num < expectedPCO2 - 2) {
          compensation = "آلکالوز تنفسی همراه";
        } else {
          compensation = "جبران مناسب";
        }
      }
    } else if (pHNum > 7.45) {
      if (pCO2Num < 35) {
        interpretation = "آلکالوز تنفسی";
        const expectedHCO3 = 24 - ((40 - pCO2Num) / 10) * 5;
        if (HCO3Num < expectedHCO3 - 2) {
          compensation = "جبران نشده";
        } else if (HCO3Num >= expectedHCO3 - 2 && HCO3Num <= expectedHCO3 + 2) {
          compensation = "جبران حاد";
        } else {
          compensation = "جبران مزمن";
        }

        newSettings.respiratoryRate = Math.max(
          8,
          currentSettings.respiratoryRate - 2
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = (weight * 6).toFixed(1);
        }
      } else if (HCO3Num > 26) {
        interpretation = "آلکالوز متابولیک";
        const expectedPCO2 = 0.7 * HCO3Num + 20;
        if (pCO2Num > expectedPCO2 + 2) {
          compensation = "اسیدوز تنفسی همراه";
        } else if (pCO2Num < expectedPCO2 - 2) {
          compensation = "آلکالوز تنفسی همراه";
        } else {
          compensation = "جبران مناسب";
        }
      }
    } else {
      interpretation = "ABG نرمال";
      compensation = "تعادل اسید-باز نرمال";
    }

    if (pHNum >= 7.35 && pHNum <= 7.45) {
      if (pCO2Num > 45 && HCO3Num > 26) {
        interpretation =
          "اختلال مختلط - آلکالوز متابولیک جبران شده با اسیدوز تنفسی";
      } else if (pCO2Num < 35 && HCO3Num < 22) {
        interpretation =
          "اختلال مختلط - اسیدوز متابولیک جبران شده با آلکالوز تنفسی";
      }
    }

    let oxygenationStatus = "";
    if (pO2Num < 60) {
      oxygenationStatus = "هیپوکسمی شدید";
      newSettings.fio2 = Math.min(80, currentSettings.fio2 + 30);
      newSettings.peep = Math.min(10, currentSettings.peep + 3);
    } else if (pO2Num < 80) {
      oxygenationStatus = "هیپوکسمی";
      newSettings.fio2 = Math.min(60, currentSettings.fio2 + 20);
      newSettings.peep = Math.min(8, currentSettings.peep + 2);
    } else {
      oxygenationStatus = "اکسیژناسیون نرمال";
    }

    let anionGapInfo = "";
    if (interpretation.includes("اسیدوز متابولیک")) {
      const anionGap = 140 - 104 - HCO3Num;
      if (anionGap > 12) {
        anionGapInfo = ` (Anion Gap بالا: ${anionGap} - احتمال اسیدوز متابولیک ناشی از اسیدهای ثابت)`;
      } else {
        anionGapInfo = ` (Anion Gap نرمال: ${anionGap} - احتمال اسیدوز متابولیک ناشی از دفع HCO3)`;
      }
    }

    detailedInterpretation = `${interpretation}${anionGapInfo}`;
    if (compensation) {
      detailedInterpretation += ` - ${compensation}`;
    }
    if (oxygenationStatus && oxygenationStatus !== "اکسیژناسیون نرمال") {
      detailedInterpretation += ` - ${oxygenationStatus}`;
    }

    newSettings.mvent = calculateMvent(
      newSettings.tidalVolume,
      newSettings.respiratoryRate
    );
    newSettings.vti = newSettings.tidalVolume;

    setAbgInterpretation(detailedInterpretation);
    onInterpretation(newSettings, detailedInterpretation);
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

  // کامپوننت نمایش محدوده نرمال
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
        {status} (نرمال: {normalMin}-{normalMax} {unit})
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        تفسیر ABG و تنظیمات پیشنهادی
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
            onChange={(e) => handleAbgChange("pH", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pH ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="7.40"
          />
          {abgErrors.pH && (
            <p className="text-red-500 text-xs mt-1">{abgErrors.pH}</p>
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
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pCO2 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="40"
          />
          {abgErrors.pCO2 && (
            <p className="text-red-500 text-xs mt-1">{abgErrors.pCO2}</p>
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
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.pO2 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="80"
          />
          {abgErrors.pO2 && (
            <p className="text-red-500 text-xs mt-1">{abgErrors.pO2}</p>
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
            className={`w-full px-3 py-2 border rounded-lg text-left ${
              abgErrors.HCO3 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="24"
          />
          {abgErrors.HCO3 && (
            <p className="text-red-500 text-xs mt-1">{abgErrors.HCO3}</p>
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
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition-colors mb-6"
      >
        تفسیر ABG و اعمال تنظیمات
      </button>

      {/* نتایج تفسیر */}
      {abgInterpretation && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">تفسیر ABG:</h3>
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
                  <strong>{currentSettings.respiratoryRate}</strong> /min
                </p>
              )}
              {initialSettings.tidalVolume !== currentSettings.tidalVolume && (
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