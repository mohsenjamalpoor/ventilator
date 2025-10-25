import React, { useState } from "react";
import ModeSelectionModal from "./ModeSelectionModal";
import SettingsModal from "./SettingsModal";

export default function PediatricVentilator({
  weight,
  age,
  ageUnit,
  disease,
  onBack,
}) {
  // تنظیمات اصلی اولیه
  const initialSettings = {
    tidalVolume: (weight * 6).toFixed(1),
    respiratoryRate: 35,
    fio2: 40,
    peep: 5,
    ieRatio: "1:2",
    flowRate: 60,
    mode: "SIMV",
    pressureSupport: 10,
    cpap: 8,
    pip: 18, // فشار دمی پیک
  };

  // محاسبه تهویه دقیقه‌ای
  const calculateMvent = (tv, rr) => {
    return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
  };

  // state برای تنظیمات فعال
  const [currentSettings, setCurrentSettings] = useState({
    ...initialSettings,
    mvent: calculateMvent(
      initialSettings.tidalVolume,
      initialSettings.respiratoryRate
    ),
    vti: initialSettings.tidalVolume,
    vte: (weight * 5.8).toFixed(1),
  });

  const [abgValues, setAbgValues] = useState({
    pH: "",
    pCO2: "",
    pO2: "",
    HCO3: "",
  });
  const [abgInterpretation, setAbgInterpretation] = useState("");
  const [selectedMode, setSelectedMode] = useState("SIMV");
  const [abgErrors, setAbgErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    ...initialSettings,
    mvent: calculateMvent(
      initialSettings.tidalVolume,
      initialSettings.respiratoryRate
    ),
    vti: initialSettings.tidalVolume,
    vte: (weight * 5.8).toFixed(1),
  });

  // مد مورد نظر
  const ventilatorModes = {
    SIMV: {
      name: "SIMV - تهویه متناوب اجباری هماهنگ",
      description: "ترکیب تنفس اجباری و خودبخودی",
      parameters: [
        {
          key: "tidalVolume",
          label: "حجم جاری",
          unit: "ml",
          min: weight * 4,
          max: weight * 10,
          step: 0.1,
        },
        {
          key: "respiratoryRate",
          label: "میزان تنفس",
          unit: "/min",
          min: 8,
          max: 35,
          step: 1,
        },
        { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
        {
          key: "peep",
          label: "PEEP",
          unit: "cmH₂O",
          min: 3,
          max: 15,
          step: 0.5,
        },
        {
          key: "ieRatio",
          label: "نسبت I:E",
          type: "select",
          options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3"],
        },
        {
          key: "pressureSupport",
          label: "حمایت فشاری",
          unit: "cmH₂O",
          min: 5,
          max: 25,
          step: 1,
        },
      ],
    },
    CPAP: {
      name: "CPAP - فشار مثبت مداوم راه هوایی",
      description: "فشار مثبت مداوم در تمام چرخه تنفسی",
      parameters: [
        {
          key: "cpap",
          label: "سطح CPAP",
          unit: "cmH₂O",
          min: 3,
          max: 15,
          step: 0.5,
        },
        { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
        {
          key: "pressureSupport",
          label: "حمایت فشاری",
          unit: "cmH₂O",
          min: 5,
          max: 25,
          step: 1,
        },
      ],
    },
    PRVC: {
      name: "PRVC - حجم جاری تنظیم‌شده با فشار",
      description: "ترکیب مزایای VCV و PCV",
      parameters: [
        {
          key: "tidalVolume",
          label: "حجم جاری",
          unit: "ml",
          min: weight * 4,
          max: weight * 10,
          step: 0.1,
        },
        {
          key: "respiratoryRate",
          label: "میزان تنفس",
          unit: "/min",
          min: 8,
          max: 35,
          step: 1,
        },
        { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
        {
          key: "peep",
          label: "PEEP",
          unit: "cmH₂O",
          min: 3,
          max: 15,
          step: 0.5,
        },
        {
          key: "ieRatio",
          label: "نسبت I:E",
          type: "select",
          options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3"],
        },
      ],
    },
  };

  // اعتبارسنجی مقادیر ABG برای کودکان
  const validateABG = () => {
    const { pH, pCO2, pO2, HCO3 } = abgValues;
    const errors = {};
    let isValid = true;

    // اعتبارسنجی pH
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

    // اعتبارسنجی pCO2
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

    // اعتبارسنجی pO2
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

    // اعتبارسنجی HCO3
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
      // اسیدوز
      if (pCO2Num > 45) {
        interpretation = "اسیدوز تنفسی";
        // محاسبه جبران متابولیک مورد انتظار
        const expectedHCO3 = 24 + ((pCO2Num - 40) / 10) * 2.5;
        if (HCO3Num > expectedHCO3 + 2) {
          compensation = "جبران نشده";
        } else if (HCO3Num >= expectedHCO3 - 2 && HCO3Num <= expectedHCO3 + 2) {
          compensation = "جبران حاد";
        } else {
          compensation = "جبران مزمن";
        }

        // تنظیمات برای اسیدوز تنفسی
        newSettings.respiratoryRate = Math.min(
          20,
          currentSettings.respiratoryRate + 2
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = (weight * 10).toFixed(1);
        }
      } else if (HCO3Num < 22) {
        interpretation = "اسیدوز متابولیک";
        // محاسبه جبران تنفسی مورد انتظار
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
      // آلکالوز
      if (pCO2Num < 35) {
        interpretation = "آلکالوز تنفسی";
        // محاسبه جبران متابولیک مورد انتظار
        const expectedHCO3 = 24 - ((40 - pCO2Num) / 10) * 5;
        if (HCO3Num < expectedHCO3 - 2) {
          compensation = "جبران نشده";
        } else if (HCO3Num >= expectedHCO3 - 2 && HCO3Num <= expectedHCO3 + 2) {
          compensation = "جبران حاد";
        } else {
          compensation = "جبران مزمن";
        }

        // تنظیمات برای آلکالوز تنفسی
        newSettings.respiratoryRate = Math.max(
          8,
          currentSettings.respiratoryRate - 2
        );
        if (selectedMode === "SIMV" || selectedMode === "PRVC") {
          newSettings.tidalVolume = (weight * 6).toFixed(1);
        }
      } else if (HCO3Num > 26) {
        interpretation = "آلکالوز متابولیک";
        // محاسبه جبران تنفسی مورد انتظار
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

    // تشخیص اختلالات مختلط
    if (pHNum >= 7.35 && pHNum <= 7.45) {
      if (pCO2Num > 45 && HCO3Num > 26) {
        interpretation =
          "اختلال مختلط - آلکالوز متابولیک جبران شده با اسیدوز تنفسی";
      } else if (pCO2Num < 35 && HCO3Num < 22) {
        interpretation =
          "اختلال مختلط - اسیدوز متابولیک جبران شده با آلکالوز تنفسی";
      }
    }

    // بررسی هیپوکسمی برای کودکان
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

    // محاسبه Anion Gap برای اسیدوز متابولیک
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

    // محاسبه مجدد MVent با تنظیمات جدید
    newSettings.mvent = calculateMvent(
      newSettings.tidalVolume,
      newSettings.respiratoryRate
    );
    newSettings.vti = newSettings.tidalVolume;

    setAbgInterpretation(detailedInterpretation);
    setCurrentSettings(newSettings);
  };

  const handleAbgChange = (field, value) => {
    setAbgValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    // پاک کردن خطا هنگام تایپ
    if (abgErrors[field]) {
      setAbgErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const resetSettings = () => {
    const resetSettings = {
      ...initialSettings,
      mvent: calculateMvent(
        initialSettings.tidalVolume,
        initialSettings.respiratoryRate
      ),
      vti: initialSettings.tidalVolume,
      vte: (weight * 5.8).toFixed(1),
    };
    setCurrentSettings(resetSettings);
    setAbgValues({ pH: "", pCO2: "", pO2: "", HCO3: "" });
    setAbgInterpretation("");
    setSelectedMode("SIMV");
    setAbgErrors({});
    setShowValidation(false);
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const newSettings = {
      ...currentSettings,
      mode: mode,
      mvent: calculateMvent(
        currentSettings.tidalVolume,
        currentSettings.respiratoryRate
      ),
    };
    setCurrentSettings(newSettings);
    setShowModeModal(false);
  };

  const openModeModal = () => {
    setShowModeModal(true);
  };

  const closeModeModal = () => {
    setShowModeModal(false);
  };

  const openSettingsModal = () => {
    setTempSettings(currentSettings);
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const saveSettings = () => {
    // محاسبه مجدد MVent هنگام ذخیره تنظیمات
    const updatedSettings = {
      ...tempSettings,
      mvent: calculateMvent(
        tempSettings.tidalVolume,
        tempSettings.respiratoryRate
      ),
      vti: tempSettings.tidalVolume,
    };
    setCurrentSettings(updatedSettings);
    setShowSettingsModal(false);
  };

  const handleSettingChange = (key, value) => {
    const newTempSettings = {
      ...tempSettings,
      [key]: value,
    };

    // اگر TV یا RR تغییر کرد، MVent را مجدد محاسبه کن
    if (key === "tidalVolume" || key === "respiratoryRate") {
      newTempSettings.mvent = calculateMvent(
        key === "tidalVolume" ? value : newTempSettings.tidalVolume,
        key === "respiratoryRate" ? value : newTempSettings.respiratoryRate
      );
      if (key === "tidalVolume") {
        newTempSettings.vti = value;
      }
    }

    setTempSettings(newTempSettings);
  };

  const resetTempSettings = () => {
    setTempSettings({
      ...initialSettings,
      mvent: calculateMvent(
        initialSettings.tidalVolume,
        initialSettings.respiratoryRate
      ),
      vti: initialSettings.tidalVolume,
      vte: (weight * 5.8).toFixed(1),
    });
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-800 mb-2">
                تنظیمات ونتیلاتور - کودکان
              </h1>
              {disease && <p className="text-teal-600">بیماری: {disease}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetSettings}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازنشانی تنظیمات
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازگشت
              </button>
            </div>
          </div>

          {/* اطلاعات بیمار */}
          <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <p className="text-teal-600 text-sm">وزن بیمار</p>
              <p className="text-xl font-bold text-teal-800">{weight} kg</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-600 text-sm">سن بیمار</p>
              <p className="text-xl font-bold text-blue-800">
                {age}{" "}
                {ageUnit === "days"
                  ? "روز"
                  : ageUnit === "months"
                  ? "ماه"
                  : "سال"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm">نوع بیمار</p>
              <p className="text-xl font-bold text-green-800">کودکان</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-orange-600 text-sm">بیماری</p>
              <p className="text-xl font-bold text-orange-800">{disease}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* بخش انتخاب مد */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                انتخاب مد ونتیلاتور
              </h2>

              {/* نمایش مد فعلی */}
              <div className="bg-teal-50 rounded-xl p-4 border-2 border-teal-200 mb-4">
                <div className="text-center">
                  <p className="text-teal-800 text-xl font-semibold mt-2">
                    {ventilatorModes[selectedMode]?.name}
                  </p>
                  <p className="text-teal-600 text-sm mt-1">
                    {ventilatorModes[selectedMode]?.description}
                  </p>
                </div>
              </div>

              {/* دکمه جداگانه برای باز کردن مودال */}
              <button
                onClick={openModeModal}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mb-3"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                انتخاب مد ونتیلاتور
              </button>
            </div>

            {/* اطلاعات مد انتخاب شده */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-3">
                📋 درباره مد {ventilatorModes[selectedMode]?.name}:
              </h3>
              <div className="text-gray-700 text-sm space-y-2">
                {selectedMode === "SIMV" && (
                  <>
                    <p>• ترکیب تنفس اجباری و خودبخودی</p>
                    <p>• مناسب برای weaning از ونتیلاتور</p>
                    <p>• حفظ عضلات تنفسی</p>
                  </>
                )}
                {selectedMode === "CPAP" && (
                  <>
                    <p>• فشار مثبت مداوم در راه هوایی</p>
                    <p>• مناسب برای بیماران با تنفس خودبخودی</p>
                    <p>• بهبود oxygenation</p>
                  </>
                )}
                {selectedMode === "PRVC" && (
                  <>
                    <p>• ترکیب مزایای VCV و PCV</p>
                    <p>• حجم جاری ثابت با کمترین فشار</p>
                    <p>• مناسب برای بیماران با compliance متغیر</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* مانیتور ونتیلاتور و تفسیر ABG */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {/* مانیتور ونتیلاتور */}
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    مانیتور ونتیلاتور - کودکان
                  </h2>
                  <button
                    onClick={openSettingsModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    {currentSettings.mode}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* بخش مانیتور سمت چپ */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-600 rounded-xl p-4 h-full">
                      <div className="space-y-3">
                        {/* PIP */}
                        <div className="bg-indigo-900 rounded-lg p-2 border border-indigo-600">
                          <div className="text-center">
                            <h3 className="text-indigo-300 text-xs mb-1">
                              PIP
                            </h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.pip}
                            </p>
                            <p className="text-indigo-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        {/* FiO2 */}
                        <div className="bg-purple-900 rounded-lg p-2 border border-purple-600">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">
                              FiO₂
                            </h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.fio2}%
                            </p>
                            <p className="text-purple-400 text-xs">%</p>
                          </div>
                        </div>
                        {/* PEEP */}
                        <div className="bg-red-900 rounded-lg p-2 border border-red-600">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        {/* MVent */}
                        <div className="bg-teal-900 rounded-lg p-2 border border-teal-600">
                          <div className="text-center">
                            <h3 className="text-teal-300 text-xs mb-1">
                              MVent
                            </h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.mvent}
                            </p>
                            <p className="text-teal-400 text-xs">L/min</p>
                          </div>
                        </div>

                        {/* VTi */}
                        <div className="bg-blue-900 rounded-lg p-2 border border-blue-600">
                          <div className="text-center">
                            <h3 className="text-blue-300 text-xs mb-1">VTi</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.vti}
                            </p>
                            <p className="text-blue-400 text-xs">ml</p>
                          </div>
                        </div>

                        {/* VTe */}
                        <div className="bg-green-900 rounded-lg p-2 border border-green-600">
                          <div className="text-center">
                            <h3 className="text-green-300 text-xs mb-1">VTe</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.vte}
                            </p>
                            <p className="text-green-400 text-xs">ml</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* فضای خالی برای بخش مانیتور */}
                  <div className="lg:col-span-3">
                    <div className="bg-gray-700 rounded-xl p-4 h-full">
                      <h3 className="text-white font-bold mb-3 text-center">
                        نمایشگر ونتیلاتور
                      </h3>
                      <div className="flex items-center justify-center h-32">
                        <p className="text-gray-400">
                          نمایشگر موج‌های تنفسی و فشار
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* بخش تنظیمات در پایین صفحه */}
                <div className="mt-6">
                  <div className="bg-gray-700 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-3 text-center">
                      تنظیمات ونتیلاتور
                    </h3>

                    {/* برای مد CPAP */}
                    {selectedMode === "CPAP" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Pressure Support */}
                        <div className="bg-indigo-900 rounded-lg p-3 border-2 border-indigo-500">
                          <div className="text-center">
                            <h3 className="text-indigo-300 text-xs mb-1">
                              Pressure Support
                            </h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.pressureSupport}
                            </p>
                            <p className="text-indigo-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        {/* PEEP */}
                        <div className="bg-red-900 rounded-lg p-3 border-2 border-red-500">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        {/* FiO2 */}
                        <div className="bg-purple-900 rounded-lg p-3 border-2 border-purple-500">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">
                              FiO₂
                            </h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.fio2}%
                            </p>
                            <p className="text-purple-400 text-xs">%</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* برای مدهای SIMV و PRVC */
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* TV */}
                        <div className="bg-blue-900 rounded-lg p-3 border-2 border-blue-500">
                          <div className="text-center">
                            <h3 className="text-blue-300 text-xs mb-1">TV</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.tidalVolume}
                            </p>
                            <p className="text-blue-400 text-xs">ml</p>
                          </div>
                        </div>

                        {/* RR */}
                        <div className="bg-green-900 rounded-lg p-3 border-2 border-green-500">
                          <div className="text-center">
                            <h3 className="text-green-300 text-xs mb-1">RR</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.respiratoryRate}
                            </p>
                            <p className="text-green-400 text-xs">/min</p>
                          </div>
                        </div>

                        {/* PEEP */}
                        <div className="bg-red-900 rounded-lg p-3 border-2 border-red-500">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        {/* FiO2 */}
                        <div className="bg-purple-900 rounded-lg p-3 border-2 border-purple-500">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">
                              FiO₂
                            </h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.fio2}%
                            </p>
                            <p className="text-purple-400 text-xs">%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* وضعیت کنونی */}
                {abgInterpretation && (
                  <div className="mt-4 p-3 bg-yellow-900 border border-yellow-600 rounded-lg">
                    <p className="text-yellow-200 text-center font-semibold">
                      وضعیت: {abgInterpretation}
                    </p>
                  </div>
                )}
              </div>

              {/* بخش تفسیر ABG */}
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
                      onChange={(e) => handleAbgChange("pCO2", e.target.value)}
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
                      onChange={(e) => handleAbgChange("pO2", e.target.value)}
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
                      onChange={(e) => handleAbgChange("HCO3", e.target.value)}
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
                  onClick={interpretABG}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition-colors mb-6"
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
            </div>
          </div>
        </div>
      </div>

      {/* مودال انتخاب مد */}
      <ModeSelectionModal
        show={showModeModal}
        onClose={closeModeModal}
        modes={ventilatorModes}
        selectedMode={selectedMode}
        onModeChange={handleModeChange}
      />

      {/* مودال ویرایش تنظیمات */}
      <SettingsModal
        show={showSettingsModal}
        onClose={closeSettingsModal}
        onSave={saveSettings}
        onReset={resetTempSettings}
        tempSettings={tempSettings}
        onSettingChange={handleSettingChange}
        selectedMode={selectedMode}
        modes={ventilatorModes}
        weight={weight}
      />
    </div>
  );
}