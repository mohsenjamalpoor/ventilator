import React, { useState } from "react";
import ModeSelectionModal from "./ModeSelectionModal";
import ABGInterpretation from "./ABGInterpretation";
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
    respiratoryRate: 12,
    fio2: 40,
    peep: 5,
    ieRatio: "1:2",
    flowRate: 60,
    mode: "SIMV",
    pressureSupport: 10,
    cpap: 8,
    pip: 18,
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

  const [selectedMode, setSelectedMode] = useState("SIMV");
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

  // مدهای ونتیلاتور
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
    setSelectedMode("SIMV");
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const newSettings = {
      ...currentSettings,
      mode: mode,
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

  // تابع برای دریافت تنظیمات جدید از تفسیر ABG
  const handleABGInterpretation = (newSettings, interpretation) => {
    setCurrentSettings(newSettings);
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
                  <div className="lg:col-span-1">
                    <div className="bg-gray-600 rounded-xl p-4 h-full">
                      <div className="space-y-3">
                        <div className="bg-indigo-900 rounded-lg p-2 border border-indigo-600">
                          <div className="text-center">
                            <h3 className="text-indigo-300 text-xs mb-1">PIP</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.pip}
                            </p>
                            <p className="text-indigo-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        <div className="bg-purple-900 rounded-lg p-2 border border-purple-600">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">FiO₂</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.fio2}%
                            </p>
                            <p className="text-purple-400 text-xs">%</p>
                          </div>
                        </div>

                        <div className="bg-red-900 rounded-lg p-2 border border-red-600">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        <div className="bg-teal-900 rounded-lg p-2 border border-teal-600">
                          <div className="text-center">
                            <h3 className="text-teal-300 text-xs mb-1">MVent</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.mvent}
                            </p>
                            <p className="text-teal-400 text-xs">L/min</p>
                          </div>
                        </div>

                        <div className="bg-blue-900 rounded-lg p-2 border border-blue-600">
                          <div className="text-center">
                            <h3 className="text-blue-300 text-xs mb-1">VTi</h3>
                            <p className="text-lg font-bold text-white">
                              {currentSettings.vti}
                            </p>
                            <p className="text-blue-400 text-xs">ml</p>
                          </div>
                        </div>

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

                <div className="mt-6">
                  <div className="bg-gray-700 rounded-xl p-4">
                    <h3 className="text-white font-bold mb-3 text-center">
                      تنظیمات ونتیلاتور
                    </h3>

                    {selectedMode === "CPAP" ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

                        <div className="bg-red-900 rounded-lg p-3 border-2 border-red-500">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        <div className="bg-purple-900 rounded-lg p-3 border-2 border-purple-500">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">FiO₂</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.fio2}%
                            </p>
                            <p className="text-purple-400 text-xs">%</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-900 rounded-lg p-3 border-2 border-blue-500">
                          <div className="text-center">
                            <h3 className="text-blue-300 text-xs mb-1">TV</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.tidalVolume}
                            </p>
                            <p className="text-blue-400 text-xs">ml</p>
                          </div>
                        </div>

                        <div className="bg-green-900 rounded-lg p-3 border-2 border-green-500">
                          <div className="text-center">
                            <h3 className="text-green-300 text-xs mb-1">RR</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.respiratoryRate}
                            </p>
                            <p className="text-green-400 text-xs">/min</p>
                          </div>
                        </div>

                        <div className="bg-red-900 rounded-lg p-3 border-2 border-red-500">
                          <div className="text-center">
                            <h3 className="text-red-300 text-xs mb-1">PEEP</h3>
                            <p className="text-xl font-bold text-white mb-1">
                              {currentSettings.peep}
                            </p>
                            <p className="text-red-400 text-xs">cmH₂O</p>
                          </div>
                        </div>

                        <div className="bg-purple-900 rounded-lg p-3 border-2 border-purple-500">
                          <div className="text-center">
                            <h3 className="text-purple-300 text-xs mb-1">FiO₂</h3>
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
              </div>

              {/* کامپوننت تفسیر ABG */}
              <ABGInterpretation
                currentSettings={currentSettings}
                initialSettings={initialSettings}
                weight={weight}
                selectedMode={selectedMode}
                onInterpretation={handleABGInterpretation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* مودال انتخاب مد */}
      <ModeSelectionModal
        show={showModeModal}
        onClose={closeModeModal}
        ventilatorModes={ventilatorModes}
        selectedMode={selectedMode}
        onModeChange={handleModeChange}
      />

      {/* مودال ویرایش تنظیمات */}
      <SettingsModal
        show={showSettingsModal}
        onClose={closeSettingsModal}
        ventilatorModes={ventilatorModes}
        selectedMode={selectedMode}
        tempSettings={tempSettings}
        onSettingChange={handleSettingChange}
        onSave={saveSettings}
        onReset={() => {
          setTempSettings({
            ...initialSettings,
            mvent: calculateMvent(
              initialSettings.tidalVolume,
              initialSettings.respiratoryRate
            ),
            vti: initialSettings.tidalVolume,
            vte: (weight * 5.8).toFixed(1),
          });
        }}
        weight={weight}
      />
    </div>
  );
}