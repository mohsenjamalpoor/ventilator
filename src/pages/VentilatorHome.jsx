import React, { useState } from 'react'
import InfantVentilator from '../components/InfantVentilator'
import PediatricVentilator from '../components/PediatricVentilator'

export default function VentilatorHome() {
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [ageUnit, setAgeUnit] = useState('months')
  const [lungInvolvement, setLungInvolvement] = useState('') // نوع درگیری ریوی
  const [normalLungCondition, setNormalLungCondition] = useState('') // شرایط ریه نرمال
  const [obstructiveDisease, setObstructiveDisease] = useState('') // بیماری انسدادی
  const [restrictiveDisease, setRestrictiveDisease] = useState('') // بیماری رستریکتیو
  const [ventilatorType, setVentilatorType] = useState(null)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!weight || weight <= 0) {
      newErrors.weight = 'وزن باید بزرگتر از صفر باشد'
    }
    
    if (!age || age <= 0) {
      newErrors.age = 'سن باید بزرگتر از صفر باشد'
    }
    
    if (!lungInvolvement) {
      newErrors.lungInvolvement = 'لطفا نوع درگیری ریوی را انتخاب کنید'
    }

    // اگر ریه نرمال انتخاب شده، شرایط مربوطه باید انتخاب شود
    if (lungInvolvement === 'normal' && !normalLungCondition) {
      newErrors.normalLungCondition = 'لطفا شرایط بیمار را انتخاب کنید'
    }

    // اگر انسدادی انتخاب شده، بیماری انسدادی باید انتخاب شود
    if (lungInvolvement === 'obstructive' && !obstructiveDisease) {
      newErrors.obstructiveDisease = 'لطفا بیماری انسدادی را انتخاب کنید'
    }

    // اگر رستریکتیو انتخاب شده، بیماری رستریکتیو باید انتخاب شود
    if (lungInvolvement === 'restrictive' && !restrictiveDisease) {
      newErrors.restrictiveDisease = 'لطفا بیماری رستریکتیو را انتخاب کنید'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVentilatorSelect = (type) => {
    if (validateForm()) {
      setVentilatorType(type)
    }
  }

  const handleReset = () => {
    setWeight('')
    setAge('')
    setAgeUnit('months')
    setLungInvolvement('')
    setNormalLungCondition('')
    setObstructiveDisease('')
    setRestrictiveDisease('')
    setVentilatorType(null)
    setErrors({})
  }

  // اگر نوع ونتیلاتور انتخاب شد، صفحه مربوطه را نمایش بده
  if (ventilatorType === 'pressure-controlled') {
    return <InfantVentilator 
      weight={weight} 
      age={age} 
      ageUnit={ageUnit} 
      lungInvolvement={lungInvolvement}
      normalLungCondition={normalLungCondition}
      obstructiveDisease={obstructiveDisease}
      restrictiveDisease={restrictiveDisease}
      onBack={handleReset} 
    />
  }
  
  if (ventilatorType === 'volume-controlled') {
    return <PediatricVentilator 
      weight={weight} 
      age={age} 
      ageUnit={ageUnit} 
      lungInvolvement={lungInvolvement}
      normalLungCondition={normalLungCondition}
      obstructiveDisease={obstructiveDisease}
      restrictiveDisease={restrictiveDisease}
      onBack={handleReset} 
    />
  }

  // صفحه اصلی ورود اطلاعات
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* هدر */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2"> آموزش ونتیلاتور</h1>
          <p className="text-blue-100">لطفا اطلاعات بیمار را وارد کنید</p>
        </div>

        {/* فرم ورود اطلاعات */}
        <div className="p-6">
          {/* فیلد وزن */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
              وزن بیمار (کیلوگرم)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2 ${
                errors.weight 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="مثال: 3.5"
            />
            {errors.weight && (
              <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
            )}
          </div>

          {/* فیلد سن */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              سن بیمار
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2 ${
                  errors.age 
                    ? 'border-red-500 focus:ring-red-200' 
                    : 'border-gray-300 focus:ring-blue-200'
                }`}
                placeholder="مثال: 1.5"
              />
              <select
                value={ageUnit}
                onChange={(e) => setAgeUnit(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="days">روز</option>
                <option value="months">ماه</option>
                <option value="years">سال</option>
              </select>
            </div>
            {errors.age && (
              <p className="text-red-500 text-xs mt-1">{errors.age}</p>
            )}
          </div>

          {/* فیلد نوع درگیری ریوی */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lungInvolvement">
              نوع درگیری ریوی
            </label>
            <select
              id="lungInvolvement"
              value={lungInvolvement}
              onChange={(e) => {
                setLungInvolvement(e.target.value)
                setNormalLungCondition('') 
                setObstructiveDisease('') 
                setRestrictiveDisease('') 
              }}
              className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 ${
                errors.lungInvolvement 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            >
              <option value="">لطفا نوع درگیری ریوی را انتخاب کنید</option>
              <option value="normal">ریه نرمال</option>
              <option value="obstructive">Obstructive</option>
              <option value="restrictive">Restrictive</option>
              {/* <option value="mixed">ترکیبی (Mixed)</option> */}
              {/* <option value="none">بدون درگیری ریوی</option> */}
            </select>
            {errors.lungInvolvement && (
              <p className="text-red-500 text-xs mt-1">{errors.lungInvolvement}</p>
            )}

            {/* فیلد شرایط ریه نرمال  */}
            {lungInvolvement === 'normal' && (
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="normalLungCondition">
                  شرایط بیمار با ریه نرمال
                </label>
                <select
                  id="normalLungCondition"
                  value={normalLungCondition}
                  onChange={(e) => setNormalLungCondition(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 ${
                    errors.normalLungCondition 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                >
                  <option value="">لطفا شرایط بیمار را انتخاب کنید</option>
                  <option value="reduced_consciousness">کاهش سطح هوشیاری</option>
                  <option value="seizure">تشنج</option>
                </select>
                {errors.normalLungCondition && (
                  <p className="text-red-500 text-xs mt-1">{errors.normalLungCondition}</p>
                )}
              </div>
            )}

            {/* فیلد بیماری انسدادی   */}
            {lungInvolvement === 'obstructive' && (
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="obstructiveDisease">
                  بیماری انسدادی
                </label>
                <select
                  id="obstructiveDisease"
                  value={obstructiveDisease}
                  onChange={(e) => setObstructiveDisease(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 ${
                    errors.obstructiveDisease 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                >
                  <option value="">لطفا بیماری انسدادی را انتخاب کنید</option>
                  <option value="bronchiolitis">برونشیولیت</option>
                  <option value="asthma">آسم</option>
                  <option value="copd">بیماری انسدادی مزمن ریوی (COPD)</option>
                  <option value="bronchiectasis">برونشکتازی</option>
                  <option value="cystic_fibrosis">فیبروز سیستیک</option>
                  <option value="foreign_body_aspiration">آسپیراسیون جسم خارجی</option>
                </select>
                {errors.obstructiveDisease && (
                  <p className="text-red-500 text-xs mt-1">{errors.obstructiveDisease}</p>
                )}
              </div>
            )}

            {/* فیلد بیماری Restrictive*/}
            {lungInvolvement === 'restrictive' && (
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="restrictiveDisease">
                  بیماری Restrictive
                </label>
                <select
                  id="restrictiveDisease"
                  value={restrictiveDisease}
                  onChange={(e) => setRestrictiveDisease(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 ${
                    errors.restrictiveDisease 
                      ? 'border-red-500 focus:ring-red-200' 
                      : 'border-gray-300 focus:ring-blue-200'
                  }`}
                >
                  <option value="">لطفا بیماری Restrictive را انتخاب کنید</option>
                  <option value="pneumonia">پنومونی</option>
                  <option value="ards">سندرم زجر تنفسی حاد (ARDS)</option>
                  <option value="pulmonary_edema">ادم ریوی</option>
                  <option value="pulmonary_fibrosis">فیبروز ریوی</option>
                  <option value="pleural_effusion">افیوژن پلور</option>
                  <option value="pneumothorax">پنوموتوراکس</option>
                  <option value="atelectasis">آتلکتازی</option>
                </select>
                {errors.restrictiveDisease && (
                  <p className="text-red-500 text-xs mt-1">{errors.restrictiveDisease}</p>
                )}
              </div>
            )}
          </div>

          {/* دکمه‌های انتخاب نوع ونتیلاتور */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-3">
              انتخاب نوع ونتیلاتور
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleVentilatorSelect('pressure-controlled')}
                className="bg-pink-400 hover:bg-pink-600 text-white py-4 px-4 rounded-lg font-bold transition-colors text-center"
              >
                نوزادان
              </button>
              <button
                type="button"
                onClick={() => handleVentilatorSelect('volume-controlled')}
                className="bg-blue-400 hover:bg-blue-600 text-white py-4 px-4 rounded-lg font-bold transition-colors text-center"
              >
                کودکان
              </button>
            </div>
          </div>

          {/* دکمه پاک کردن */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              پاک کردن فرم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}