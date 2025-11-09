export const pediatricVentilatorModes = {
  SIMV: {
    name: "SIMV",
    description: "تهویه متناوب اجباری هماهنگ - مناسب کودکان",
    parameters: (weight, isInfant = false) => [
      {
        key: "tidalVolume",
        label: "حجم جاری",
        unit: "ml",
        min: isInfant ? weight * 5 : weight * 6,
        max: isInfant ? weight * 8 : weight * 10,
        step: isInfant ? 0.5 : 1,
        infantRange: "6-8 ml/kg",
        pediatricRange: "6-8 ml/kg"
      },
      {
        key: "respiratoryRate",
        label: "میزان تنفس",
        unit: "/min",
        min: isInfant ? 20 : 15,
        max: isInfant ? 40 : 80,
        step: 1,
        infantRange: "25-40/min",
        pediatricRange: "15-80/min"
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
        min: isInfant ? 3 : 4,
        max: isInfant ? 8 : 15,
        step: 0.5,
        infantRange: "3-5 cmH₂O",
        pediatricRange: "4-8 cmH₂O"
      },
      {
        key: "ieRatio",
        label: "نسبت I:E",
        type: "select",
        options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3"],
        default: "1:2"
      },
      {
        key: "pressureSupport",
        label: "حمایت فشاری",
        unit: "cmH₂O",
        min: isInfant ? 8 : 10,
        max: isInfant ? 20 : 25,
        step: 1,
        infantRange: "8-15 cmH₂O",
        pediatricRange: "10-20 cmH₂O"
      },
      {
        key: "flowRate",
        label: "Flow Rate",
        unit: "L/min",
        min: isInfant ? 8 : 15,
        max: isInfant ? 20 : 40,
        step: 1,
        infantRange: "8-15 L/min",
        pediatricRange: "15-30 L/min"
      },
      {
        key: "ti",
        label: "Ti",
        unit: "sec",
        min: isInfant ? 0.3 : 0.5,
        max: isInfant ? 0.8 : 1.5,
        step: 0.1,
        infantRange: "0.3-0.6 sec",
        pediatricRange: "0.5-1.0 sec"
      },
      {
        key: "trigger",
        label: "Trigger",
        unit: "cmH₂O",
        min: -2,
        max: 2,
        step: 0.5,
        default: -1
      },
    ],
    clinicalIndications: [
      "بیماران با تنفس خودبخودی ناکافی",
      "فرآیند weaning از ونتیلاتور",
      "بیماران با وضعیت نوروماسکولار پایدار"
    ],
    advantages: [
      "کاهش کار تنفسی",
      "حفظ عملکرد عضلات تنفسی",
      "پیشگیری از آتروفی دیافراگم"
    ]
  },

  PRVC: {
    name: "PRVC",
    description: "حجم جاری تنظیم‌شده با فشار - ایمن برای کودکان",
    parameters: (weight, isInfant = false) => [
      {
        key: "tidalVolume",
        label: "حجم جاری",
        unit: "ml",
        min: isInfant ? weight * 5 : weight * 6,
        max: isInfant ? weight * 8 : weight * 10,
        step: 0.5,
        infantRange: "6-8 ml/kg",
        pediatricRange: "6-8 ml/kg"
      },
      {
        key: "respiratoryRate",
        label: "میزان تنفس",
        unit: "/min",
        min: isInfant ? 20 : 15,
        max: isInfant ? 40 : 35,
        step: 1,
        infantRange: "25-40/min",
        pediatricRange: "15-35/min"
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
        min: isInfant ? 3 : 4,
        max: isInfant ? 8 : 10,
        step: 0.5,
        infantRange: "3-5 cmH₂O",
        pediatricRange: "4-8 cmH₂O"
      },
      {
        key: "ieRatio",
        label: "نسبت I:E",
        type: "select",
        options: ["1:1", "1:1.5", "1:2", "1:2.5", "1:3"],
        default: "1:2"
      },
      {
        key: "pip",
        label: "PIP",
        unit: "cmH₂O",
        min: isInfant ? 15 : 18,
        max: isInfant ? 30 : 35,
        step: 1,
        infantRange: "15-25 cmH₂O",
        pediatricRange: "18-30 cmH₂O"
      },
      {
        key: "ti",
        label: "Ti",
        unit: "sec",
        min: isInfant ? 0.3 : 0.5,
        max: isInfant ? 0.8 : 1.5,
        step: 0.1,
        infantRange: "0.3-0.6 sec",
        pediatricRange: "0.5-1.0 sec"
      },
    ],
    clinicalIndications: [
      "ARDS و بیماری‌های ریوی محدودکننده",
      "بیماران با compliance متغیر ریوی",
      "کاهش خطر باروتروما"
    ],
    advantages: [
      "حجم جاری ثابت با کمترین فشار لازم",
      "سازگاری با تغییرات compliance ریوی",
      "کاهش خطر آسیب ریوی"
    ]
  },

  CPAP: {
    name: "CPAP",
    description: "فشار مثبت مداوم راه هوایی - برای تنفس خودبخودی",
    parameters: (weight, isInfant = false) => [
      {
        key: "cpap",
        label: "سطح CPAP",
        unit: "cmH₂O",
        min: isInfant ? 4 : 5,
        max: isInfant ? 8 : 10,
        step: 0.5,
        infantRange: "4-6 cmH₂O",
        pediatricRange: "5-8 cmH₂O"
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
        min: isInfant ? 8 : 10,
        max: isInfant ? 15 : 20,
        step: 1,
        infantRange: "8-12 cmH₂O",
        pediatricRange: "10-15 cmH₂O"
      },
    ],
    clinicalIndications: [
      "آپنه خواب و اختلالات راه هوایی",
      "بیماران با تنفس خودبخودی کافی"
    ],
    advantages: [
      "بهبود oxygenation",
      "کاهش کار تنفسی",
      "حفظ عملکرد عضلات تنفسی",
      "ساده برای مدیریت"
    ],
    importantNotes: [
      "حتماً back up فعال باشد",
      "مانیتورینگ مداوم سطح هوشیاری",
      "بررسی منظم فشار راه هوایی"
    ]
  },

};

// تابع کمکی برای گرفتن پارامترهای مد بر اساس وزن و سن
export const getModeParameters = (mode, weight, isInfant = false) => {
  const modeConfig = pediatricVentilatorModes[mode];
  if (!modeConfig) return [];
  
  return typeof modeConfig.parameters === 'function' 
    ? modeConfig.parameters(weight, isInfant)
    : modeConfig.parameters;
};

// تابع برای گرفتن اطلاعات کامل مد
export const getModeInfo = (mode) => {
  return pediatricVentilatorModes[mode] || null;
};

// لیست مدهای قابل استفاده بر اساس سن
export const getAvailableModes = (isInfant = false) => {
  const allModes = Object.keys(pediatricVentilatorModes);
  
  if (isInfant) {
    // برای نوزادان همه مدها قابل استفاده هستند
    return allModes;
  }
  
  // برای کودکان همه مدها قابل استفاده هستند
  return allModes;
};