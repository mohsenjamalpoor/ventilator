// PediatricVentilator.js
import React, { useState } from "react";
import ModeSelectionModal from "./ModeSelectionModal";
import SettingsModal from "./SettingsModal";
import ABGInterpretation from "./ABGInterpretation";
import { PiBellLight } from "react-icons/pi";

// آبجکت تنظیمات اولیه
const initialSettingsConfig = {
  baseSettings: {
    tidalVolume: (weight) => (weight * 7).toFixed(1),
    respiratoryRate: 20,
    fio2: 35,
    peep: 5,
    ieRatio: "1:2",
    flowRate: 25,
    mode: "SIMV",
    pressureSupport: 12,
    cpap: 6,
    pip: 20,
    ti: 1.0,
    trigger: 5,
  },

  normalLung: {
    reduced_consciousness: {
      mode: "SIMV",
      respiratoryRate: 25,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 5,
      pressureSupport: 15,
    },
    seizure: {
      mode: "PRVC",
      respiratoryRate: 25,
      tidalVolume: (weight) => (weight * 7).toFixed(1),
      peep: 5,
      fio2: 40,
    },
  },

  obstructiveDiseases: {
    bronchiolitis: {
      mode: "PRVC",
      respiratoryRate: 25,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 7,
      ieRatio: "1:3",
      pip: 22,
      fio2: 45,
    },
    asthma: {
      mode: "PRVC",
      respiratoryRate: 22,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 6,
      ieRatio: "1:3",
      pip: 25,
      fio2: 55,
    },
    copd: {
      mode: "SIMV",
      respiratoryRate: 18,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 6,
      ieRatio: "1:3",
      pip: 22,
      fio2: 40,
    },
    foreign_body_aspiration: {
      mode: "PRVC",
      respiratoryRate: 24,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 5,
      ieRatio: "1:2",
      pip: 20,
      fio2: 50,
    },
  },

  restrictiveDiseases: {
    pneumonia: {
      mode: "PRVC",
      respiratoryRate: 28,
      tidalVolume: (weight) => (weight * 6).toFixed(1),
      peep: 8,
      ieRatio: "1:1.5",
      pip: 28,
      fio2: 65,
    },
    ards: {
      mode: "PRVC",
      respiratoryRate: 30,
      tidalVolume: (weight) => (weight * 5).toFixed(1),
      peep: 12,
      ieRatio: "1:1",
      pip: 32,
      fio2: 85,
    },
    pulmonary_edema: {
      mode: "PRVC",
      respiratoryRate: 35,
      tidalVolume: (weight) => (weight * 6).toFixed(1),
      peep: 10,
      ieRatio: "1:1.5",
      pip: 30,
      fio2: 70,
    },
    atelectasis: {
      mode: "SIMV",
      respiratoryRate: 22,
      tidalVolume: (weight) => (weight * 7).toFixed(1),
      peep: 8,
      ieRatio: "1:2",
      pip: 25,
      fio2: 55,
    },
  },
};

export default function PediatricVentilator({
  weight,
  age,
  ageUnit,
  lungInvolvement,
  normalLungCondition,
  obstructiveDisease,
  restrictiveDisease,
  onBack,
}) {
  // تابع برای محاسبه تنظیمات اولیه بر اساس نوع بیماری
  const getInitialSettings = () => {
    const base = initialSettingsConfig.baseSettings;
    
    const baseSettings = {
      ...base,
      tidalVolume: base.tidalVolume(weight),
    };

    switch (lungInvolvement) {
      case "normal":
        if (normalLungCondition && initialSettingsConfig.normalLung[normalLungCondition]) {
          const normalSettings = initialSettingsConfig.normalLung[normalLungCondition];
          return {
            ...baseSettings,
            ...normalSettings,
            tidalVolume: normalSettings.tidalVolume(weight),
          };
        }
        return baseSettings;

      case "obstructive":
        if (obstructiveDisease && initialSettingsConfig.obstructiveDiseases[obstructiveDisease]) {
          const obstructiveSettings = initialSettingsConfig.obstructiveDiseases[obstructiveDisease];
          return {
            ...baseSettings,
            ...obstructiveSettings,
            tidalVolume: obstructiveSettings.tidalVolume(weight),
          };
        }
        return baseSettings;

      case "restrictive":
        if (restrictiveDisease && initialSettingsConfig.restrictiveDiseases[restrictiveDisease]) {
          const restrictiveSettings = initialSettingsConfig.restrictiveDiseases[restrictiveDisease];
          return {
            ...baseSettings,
            ...restrictiveSettings,
            tidalVolume: restrictiveSettings.tidalVolume(weight),
          };
        }
        return baseSettings;

      default:
        return baseSettings;
    }
  };

  // محاسبه تهویه دقیقه‌ای
  const calculateMvent = (tv, rr) => {
    return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
  };

  // state برای تنظیمات فعال
  const initialSettings = getInitialSettings();
  const [currentSettings, setCurrentSettings] = useState({
    ...initialSettings,
    mvent: calculateMvent(
      initialSettings.tidalVolume,
      initialSettings.respiratoryRate
    ),
    vti: initialSettings.tidalVolume,
    vte: (weight * 6.5).toFixed(1),
  });

  const [selectedMode, setSelectedMode] = useState(initialSettings.mode);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...initialSettings });
  const [resetTrigger, setResetTrigger] = useState(0);

  // محاسبه محدوده‌های هشدار برای کودکان
  const calculateAlarmRanges = () => {
    const currentRR = parseFloat(currentSettings.respiratoryRate);
    const currentMvent = parseFloat(currentSettings.mvent);
    const currentPeep = parseFloat(currentSettings.peep);

    return {
      rr: {
        low: Math.max(8, currentRR / 2).toFixed(1),
        high: (currentRR * 2).toFixed(1),
        current: currentRR,
        unit: "/min"
      },
      mvent: {
        low: (currentMvent / 2).toFixed(2),
        high: (currentMvent * 2).toFixed(2),
        current: currentMvent,
        unit: "L/min"
      },
      peep: {
        low: Math.max(3, currentPeep - 2).toFixed(1),
        high: (currentPeep + 2).toFixed(1),
        current: currentPeep,
        unit: "cmH₂O"
      }
    };
  };

  const [alarmRanges, setAlarmRanges] = useState(calculateAlarmRanges());

  // مدهای ونتیلاتور برای کودکان
  const ventilatorModes = {
    SIMV: {
      name: "SIMV",
      description: "تهویه متناوب اجباری هماهنگ - مناسب کودکان",
      parameters: [
        {
          key: "tidalVolume",
          label: "حجم جاری",
          unit: "ml",
          min: weight * 5,
          max: weight * 10,
          step: 1,
        },
        {
          key: "respiratoryRate",
          label: "میزان تنفس",
          unit: "/min",
          min: 10,
          max: 40,
          step: 1,
        },
        { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
        {
          key: "peep",
          label: "PEEP",
          unit: "cmH₂O",
          min: 3,
          max: 15,
          step: 1,
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
          min: 8,
          max: 25,
          step: 1,
        },
        {
          key: "flowRate",
          label: "Flow Rate",
          unit: "L/min",
          min: 15,
          max: 60,
          step: 5,
        },
        {
          key: "ti",
          label: "Ti",
          unit: "sec",
          min: 0.5,
          max: 2.0,
          step: 0.1,
        },
        {
          key: "trigger",
          label: "Trigger",
          unit: "cmH₂O",
          min: -3,
          max: 3,
          step: 0.5,
        },
      ],
    },
    PRVC: {
      name: "PRVC",
      description: "حجم جاری تنظیم‌شده با فشار",
      parameters: [
        {
          key: "tidalVolume",
          label: "حجم جاری",
          unit: "ml",
          min: weight * 5,
          max: weight * 10,
          step: 0.1,
        },
        {
          key: "respiratoryRate",
          label: "میزان تنفس",
          unit: "/min",
          min: 12,
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
          key: "pip",
          label: "PIP",
          unit: "cmH₂O",
          min: 15,
          max: 40,
          step: 1,
        },
        {
          key: "ti",
          label: "Ti",
          unit: "sec",
          min: 0.5,
          max: 2.0,
          step: 0.1,
        },
      ],
    },
    CPAP: {
      name: "CPAP",
      description: "فشار مثبت مداوم راه هوایی",
      parameters: [
        {
          key: "cpap",
          label: "سطح CPAP",
          unit: "cmH₂O",
          min: 4,
          max: 12,
          step: 0.5,
        },
        { key: "fio2", label: "FiO₂", unit: "%", min: 21, max: 100, step: 1 },
        {
          key: "pressureSupport",
          label: "حمایت فشاری",
          unit: "cmH₂O",
          min: 8,
          max: 20,
          step: 1,
        },
      ],
    },
  };

  const resetSettings = () => {
    const resetSettings = {
      ...initialSettings,
      mvent: calculateMvent(
        initialSettings.tidalVolume,
        initialSettings.respiratoryRate
      ),
      vti: initialSettings.tidalVolume,
      vte: (weight * 6.5).toFixed(1),
    };
    
    setCurrentSettings(resetSettings);
    setSelectedMode(initialSettings.mode);
    setAlarmRanges(calculateAlarmRanges());
    
    // فعال کردن بازنشانی در کامپوننت ABG
    setResetTrigger(prev => prev + 1);
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
    setAlarmRanges(calculateAlarmRanges());
  };

  const openModeModal = () => {
    setShowModeModal(true);
  };

  const closeModeModal = () => {
    setShowModeModal(false);
  };

  const openSettingsModal = () => {
    setTempSettings({ ...currentSettings });
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const openAlarmModal = () => {
    setAlarmRanges(calculateAlarmRanges());
    setShowAlarmModal(true);
  };

  const closeAlarmModal = () => {
    setShowAlarmModal(false);
  };

  const saveSettings = () => {
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
    setAlarmRanges(calculateAlarmRanges());
  };

  const handleSettingChange = (key, value) => {
    const newTempSettings = {
      ...tempSettings,
      [key]: value,
    };

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

  // تابع برای دریافت نام بیماری به فارسی
  const getDiseaseName = () => {
    if (lungInvolvement === "normal") {
      return normalLungCondition === "reduced_consciousness" 
        ? "کاهش سطح هوشیاری" 
        : "تشنج";
    } else if (lungInvolvement === "obstructive") {
      const diseases = {
        bronchiolitis: "برونشیولیت",
        asthma: "آسم",
        copd: "بیماری انسدادی مزمن ریوی",
        foreign_body_aspiration: "آسپیراسیون جسم خارجی"
      };
      return diseases[obstructiveDisease] || obstructiveDisease;
    } else if (lungInvolvement === "restrictive") {
      const diseases = {
        pneumonia: "پنومونی",
        ards: "سندرم زجر تنفسی حاد (ARDS)",
        pulmonary_edema: "ادم ریوی",
        atelectasis: "آتلکتازی"
      };
      return diseases[restrictiveDisease] || restrictiveDisease;
    }
    return "بدون بیماری مشخص";
  };

  // کامپوننت مودال هشدار
  const AlarmModal = ({ show, onClose, alarmRanges }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
          <div className="bg-blue-600 text-white rounded-t-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
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
                  <div className="bg-red-100 rounded-lg p-2">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-800 mb-2">
                تنظیمات ونتیلاتور - کودکان
              </h1>
              <p className="text-blue-600">بیماری: {getDiseaseName()}</p>
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
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-600 text-sm">وزن بیمار</p>
              <p className="text-xl font-bold text-blue-800">{weight} kg</p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-4 text-center">
              <p className="text-cyan-600 text-sm">سن بیمار</p>
              <p className="text-xl font-bold text-cyan-800">
                {age}{" "}
                {ageUnit === "days"
                  ? "روز"
                  : ageUnit === "months"
                  ? "ماه"
                  : "سال"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm">گروه سنی</p>
              <p className="text-xl font-bold text-green-800">کودکان</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-orange-600 text-sm">نوع درگیری</p>
              <p className="text-xl font-bold text-orange-800">
                {lungInvolvement === "normal" ? "ریه نرمال" : 
                 lungInvolvement === "obstructive" ? "Obstructive" : "Restrictive"}
              </p>
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
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 mb-4">
                <div className="text-center">
                  <p className="text-blue-800 text-xl font-semibold mt-2">
                    {ventilatorModes[selectedMode]?.name}
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    {ventilatorModes[selectedMode]?.description}
                  </p>
                </div>
              </div>

              <button
                onClick={openModeModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 mb-3"
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
                    <p>• حفظ عملکرد عضلات تنفسی</p>
                  </>
                )}
                {selectedMode === "PRVC" && (
                  <>
                    <p>• حجم جاری ثابت با کمترین فشار</p>
                    <p>• مناسب برای بیماران با compliance متغیر</p>
                    <p>• کاهش خطر باروتروما</p>
                  </>
                )}
                {selectedMode === "CPAP" && (
                  <>
                    <p className="text-red-600 text-lg font-bold">• back up فعال باشد</p>
                    <p>• فشار مثبت مداوم در راه هوایی</p>
                    <p>• مناسب برای بیماران با تنفس خودبخودی</p>
                    <p>• بهبود oxygenation</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* مانیتور ونتیلاتور و تفسیر ABG */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {/* مانیتور ونتیلاتور */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl shadow-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-blue-800">
                    مانیتور ونتیلاتور - کودکان
                  </h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={openAlarmModal}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-100"
                    >
                      <PiBellLight className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-lg p-1 text-white" />
                    </button>
                    <button
                      onClick={openSettingsModal}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
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
                </div>

                {/* بخش مانیتور  */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border border-blue-100 shadow-inner">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* PIP */}
                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg p-3 border border-indigo-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-indigo-700 text-xs mb-1 font-semibold">PIP</h3>
                        <p className="text-xl font-bold text-indigo-900">
                          {currentSettings.pip}
                        </p>
                        <p className="text-indigo-600 text-xs">cmH₂O</p>
                      </div>
                    </div>

                     {/* RR */}
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border-2 border-green-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-green-700 text-xs mb-1 font-semibold">RR</h3>
                          <p className="text-xl font-bold text-green-900 mb-1">
                            {currentSettings.respiratoryRate}
                          </p>
                          <p className="text-green-600 text-xs">/min</p>
                        </div>
                      </div>

                    {/* FiO2 */}
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 border border-purple-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-purple-700 text-xs mb-1 font-semibold">FiO₂</h3>
                        <p className="text-xl font-bold text-purple-900">
                          {currentSettings.fio2}%
                        </p>
                        <p className="text-purple-600 text-xs">%</p>
                      </div>
                    </div>

                    {/* PEEP */}
                    <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-red-700 text-xs mb-1 font-semibold">PEEP</h3>
                        <p className="text-xl font-bold text-red-900">
                          {currentSettings.peep}
                        </p>
                        <p className="text-red-600 text-xs">cmH₂O</p>
                      </div>
                    </div>

                    {/* MVent */}
                    <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg p-3 border border-teal-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-teal-700 text-xs mb-1 font-semibold">MVent</h3>
                        <p className="text-xl font-bold text-teal-900">
                          {currentSettings.mvent}
                        </p>
                        <p className="text-teal-600 text-xs">L/min</p>
                      </div>
                    </div>

                    {/* VTi */}
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border border-blue-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-blue-700 text-xs mb-1 font-semibold">VTi</h3>
                        <p className="text-xl font-bold text-blue-900">
                          {currentSettings.vti}
                        </p>
                        <p className="text-blue-600 text-xs">ml</p>
                      </div>
                    </div>

                    {/* VTe */}
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border border-green-300 shadow-sm">
                      <div className="text-center">
                        <h3 className="text-green-700 text-xs mb-1 font-semibold">VTe</h3>
                        <p className="text-xl font-bold text-green-900">
                          {currentSettings.vte}
                        </p>
                        <p className="text-green-600 text-xs">ml</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* بخش تنظیمات در پایین صفحه */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-inner">
                  <h3 className="text-blue-800 font-bold mb-3 text-center">
                    تنظیمات ونتیلاتور کودکان
                  </h3>

                  {/* برای مد CPAP */}
                  {selectedMode === "CPAP" ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Pressure Support */}
                      <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg p-3 border-2 border-indigo-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-indigo-700 text-xs mb-1 font-semibold">
                            Pressure Support
                          </h3>
                          <p className="text-xl font-bold text-indigo-900 mb-1">
                            {currentSettings.pressureSupport}
                          </p>
                          <p className="text-indigo-600 text-xs">cmH₂O</p>
                        </div>
                      </div>

                      {/* PEEP */}
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border-2 border-red-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-red-700 text-xs mb-1 font-semibold">PEEP</h3>
                          <p className="text-xl font-bold text-red-900 mb-1">
                            {currentSettings.peep}
                          </p>
                          <p className="text-red-600 text-xs">cmH₂O</p>
                        </div>
                      </div>

                      {/* FiO2 */}
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 border-2 border-purple-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-purple-700 text-xs mb-1 font-semibold">
                            FiO₂
                          </h3>
                          <p className="text-xl font-bold text-purple-900 mb-1">
                            {currentSettings.fio2}%
                          </p>
                          <p className="text-purple-600 text-xs">%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* برای مدهای SIMV و PRVC */
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* TV */}
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border-2 border-blue-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-blue-700 text-xs mb-1 font-semibold">TV</h3>
                          <p className="text-xl font-bold text-blue-900 mb-1">
                            {currentSettings.tidalVolume}
                          </p>
                          <p className="text-blue-600 text-xs">ml</p>
                        </div>
                      </div>

                      {/* RR */}
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-3 border-2 border-green-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-green-700 text-xs mb-1 font-semibold">RR</h3>
                          <p className="text-xl font-bold text-green-900 mb-1">
                            {currentSettings.respiratoryRate}
                          </p>
                          <p className="text-green-600 text-xs">/min</p>
                        </div>
                      </div>

                      {/* PEEP */}
                      <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border-2 border-red-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-red-700 text-xs mb-1 font-semibold">PEEP</h3>
                          <p className="text-xl font-bold text-red-900 mb-1">
                            {currentSettings.peep}
                          </p>
                          <p className="text-red-600 text-xs">cmH₂O</p>
                        </div>
                      </div>

                      {/* FiO2 */}
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-3 border-2 border-purple-400 shadow-sm">
                        <div className="text-center">
                          <h3 className="text-purple-700 text-xs mb-1 font-semibold">
                            FiO₂
                          </h3>
                          <p className="text-xl font-bold text-purple-900 mb-1">
                            {currentSettings.fio2}%
                          </p>
                          <p className="text-purple-600 text-xs">%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* استفاده از کامپوننت تفسیر ABG */}
              <ABGInterpretation
                weight={weight}
                selectedMode={selectedMode}
                currentSettings={currentSettings}
                initialSettings={initialSettings}
                onSettingsUpdate={setCurrentSettings}
                resetTrigger={resetTrigger}
              />
            </div>
          </div>
        </div>
      </div>

      {/* مودال‌ها */}
      <ModeSelectionModal
        show={showModeModal}
        onClose={closeModeModal}
        modes={ventilatorModes}
        selectedMode={selectedMode}
        onModeChange={handleModeChange}
      />

      <SettingsModal
        show={showSettingsModal}
        onClose={closeSettingsModal}
        onSave={saveSettings}
        tempSettings={tempSettings}
        onSettingChange={handleSettingChange}
        selectedMode={selectedMode}
        modes={ventilatorModes}
        weight={weight}
        isInfant={false}
      />

      <AlarmModal
        show={showAlarmModal}
        onClose={closeAlarmModal}
        alarmRanges={alarmRanges}
      />
    </div>
  );
}