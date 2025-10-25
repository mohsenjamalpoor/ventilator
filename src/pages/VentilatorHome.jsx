import React, { useState } from 'react'
import InfantVentilator from '../components/InfantVentilator'
import PediatricVentilator from '../components/PediatricVentilator'

export default function VentilatorHome() {
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [ageUnit, setAgeUnit] = useState('months')
  const [disease, setDisease] = useState('')  
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
    
    if (!disease.trim()) {
      newErrors.disease = 'لطفا بیماری بیمار را انتخاب کنید'
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
    setDisease('') 
    setVentilatorType(null)
    setErrors({})
  }

  // اگر نوع ونتیلاتور انتخاب شد، صفحه مربوطه را نمایش بده
  if (ventilatorType === 'pressure-controlled') {
    return <InfantVentilator 
      weight={weight} 
      age={age} 
      ageUnit={ageUnit} 
      disease={disease} 
      onBack={handleReset} 
    />
  }
  
  if (ventilatorType === 'volume-controlled') {
    return <PediatricVentilator 
      weight={weight} 
      age={age} 
      ageUnit={ageUnit} 
      disease={disease} 
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

          {/* فیلد بیماری */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="disease">
              بیماری بیمار
            </label>
            <select
              id="disease"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg text-left focus:outline-none focus:ring-2 ${
                errors.disease 
                  ? 'border-red-500 focus:ring-red-200' 
                  : 'border-gray-300 focus:ring-blue-200'
              }`}
            >
              <option value="">لطفا بیماری را انتخاب کنید</option>
              <option value="ARDS">سندرم زجر تنفسی حاد (ARDS)</option>
              <option value="Asthma">آسم</option>
              <option value="Bronchiolitis">برونشیولیت</option>
              <option value="Pneumonia">پنومونی</option>
              <option value="COPD">بیماری انسدادی مزمن ریوی (COPD)</option>
              <option value="RDS">سندرم زجر تنفسی نوزادان (RDS)</option>
              <option value="LOC">کاهش سطح هوشیاری</option>
              <option value="Other">سایر بیماری‌ها</option>
            </select>
            {errors.disease && (
              <p className="text-red-500 text-xs mt-1">{errors.disease}</p>
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
                className="bg-rose-600 hover:bg-rose-700 text-white py-4 px-4 rounded-lg font-bold transition-colors text-center"
              >
                فشار ثابت
                <div className="text-xs mt-1 opacity-90">(مخصوص نوزادان)</div>
              </button>
              <button
                type="button"
                onClick={() => handleVentilatorSelect('volume-controlled')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-4 rounded-lg font-bold transition-colors text-center"
              >
                حجم ثابت
                <div className="text-xs mt-1 opacity-90">(مخصوص کودکان)</div>
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