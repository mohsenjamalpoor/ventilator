// آبجکت تنظیمات اولیه برای ونتیلاتور کودکان
export const initialSettingsConfig = {
  baseSettings: {
    tidalVolume: (weight) => (weight * 7).toFixed(1),
    respiratoryRate: 20,
    fio2: 40,
    peep: 5,
    ieRatio: "1:2",
    flowRate: 25,
    mode: "SIMV",
    pressureSupport: 12,
    cpap: 6,
    pip: 20,
    ti: 1.0,
    trigger: 5,
    vteRatio: 0.85, // نسبت پایه VTe به VTi
  },

  normalLung: {
    reduced_consciousness: {
      mode: "SIMV",
      respiratoryRate: 25,
      tidalVolume: (weight) => (weight * 6).toFixed(1),
      peep: 5,
      pressureSupport: 15,
      vteRatio: 0.88,
    },
    seizure: {
      mode: "PRVC",
      respiratoryRate: 25,
      tidalVolume: (weight) => (weight * 7).toFixed(1),
      peep: 5,
      fio2: 40,
      vteRatio: 0.90,
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
      vteRatio: 0.65, // کاهش شدید به دلیل انسداد
    },
    asthma: {
      mode: "PRVC",
      respiratoryRate: 22,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 6,
      ieRatio: "1:3",
      pip: 25,
      fio2: 55,
      vteRatio: 0.70, // کاهش قابل توجه
    },
    copd: {
      mode: "SIMV",
      respiratoryRate: 18,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 6,
      ieRatio: "1:3",
      pip: 22,
      fio2: 40,
      vteRatio: 0.75, // کاهش متوسط
    },
    foreign_body_aspiration: {
      mode: "PRVC",
      respiratoryRate: 24,
      tidalVolume: (weight) => (weight * 8).toFixed(1),
      peep: 5,
      ieRatio: "1:2",
      pip: 20,
      fio2: 50,
      vteRatio: 0.60, // کاهش شدید
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
      vteRatio: 0.75, // کاهش متوسط
    },
    ards: {
      mode: "PRVC",
      respiratoryRate: 30,
      tidalVolume: (weight) => (weight * 5).toFixed(1),
      peep: 12,
      ieRatio: "1:1",
      pip: 32,
      fio2: 85,
      vteRatio: 0.80, // کاهش مختصر (استراتژی محافظتی)
    },
    pulmonary_edema: {
      mode: "PRVC",
      respiratoryRate: 35,
      tidalVolume: (weight) => (weight * 6).toFixed(1),
      peep: 10,
      ieRatio: "1:1.5",
      pip: 30,
      fio2: 70,
      vteRatio: 0.70, // کاهش قابل توجه
    },
    atelectasis: {
      mode: "SIMV",
      respiratoryRate: 22,
      tidalVolume: (weight) => (weight * 7).toFixed(1),
      peep: 8,
      ieRatio: "1:2",
      pip: 25,
      fio2: 55,
      vteRatio: 0.78, // کاهش مختصر
    },
  },
};

// تابع کمکی برای محاسبه محدوده‌های هشدار
export const calculateAlarmRanges = (currentSettings) => {
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

// تابع برای محاسبه تهویه دقیقه‌ای
export const calculateMvent = (tv, rr) => {
  return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
};

// تابع برای محاسبه VTe بر اساس نوع بیماری
export const calculateVTe = (vti, lungInvolvement, normalLungCondition, obstructiveDisease, restrictiveDisease) => {
  const vtiValue = parseFloat(vti);
  let vteRatio = initialSettingsConfig.baseSettings.vteRatio;
  
  // یافتن نسبت مناسب بر اساس نوع بیماری
  switch (lungInvolvement) {
    case "normal":
      if (normalLungCondition && initialSettingsConfig.normalLung[normalLungCondition]) {
        vteRatio = initialSettingsConfig.normalLung[normalLungCondition].vteRatio || vteRatio;
      }
      break;
      
    case "obstructive":
      if (obstructiveDisease && initialSettingsConfig.obstructiveDiseases[obstructiveDisease]) {
        vteRatio = initialSettingsConfig.obstructiveDiseases[obstructiveDisease].vteRatio || vteRatio;
      }
      break;
      
    case "restrictive":
      if (restrictiveDisease && initialSettingsConfig.restrictiveDiseases[restrictiveDisease]) {
        vteRatio = initialSettingsConfig.restrictiveDiseases[restrictiveDisease].vteRatio || vteRatio;
      }
      break;
      
    default:
      break;
  }
  
  return (vtiValue * vteRatio).toFixed(1);
};

// تابع برای دریافت نام بیماری به فارسی
export const getDiseaseName = (lungInvolvement, normalLungCondition, obstructiveDisease, restrictiveDisease) => {
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

// تابع برای محاسبه تنظیمات اولیه بر اساس نوع بیماری
export const getInitialSettings = (weight, lungInvolvement, normalLungCondition, obstructiveDisease, restrictiveDisease) => {
  const base = initialSettingsConfig.baseSettings;
  
  const baseSettings = {
    ...base,
    tidalVolume: base.tidalVolume(weight),
  };

  let diseaseSettings = {};

  switch (lungInvolvement) {
    case "normal":
      if (normalLungCondition && initialSettingsConfig.normalLung[normalLungCondition]) {
        diseaseSettings = initialSettingsConfig.normalLung[normalLungCondition];
      }
      break;

    case "obstructive":
      if (obstructiveDisease && initialSettingsConfig.obstructiveDiseases[obstructiveDisease]) {
        diseaseSettings = initialSettingsConfig.obstructiveDiseases[obstructiveDisease];
      }
      break;

    case "restrictive":
      if (restrictiveDisease && initialSettingsConfig.restrictiveDiseases[restrictiveDisease]) {
        diseaseSettings = initialSettingsConfig.restrictiveDiseases[restrictiveDisease];
      }
      break;

    default:
      break;
  }

  // محاسبه VTe بر اساس تنظیمات بیماری
  const finalSettings = {
    ...baseSettings,
    ...diseaseSettings,
    tidalVolume: diseaseSettings.tidalVolume ? diseaseSettings.tidalVolume(weight) : baseSettings.tidalVolume,
  };

  // محاسبه VTe نهایی
  finalSettings.vte = calculateVTe(
    finalSettings.tidalVolume,
    lungInvolvement,
    normalLungCondition,
    obstructiveDisease,
    restrictiveDisease
  );

  return finalSettings;
};