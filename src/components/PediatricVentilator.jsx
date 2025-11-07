// src/components/PediatricVentilator.js
import React, { useState } from "react";
import { PiBellLight } from "react-icons/pi";

// ایمپورت تنظیمات از فایل جداگانه
import { 
  calculateAlarmRanges, 
  calculateMvent,
  getDiseaseName,
  getInitialSettings 
} from "../utils/pediatricVentilatorConfig";

// ایمپورت کامپوننت‌های مورد نیاز
import ModeSelectionModal from "./ModeSelectionModal";
import SettingsModal from "./SettingsModal";
import ABGInterpretation from "./ABGInterpretation";
import AlarmModal from "./AlarmModal";

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
  // محاسبه تنظیمات اولیه
  const initialSettings = getInitialSettings(
    weight, 
    lungInvolvement, 
    normalLungCondition, 
    obstructiveDisease, 
    restrictiveDisease
  );

  // state برای تنظیمات فعال
  const [currentSettings, setCurrentSettings] = useState({
    ...initialSettings,
    mvent: calculateMvent(initialSettings.tidalVolume, initialSettings.respiratoryRate),
    vti: initialSettings.tidalVolume,
    vte: (weight * 6.5).toFixed(1),
  });

  // state برای ذخیره تنظیمات قبل از تفسیر ABG
  const [settingsBeforeABG, setSettingsBeforeABG] = useState({ ...currentSettings });

  // stateهای مربوط به مودال‌ها
  const [selectedMode, setSelectedMode] = useState(initialSettings.mode);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...currentSettings });
  const [resetTrigger, setResetTrigger] = useState(0);

  // state برای محدوده‌های هشدار
  const [alarmRanges, setAlarmRanges] = useState(calculateAlarmRanges(currentSettings));

  // تعریف مدهای ونتیلاتور برای کودکان
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
        { 
          key: "fio2", 
          label: "FiO₂", 
          unit: "%", 
          min: 21, 
          max: 100, 
          step: 1 
        },
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
        { 
          key: "fio2", 
          label: "FiO₂", 
          unit: "%", 
          min: 21, 
          max: 100, 
          step: 1 
        },
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
        { 
          key: "fio2", 
          label: "FiO₂", 
          unit: "%", 
          min: 21, 
          max: 100, 
          step: 1 
        },
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

  // تابع بازنشانی تنظیمات
  const resetSettings = () => {
    const resetSettings = {
      ...initialSettings,
      mvent: calculateMvent(initialSettings.tidalVolume, initialSettings.respiratoryRate),
      vti: initialSettings.tidalVolume,
      vte: (weight * 6.5).toFixed(1),
    };
    
    setCurrentSettings(resetSettings);
    setSettingsBeforeABG(resetSettings);
    setSelectedMode(initialSettings.mode);
    setAlarmRanges(calculateAlarmRanges(resetSettings));
    setResetTrigger(prev => prev + 1);
  };

  // تابع تغییر مد
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const newSettings = {
      ...currentSettings,
      mode: mode,
      mvent: calculateMvent(currentSettings.tidalVolume, currentSettings.respiratoryRate),
    };
    setCurrentSettings(newSettings);
    setSettingsBeforeABG(newSettings);
    setShowModeModal(false);
    setAlarmRanges(calculateAlarmRanges(newSettings));
  };

  // توابع مربوط به مودال‌ها
  const openModeModal = () => setShowModeModal(true);
  const closeModeModal = () => setShowModeModal(false);
  
  const openSettingsModal = () => {
    setTempSettings({ ...currentSettings });
    setShowSettingsModal(true);
  };
  const closeSettingsModal = () => setShowSettingsModal(false);
  
  const openAlarmModal = () => {
    setAlarmRanges(calculateAlarmRanges(currentSettings));
    setShowAlarmModal(true);
  };
  const closeAlarmModal = () => setShowAlarmModal(false);

  // تابع ذخیره تنظیمات
  const saveSettings = () => {
    const updatedSettings = {
      ...tempSettings,
      mvent: calculateMvent(tempSettings.tidalVolume, tempSettings.respiratoryRate),
      vti: tempSettings.tidalVolume,
    };
    setCurrentSettings(updatedSettings);
    setSettingsBeforeABG(updatedSettings);
    setShowSettingsModal(false);
    setAlarmRanges(calculateAlarmRanges(updatedSettings));
  };

  // تابع تغییر تنظیمات
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

  // توابع مربوط به ABG
  const handleSettingsUpdateFromABG = (newSettings) => {
    setCurrentSettings(newSettings);
    setAlarmRanges(calculateAlarmRanges(newSettings));
  };

  const handleSettingsBeforeABG = (settings) => {
    setSettingsBeforeABG(settings);
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
              <p className="text-blue-600">
                بیماری: {getDiseaseName(lungInvolvement, normalLungCondition, obstructiveDisease, restrictiveDisease)}
              </p>
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
                {age} {ageUnit === "days" ? "روز" : ageUnit === "months" ? "ماه" : "سال"}
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

                {/* بخش مانیتور */}
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
                  </div>
                </div>

                {/* بخش تنظیمات */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-inner">
                  <h3 className="text-blue-800 font-bold mb-3 text-center">
                    تنظیمات ونتیلاتور کودکان
                  </h3>

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

              {/* کامپوننت تفسیر ABG */}
              <ABGInterpretation
                weight={weight}
                selectedMode={selectedMode}
                currentSettings={currentSettings}
                settingsBeforeABG={settingsBeforeABG}
                onSettingsUpdate={handleSettingsUpdateFromABG}
                onSettingsBeforeUpdate={handleSettingsBeforeABG}
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