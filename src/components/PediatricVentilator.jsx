import React, { useState } from 'react'

export default function PediatricVentilator({ weight, age, ageUnit, disease, onBack }) {
  // تنظیمات اصلی اولیه
  const initialSettings = {
    tidalVolume: (weight * 6).toFixed(1),
    respiratoryRate: 12,
    fio2: 40,
    peep: 5,
    ieRatio: '1:2',
    flowRate: 60,
    mode: 'VCV' // مد پیش فرض
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
  const [selectedMode, setSelectedMode] = useState('VCV')

  // مدهای مختلف ونتیلاتور
  const ventilatorModes = {
    VCV: {
      name: 'VCV - حجم کنترل',
      description: 'حجم جاری ثابت، فشار متغیر',
      settings: {
        tidalVolume: (weight * 6).toFixed(1),
        respiratoryRate: 12,
        fio2: 40,
        peep: 5,
        ieRatio: '1:2',
        flowRate: 60
      }
    },
    PCV: {
      name: 'PCV - فشار کنترل',
      description: 'فشار دمی ثابت، حجم متغیر',
      settings: {
        pip: 20,
        respiratoryRate: 12,
        fio2: 40,
        peep: 5,
        ieRatio: '1:2',
        inspiratoryTime: 1.0
      }
    },
    SIMV: {
      name: 'SIMV - تهویه متناوب اجباری هماهنگ',
      description: 'ترکیب تنفس اجباری و خودبخودی',
      settings: {
        tidalVolume: (weight * 6).toFixed(1),
        respiratoryRate: 10,
        fio2: 40,
        peep: 5,
        ieRatio: '1:2',
        pressureSupport: 10
      }
    },
    CPAP: {
      name: 'CPAP - فشار مثبت مداوم راه هوایی',
      description: 'فشار مثبت مداوم در تمام چرخه تنفسی',
      settings: {
        cpap: 8,
        fio2: 40,
        pressureSupport: 5
      }
    },
    PSV: {
      name: 'PSV - حمایت فشاری',
      description: 'حمایت از تنفس خودبخودی بیمار',
      settings: {
        pressureSupport: 12,
        fio2: 40,
        peep: 5
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

    // تفسیر ABG برای کودکان
    if (pHNum < 7.35) {
      if (pCO2Num > 45) {
        interpretation = 'اسیدوز تنفسی'
        newSettings.respiratoryRate = 16
        if (selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.tidalVolume = (weight * 10).toFixed(1)
        }
      } else if (HCO3Num < 22) {
        interpretation = 'اسیدوز متابولیک'
        // تنظیمات برای اسیدوز متابولیک
      }
    } else if (pHNum > 7.45) {
      if (pCO2Num < 35) {
        interpretation = 'آلکالوز تنفسی'
        newSettings.respiratoryRate = 10
        if (selectedMode === 'VCV' || selectedMode === 'SIMV') {
          newSettings.tidalVolume = (weight * 6).toFixed(1)
        }
      } else if (HCO3Num > 26) {
        interpretation = 'آلکالوز متابولیک'
        // تنظیمات برای آلکالوز متابولیک
      }
    } else {
      interpretation = 'ABG نرمال'
    }

    // بررسی هیپوکسمی
    if (pO2Num < 80) {
      interpretation += ' + هیپوکسمی'
      newSettings.fio2 = 50
      newSettings.peep = 8
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
    setSelectedMode('VCV')
  }

  // رندر تنظیمات بر اساس مد انتخاب شده
  const renderModeSpecificSettings = () => {
    switch(selectedMode) {
      case 'VCV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">حجم جاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.tidalVolume} ml</p>
                <p className="text-blue-400 text-xs">8 ml/kg</p>
              </div>
            </div>
          </>
        )
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
      case 'SIMV':
        return (
          <>
            <div className="bg-blue-900 rounded-lg p-4 border-2 border-blue-500">
              <div className="text-center">
                <h3 className="text-blue-300 text-sm mb-1">حجم جاری</h3>
                <p className="text-2xl font-bold text-white mb-1">{currentSettings.tidalVolume} ml</p>
                <p className="text-blue-400 text-xs">8 ml/kg</p>
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
      default:
        return null
    }
  }

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
              {disease && (
                <p className="text-teal-600">بیماری: {disease}</p>
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
            <div className="bg-teal-50 rounded-lg p-4 text-center">
              <p className="text-teal-600 text-sm">وزن بیمار</p>
              <p className="text-xl font-bold text-teal-800">{weight} kg</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-blue-600 text-sm">سن بیمار</p>
              <p className="text-xl font-bold text-blue-800">{age} {ageUnit === 'days' ? 'روز' : ageUnit === 'months' ? 'ماه' : 'سال'}</p>
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
              <h2 className="text-xl font-bold text-gray-800 mb-4">انتخاب مد ونتیلاتور</h2>
              
              <div className="space-y-3">
                {Object.entries(ventilatorModes).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                      selectedMode === key
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
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
                {selectedMode === 'VCV' && (
                  <>
                    <p>• حجم جاری ثابت در هر تنفس</p>
                    <p>• مناسب برای بیماران با compliance ثابت</p>
                    <p>• جلوگیری از volutrauma</p>
                  </>
                )}
                {selectedMode === 'PCV' && (
                  <>
                    <p>• فشار دمی ثابت در هر تنفس</p>
                    <p>• مناسب برای بیماران با نشت هوا</p>
                    <p>• کاهش خطر barotrauma</p>
                  </>
                )}
                {selectedMode === 'SIMV' && (
                  <>
                    <p>• ترکیب تنفس اجباری و خودبخودی</p>
                    <p>• مناسب برای weaning از ونتیلاتور</p>
                    <p>• حفظ عضلات تنفسی</p>
                  </>
                )}
                {selectedMode === 'CPAP' && (
                  <>
                    <p>• فشار مثبت مداوم در راه هوایی</p>
                    <p>• مناسب برای بیماران با تنفس خودبخودی</p>
                    <p>• بهبود oxygenation</p>
                  </>
                )}
                {selectedMode === 'PSV' && (
                  <>
                    <p>• حمایت از تنفس خودبخودی بیمار</p>
                    <p>• کاهش کار تنفسی</p>
                    <p>• مناسب برای weaning</p>
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
                  <h2 className="text-xl font-bold text-white">مانیتور ونتیلاتور</h2>
                  <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm">
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
                      placeholder="7.40"
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
                      placeholder="80"
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
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-bold transition-colors mb-6"
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