import React, { useState } from 'react'

export default function InfantVentilator({ weight, age, ageUnit, disease, onBack }) {
  // تنظیمات اصلی اولیه
  const initialSettings = {
    tidalVolume: (weight * 6).toFixed(1),
    respiratoryRate: 30,
    pip: 20,
    fio2: 40,
    peep: 5,
    ieRatio: '1:2',
    mode: 'PCV' // مد پیش فرض برای نوزادان
  }

  // state برای تنظیمات فعال
  const [currentSettings, setCurrentSettings] = useState(initialSettings)
  const [abgValues, setAbgValues] = useState({
    pH: '',
    pCO2: '',
    pO2: '',
    HCO3: ''
  })
  const [abgInterpretation, setAbgInterpretation] = useState('')
  const [selectedMode, setSelectedMode] = useState('PCV')

  // مدهای مختلف ونتیلاتور برای نوزادان
  const ventilatorModes = {
    PCV: {
      name: 'PCV - فشار کنترل',
      description: 'فشار دمی ثابت، حجم متغیر - مناسب نوزادان',
      settings: {
        pip: 18,
        respiratoryRate: 35,
        fio2: 40,
        peep: 5,
        ieRatio: '1:1.5',
        inspiratoryTime: 0.4
      }
    },
    VCV: {
      name: 'VCV - حجم کنترل',
      description: 'حجم جاری ثابت، فشار متغیر',
      settings: {
        tidalVolume: (weight * 6).toFixed(1),
        respiratoryRate: 30,
        fio2: 40,
        peep: 5,
        ieRatio: '1:2',
        flowRate: 8
      }
    },
    SIMV: {
      name: 'SIMV - تهویه متناوب اجباری هماهنگ',
      description: 'ترکیب تنفس اجباری و خودبخودی',
      settings: {
        tidalVolume: (weight * 6).toFixed(1),
        respiratoryRate: 25,
        fio2: 40,
        peep: 5,
        ieRatio: '1:2',
        pressureSupport: 8
      }
    },
    CPAP: {
      name: 'CPAP - فشار مثبت مداوم راه هوایی',
      description: 'فشار مثبت مداوم در تمام چرخه تنفسی',
      settings: {
        cpap: 6,
        fio2: 40,
        pressureSupport: 6
      }
    },
    PSV: {
      name: 'PSV - حمایت فشاری',
      description: 'حمایت از تنفس خودبخودی نوزاد',
      settings: {
        pressureSupport: 10,
        fio2: 40,
        peep: 5
      }
    },
    HFOV: {
      name: 'HFOV - تهویه با فرکانس بالا',
      description: 'حجم‌های جاری بسیار کم با فرکانس بالا',
      settings: {
        map: 12,
        amplitude: 25,
        frequency: 10,
        fio2: 40,
        it: '33%'
      }
    },
    DuoPAP: {
      name: 'DuoPAP - فشار هوایی مثبت دو سطحی',
      description: 'دو سطح فشار برای نوزادان نارس',
      settings: {
        phigh: 16,
        plow: 6,
        timeHigh: 0.5,
        timeLow: 0.8,
        fio2: 40
      }
    }
  }

  const handleModeChange = (mode) => {
    setSelectedMode(mode)
    const modeSettings = ventilatorModes[mode].settings
    setCurrentSettings(prev => ({
      ...prev,
      ...modeSettings,
      mode: mode
    }))
  }

  const interpretABG = () => {
    const { pH, pCO2, pO2, HCO3 } = abgValues
    
    if (!pH || !pCO2 || !pO2 || !HCO3) {
      alert('لطفا تمام مقادیر ABG را وارد کنید')
      return
    }

    const pHNum = parseFloat(pH)
    const pCO2Num = parseFloat(pCO2)
    const pO2Num = parseFloat(pO2)
    const HCO3Num = parseFloat(HCO3)

    let interpretation = ''
    let newSettings = { ...currentSettings }

    // تفسیر ABG برای نوزادان
    if (pHNum < 7.25) {
      if (pCO2Num > 55) {
        interpretation = 'اسیدوز تنفسی شدید'
        if (selectedMode === 'PCV') {
          newSettings.pip = 22
          newSettings.respiratoryRate = 40
        } else if (selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.respiratoryRate = 35
          newSettings.tidalVolume = (weight * 7).toFixed(1)
        }
      } else if (HCO3Num < 16) {
        interpretation = 'اسیدوز متابولیک شدید'
        // تنظیمات برای اسیدوز متابولیک
      }
    } else if (pHNum < 7.35) {
      if (pCO2Num > 45) {
        interpretation = 'اسیدوز تنفسی'
        if (selectedMode === 'PCV') {
          newSettings.pip = 20
          newSettings.respiratoryRate = 35
        } else if (selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.respiratoryRate = 32
        }
      } else if (HCO3Num < 22) {
        interpretation = 'اسیدوز متابولیک'
      }
    } else if (pHNum > 7.45) {
      if (pCO2Num < 35) {
        interpretation = 'آلکالوز تنفسی'
        if (selectedMode === 'PCV' || selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.respiratoryRate = 25
        }
        if (selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.tidalVolume = (weight * 5).toFixed(1)
        }
      } else if (HCO3Num > 26) {
        interpretation = 'آلکالوز متابولیک'
      }
    } else {
      interpretation = 'ABG نرمال'
    }

    // بررسی هیپوکسمی برای نوزادان
    if (pO2Num < 50) {
      interpretation += ' + هیپوکسمی شدید'
      newSettings.fio2 = 60
      newSettings.peep = 7
    } else if (pO2Num < 60) {
      interpretation += ' + هیپوکسمی'
      newSettings.fio2 = 50
      newSettings.peep = 6
    }

    setAbgInterpretation(interpretation)
    setCurrentSettings(newSettings)
  }

  const handleAbgChange = (field, value) => {
    setAbgValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetSettings = () => {
    setCurrentSettings(initialSettings)
    setAbgValues({ pH: '', pCO2: '', pO2: '', HCO3: '' })
    setAbgInterpretation('')
    setSelectedMode('PCV')
  }

  // رندر تنظیمات بر اساس مد انتخاب شده برای نوزادان
  const renderModeSpecificSettings = () => {
    switch(selectedMode) {
      case 'PCV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">فشار دمی (PIP)</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.pip} cmH₂O</p>
                <p className="text-blue-400 text-xs">Peak Pressure</p>
              </div>
            </div>
            <div className="bg-purple-900 rounded-lg p-4 border-2 border-purple-500">
              <div className="text-center">
                <h3 className="text-purple-300 text-sm mb-1">زمان دم</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.inspiratoryTime} s</p>
                <p className="text-purple-400 text-xs">Inspiratory Time</p>
              </div>
            </div>
          </>
        )
      case 'VCV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">حجم جاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.tidalVolume} ml</p>
                <p className="text-blue-400 text-xs">6 ml/kg</p>
              </div>
            </div>
            <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
              <div className="text-center">
                <h3 className="text-green-300 text-sm mb-1">سرعت جریان</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.flowRate} L/min</p>
                <p className="text-green-400 text-xs">Flow Rate</p>
              </div>
            </div>
          </>
        )
      case 'SIMV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">حجم جاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.tidalVolume} ml</p>
                <p className="text-blue-400 text-xs">6 ml/kg</p>
              </div>
            </div>
            <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
              <div className="text-center">
                <h3 className="text-green-300 text-sm mb-1">حمایت فشاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.pressureSupport} cmH₂O</p>
                <p className="text-green-400 text-xs">Pressure Support</p>
              </div>
            </div>
          </>
        )
      case 'CPAP':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">سطح CPAP</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.cpap} cmH₂O</p>
                <p className="text-blue-400 text-xs">CPAP Level</p>
              </div>
            </div>
            <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
              <div className="text-center">
                <h3 className="text-green-300 text-sm mb-1">حمایت فشاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.pressureSupport} cmH₂O</p>
                <p className="text-green-400 text-xs">Pressure Support</p>
              </div>
            </div>
          </>
        )
      case 'PSV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">حمایت فشاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.pressureSupport} cmH₂O</p>
                <p className="text-blue-400 text-xs">Pressure Support</p>
              </div>
            </div>
          </>
        )
      case 'HFOV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">فشار میانگین (MAP)</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.map} cmH₂O</p>
                <p className="text-blue-400 text-xs">Mean Airway Pressure</p>
              </div>
            </div>
            <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
              <div className="text-center">
                <h3 className="text-green-300 text-sm mb-1">دامنه</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.amplitude} ΔP</p>
                <p className="text-green-400 text-xs">Amplitude</p>
              </div>
            </div>
            <div className="bg-purple-900 rounded-lg p-4 border-2 border-purple-500">
              <div className="text-center">
                <h3 className="text-purple-300 text-sm mb-1">فرکانس</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.frequency} Hz</p>
                <p className="text-purple-400 text-xs">Frequency</p>
              </div>
            </div>
          </>
        )
      case 'DuoPAP':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">فشار بالا</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.phigh} cmH₂O</p>
                <p className="text-blue-400 text-xs">P High</p>
              </div>
            </div>
            <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
              <div className="text-center">
                <h3 className="text-green-300 text-sm mb-1">فشار پایین</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.plow} cmH₂O</p>
                <p className="text-green-400 text-xs">P Low</p>
              </div>
            </div>
            <div className="bg-purple-900 rounded-lg p-4 border-2 border-purple-500">
              <div className="text-center">
                <h3 className="text-purple-300 text-sm mb-1">زمان فشار بالا</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.timeHigh} s</p>
                <p className="text-purple-400 text-xs">Time High</p>
              </div>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-800 mb-2">
                تنظیمات ونتیلاتور - نوزادان
              </h1>
              {disease && (
                <p className="text-purple-600">بیماری: {disease}</p>
              )}
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-purple-600 text-sm">وزن بیمار</p>
              <p className="text-xl font-bold text-purple-800">{weight} kg</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-600 text-sm">سن بیمار</p>
              <p className="text-xl font-bold text-blue-800">{age} {ageUnit === 'days' ? 'روز' : ageUnit === 'months' ? 'ماه' : 'سال'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm">نوع بیمار</p>
              <p className="text-xl font-bold text-green-800">نوزاد</p>
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">انتخاب مد ونتیلاتور</h2>
              
              <div className="space-y-3">
                {Object.entries(ventilatorModes).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                      selectedMode === key
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-bold text-lg">{mode.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* اطلاعات مد انتخاب شده */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-3">📋 درباره مد {ventilatorModes[selectedMode]?.name}:</h3>
              <div className="text-gray-700 text-sm space-y-2">
                {selectedMode === 'PCV' && (
                  <>
                    <p>• فشار دمی ثابت در هر تنفس</p>
                    <p>• مناسب برای نوزادان با نشت هوا</p>
                    <p>• کاهش خطر باروتروما</p>
                    <p>• حجم جاری متغیر</p>
                  </>
                )}
                {selectedMode === 'VCV' && (
                  <>
                    <p>• حجم جاری ثابت در هر تنفس</p>
                    <p>• مناسب برای نوزادان با compliance ثابت</p>
                    <p>• جلوگیری از volutrauma</p>
                  </>
                )}
                {selectedMode === 'SIMV' && (
                  <>
                    <p>• ترکیب تنفس اجباری و خودبخودی</p>
                    <p>• مناسب برای weaning از ونتیلاتور</p>
                    <p>• حفظ عملکرد عضلات تنفسی</p>
                  </>
                )}
                {selectedMode === 'CPAP' && (
                  <>
                    <p>• فشار مثبت مداوم در راه هوایی</p>
                    <p>• مناسب برای نوزادان با تنفس خودبخودی</p>
                    <p>• بهبود اکسیژناسیون</p>
                  </>
                )}
                {selectedMode === 'PSV' && (
                  <>
                    <p>• حمایت از تنفس خودبخودی نوزاد</p>
                    <p>• کاهش کار تنفسی</p>
                    <p>• مناسب برای weaning</p>
                  </>
                )}
                {selectedMode === 'HFOV' && (
                  <>
                    <p>• حجم‌های جاری بسیار کم</p>
                    <p>• فرکانس تنفسی بالا</p>
                    <p>• مناسب برای RDS شدید</p>
                    <p>• کاهش آسیب ریوی</p>
                  </>
                )}
                {selectedMode === 'DuoPAP' && (
                  <>
                    <p>• دو سطح فشار برای نوزادان نارس</p>
                    <p>• بهبود تبادل گازی</p>
                    <p>• کاهش نیاز به سورفکتانت</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* مانیتور ونتیلاتور و تفسیر ABG */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {/* مانیتور ونتیلاتور */}
              <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">مانیتور ونتیلاتور - نوزادان</h2>
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {ventilatorModes[selectedMode]?.name}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* تنظیمات عمومی */}
                  <div className="bg-green-900 rounded-lg p-4 border-2 border-green-500">
                    <div className="text-center">
                      <h3 className="text-green-300 text-sm mb-1">میزان تنفس</h3>
                      <p className="text-2xl font-bold text-white mb-1">{currentSettings.respiratoryRate} /min</p>
                      <p className="text-green-400 text-xs">تنفس در دقیقه</p>
                    </div>
                  </div>

                  <div className="bg-purple-900 rounded-lg p-4 border-2 border-purple-500">
                    <div className="text-center">
                      <h3 className="text-purple-300 text-sm mb-1">FiO₂</h3>
                      <p className="text-2xl font-bold text-white mb-1">{currentSettings.fio2}%</p>
                      <p className="text-purple-400 text-xs">درصد اکسیژن</p>
                    </div>
                  </div>

                  <div className="bg-red-900 rounded-lg p-4 border-2 border-red-500">
                    <div className="text-center">
                      <h3 className="text-red-300 text-sm mb-1">PEEP</h3>
                      <p className="text-2xl font-bold text-white mb-1">{currentSettings.peep} cmH₂O</p>
                      <p className="text-red-400 text-xs">فشار بازدم</p>
                    </div>
                  </div>

                  <div className="bg-indigo-900 rounded-lg p-4 border-2 border-indigo-500">
                    <div className="text-center">
                      <h3 className="text-indigo-300 text-sm mb-1">نسبت I:E</h3>
                      <p className="text-2xl font-bold text-white mb-1">{currentSettings.ieRatio}</p>
                      <p className="text-indigo-400 text-xs">نسبت دم به بازدم</p>
                    </div>
                  </div>

                  {/* تنظیمات خاص هر مد */}
                  {renderModeSpecificSettings()}
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">تفسیر ABG و تنظیمات پیشنهادی</h2>
                
                {/* فرم ورود ABG */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pH</label>
                    <input
                      type="number"
                      step="0.01"
                      value={abgValues.pH}
                      onChange={(e) => handleAbgChange('pH', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                      placeholder="7.35"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pCO₂</label>
                    <input
                      type="number"
                      step="0.1"
                      value={abgValues.pCO2}
                      onChange={(e) => handleAbgChange('pCO2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">pO₂</label>
                    <input
                      type="number"
                      step="0.1"
                      value={abgValues.pO2}
                      onChange={(e) => handleAbgChange('pO2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                      placeholder="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HCO₃</label>
                    <input
                      type="number"
                      step="0.1"
                      value={abgValues.HCO3}
                      onChange={(e) => handleAbgChange('HCO3', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
                      placeholder="24"
                    />
                  </div>
                </div>

                <button
                  onClick={interpretABG}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-colors mb-6"
                >
                  تفسیر ABG و اعمال تنظیمات
                </button>

                {/* نتایج تفسیر */}
                {abgInterpretation && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold text-blue-800 mb-2">تفسیر ABG:</h3>
                      <p className="text-blue-700 font-semibold text-lg">{abgInterpretation}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-bold text-green-800 mb-2">📝 تغییرات اعمال شده:</h3>
                      <div className="text-green-700">
                        {initialSettings.respiratoryRate !== currentSettings.respiratoryRate && (
                          <p>• میزان تنفس: {initialSettings.respiratoryRate} → <strong>{currentSettings.respiratoryRate}</strong> /min</p>
                        )}
                        {initialSettings.tidalVolume !== currentSettings.tidalVolume && (
                          <p>• حجم جاری: {initialSettings.tidalVolume} → <strong>{currentSettings.tidalVolume}</strong> ml</p>
                        )}
                        {initialSettings.pip !== currentSettings.pip && (
                          <p>• PIP: {initialSettings.pip} → <strong>{currentSettings.pip}</strong> cmH₂O</p>
                        )}
                        {initialSettings.fio2 !== currentSettings.fio2 && (
                          <p>• FiO₂: {initialSettings.fio2}% → <strong>{currentSettings.fio2}%</strong></p>
                        )}
                        {initialSettings.peep !== currentSettings.peep && (
                          <p>• PEEP: {initialSettings.peep} → <strong>{currentSettings.peep}</strong> cmH₂O</p>
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
    </div>
  )
}