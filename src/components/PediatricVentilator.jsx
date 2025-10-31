import React, { useState } from "react";
import ModeSelectionModal from "./ModeSelectionModal";
import SettingsModal from "./SettingsModal";
import { PiBellLight } from "react-icons/pi";

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
    const baseSettings = {
      tidalVolume: (weight * 7).toFixed(1),
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
      trigger: -2,
    };

    // تنظیمات بر اساس نوع درگیری ریوی
    switch (lungInvolvement) {
      case "normal":
        if (normalLungCondition === "reduced_consciousness") {
          return {
            ...baseSettings,
            mode: "SIMV",
            respiratoryRate: 16,
            tidalVolume: (weight * 8).toFixed(1),
            peep: 5,
            pressureSupport: 15,
          };
        } else if (normalLungCondition === "seizure") {
          return {
            ...baseSettings,
            mode: "PRVC",
            respiratoryRate: 18,
            tidalVolume: (weight * 7.5).toFixed(1),
            peep: 5,
            fio2: 40,
          };
        }
        return baseSettings;

      case "obstructive":
        switch (obstructiveDisease) {
          case "bronchiolitis":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 25,
              tidalVolume: (weight * 6).toFixed(1),
              peep: 7,
              ieRatio: "1:3",
              pip: 22,
              fio2: 45,
            };
          case "asthma":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 22,
              tidalVolume: (weight * 6.5).toFixed(1),
              peep: 6,
              ieRatio: "1:3",
              pip: 25,
              fio2: 55,
            };
          case "copd":
            return {
              ...baseSettings,
              mode: "SIMV",
              respiratoryRate: 18,
              tidalVolume: (weight * 7).toFixed(1),
              peep: 6,
              ieRatio: "1:3",
              pip: 22,
              fio2: 40,
            };
          case "foreign_body_aspiration":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 24,
              tidalVolume: (weight * 6).toFixed(1),
              peep: 5,
              ieRatio: "1:2",
              pip: 20,
              fio2: 50,
            };
          default:
            return baseSettings;
        }

      case "restrictive":
        switch (restrictiveDisease) {
          case "pneumonia":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 28,
              tidalVolume: (weight * 6).toFixed(1),
              peep: 8,
              ieRatio: "1:1.5",
              pip: 28,
              fio2: 65,
            };
          case "ards":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 30,
              tidalVolume: (weight * 5).toFixed(1),
              peep: 12,
              ieRatio: "1:1",
              pip: 32,
              fio2: 85,
            };
          case "pulmonary_edema":
            return {
              ...baseSettings,
              mode: "PRVC",
              respiratoryRate: 26,
              tidalVolume: (weight * 6).toFixed(1),
              peep: 10,
              ieRatio: "1:1.5",
              pip: 30,
              fio2: 70,
            };
          case "atelectasis":
            return {
              ...baseSettings,
              mode: "SIMV",
              respiratoryRate: 22,
              tidalVolume: (weight * 7).toFixed(1),
              peep: 8,
              ieRatio: "1:2",
              pip: 25,
              fio2: 55,
            };
          default:
            return baseSettings;
        }

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

  const [abgValues, setAbgValues] = useState({
    pH: "",
    pCO2: "",
    pO2: "",
    HCO3: "",
  });
  const [abgInterpretation, setAbgInterpretation] = useState("");
  const [selectedMode, setSelectedMode] = useState(initialSettings.mode);
  const [abgErrors, setAbgErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...initialSettings });

  // محاسبه محدوده‌های هشدار برای کودکان
  const calculateAlarmRanges = () => {
    const currentRR = parseFloat(currentSettings.respiratoryRate);
    const currentMvent = parseFloat(currentSettings.mvent);
    const currentPeep = parseFloat(currentSettings.peep);

    return {
      rr: {
        low: Math.max(8, currentRR - 10).toFixed(1),
        high: (currentRR + 10).toFixed(1),
        current: currentRR,
        unit: "/min"
      },
      mvent: {
        low: (currentMvent * 0.6).toFixed(2),
        high: (currentMvent * 1.4).toFixed(2),
        current: currentMvent,
        unit: "L/min"
      },
      peep: {
        low: Math.max(3, currentPeep - 2).toFixed(1),
        high: (currentPeep + 3).toFixed(1),
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
      if (pHNum < 7.2 || pHNum > 7.6) {
        errors.pH = "مقدار pH باید بین 7.2 تا 7.6 باشد";
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
      if (pCO2Num < 25 || pCO2Num > 60) {
        errors.pCO2 = "مقدار pCO2 باید بین 25 تا 60 mmHg باشد";
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
      if (HCO3Num < 18 || HCO3Num > 32) {
        errors.HCO3 = "مقدار HCO3 باید بین 18 تا 32 mEq/L باشد";
        isValid = false;
      } else if (HCO3Num < 22 || HCO3Num > 26) {
        errors.HCO3 = "مقدار HCO3 خارج از محدوده نرمال است";
      }
    }

    setAbgErrors(errors);
    setShowValidation(true);
    return isValid;
  };

  // تفسیر ABG برای کودکان
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

    // تفسیر برای کودکان
    if (pHNum < 7.35) {
      if (pCO2Num > 45) {
        interpretation = "اسیدوز تنفسی";
        newSettings.respiratoryRate = Math.min(
          35,
          currentSettings.respiratoryRate + 3
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
          currentSettings.respiratoryRate - 3
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
      compensation = "تعادل اسید-باز نرمال";
    }

    // تنظیمات بر اساس اکسیژناسیون
    if (pO2Num < 60) {
      newSettings.fio2 = Math.min(80, currentSettings.fio2 + 25);
      newSettings.peep = Math.min(12, currentSettings.peep + 3);
      interpretation += " - هیپوکسمی شدید";
    } else if (pO2Num < 80) {
      newSettings.fio2 = Math.min(60, currentSettings.fio2 + 15);
      newSettings.peep = Math.min(10, currentSettings.peep + 2);
      interpretation += " - هیپوکسمی";
    } else if (pO2Num > 100) {
      newSettings.fio2 = Math.max(25, currentSettings.fio2 - 10);
      interpretation += " - اکسیژناسیون خوب";
    }

    newSettings.mvent = calculateMvent(
      newSettings.tidalVolume,
      newSettings.respiratoryRate
    );
    newSettings.vti = newSettings.tidalVolume;

    setAbgInterpretation(interpretation);
    setCurrentSettings(newSettings);
    setAlarmRanges(calculateAlarmRanges());
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
    setAbgValues({ pH: "", pCO2: "", pO2: "", HCO3: "" });
    setAbgInterpretation("");
    setSelectedMode(initialSettings.mode);
    setAbgErrors({});
    setShowValidation(false);
    setAlarmRanges(calculateAlarmRanges());
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
        bronchiectasis: "برونشکتازی",
        cystic_fibrosis: "فیبروز سیستیک",
        foreign_body_aspiration: "آسپیراسیون جسم خارجی"
      };
      return diseases[obstructiveDisease] || obstructiveDisease;
    } else if (lungInvolvement === "restrictive") {
      const diseases = {
        pneumonia: "پنومونی",
        ards: "سندرم زجر تنفسی حاد (ARDS)",
        pulmonary_edema: "ادم ریوی",
        pulmonary_fibrosis: "فیبروز ریوی",
        pleural_effusion: "افیوژن پلور",
        pneumothorax: "پنوموتوراکس",
        atelectasis: "آتلکتازی"
      };
      return diseases[restrictiveDisease] || restrictiveDisease;
    }
    return "بدون بیماری مشخص";
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
                 lungInvolvement === "obstructive" ? "انسدادی" : "رستریکتیو"}
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
              <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    مانیتور ونتیلاتور - کودکان
                  </h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={openAlarmModal}
                      className="text-white hover:text-yellow-200 transition-colors p-2 rounded-lg hover:bg-gray-700"
                    >
                      <PiBellLight className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg " />
                    </button>
                    <button
                      onClick={openSettingsModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                        نمایشگر ونتیلاتور کودکان
                      </h3>
                      <div className="flex items-center justify-center h-32">
                        <p className="text-gray-400">
                          نمایشگر موج‌های تنفسی و فشار - کودکان
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* بخش تنظیمات در پایین صفحه */}
                <div className="mt-6">
                  <div className="bg-gray-700 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-3 text-center">
                      تنظیمات ونتیلاتور کودکان
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
        tempSettings={tempSettings}
        onSettingChange={handleSettingChange}
        selectedMode={selectedMode}
        modes={ventilatorModes}
        weight={weight}
        isInfant={false}
      />

      {/* مودال هشدار */}
      <AlarmModal
        show={showAlarmModal}
        onClose={closeAlarmModal}
        alarmRanges={alarmRanges}
      />
    </div>
  );
}