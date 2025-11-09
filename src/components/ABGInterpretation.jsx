
import React, { useState, useEffect } from "react";
import { MdCheckCircleOutline } from "react-icons/md";

// کامپوننت نمایش محدوده نرمال برای کودکان
const NormalRangeIndicator = ({
  value,
  normalMin,
  normalMax,
  unit,
  ageGroup = "کودک",
}) => {
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
      {status} (نرمال {ageGroup}: {normalMin}-{normalMax} {unit})
    </div>
  );
};

// کامپوننت اصلی تفسیر ABG
const ABGInterpretation = ({
  weight,
  selectedMode,
  currentSettings,
  settingsBeforeABG,
  onSettingsUpdate,
  onSettingsBeforeUpdate,
  resetTrigger,
}) => {
  // state های مربوط به ABG
  const [abgValues, setAbgValues] = useState({
    pH: "",
    pCO2: "",
    pO2: "",
    HCO3: "",
    BE: "", // Base Excess اضافه شد
  });
  const [abgInterpretation, setAbgInterpretation] = useState({
    primary: "",
    secondary: "",
    oxygenation: "",
    compensation: "",
    chronicity: "",
    clinicalImplications: "", // پیامدهای بالینی اضافه شد
    management: "", // مدیریت اضافه شد
  });
  const [abgErrors, setAbgErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState([]);

  // اثر برای بازنشانی state های داخلی وقتی تنظیمات اصلی بازنشانی می‌شوند
  useEffect(() => {
    if (resetTrigger > 0) {
      resetABG();
    }
  }, [resetTrigger]);

  // محاسبه تهویه دقیقه‌ای
  const calculateMvent = (tv, rr) => {
    return ((parseFloat(tv) * parseFloat(rr)) / 1000).toFixed(2);
  };

  // اعتبارسنجی مقادیر ABG برای کودکان
  const validateABG = () => {
    const { pH, pCO2, pO2, HCO3, BE } = abgValues;
    const errors = {};
    let isValid = true;

    if (!pH) {
      errors.pH = "مقدار pH الزامی است";
      isValid = false;
    } else {
      const pHNum = parseFloat(pH);
      if (pHNum < 6.8 || pHNum > 7.8) {
        errors.pH = "مقدار pH باید بین 6.8 تا 7.8 باشد";
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
      if (pCO2Num < 20 || pCO2Num > 150) {
        errors.pCO2 = "مقدار pCO2 باید بین 20 تا 150 mmHg باشد";
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
      if (pO2Num < 30 || pO2Num > 600) {
        errors.pO2 = "مقدار pO2 باید بین 30 تا 600 mmHg باشد";
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
      if (HCO3Num < 1 || HCO3Num > 50) {
        errors.HCO3 = "مقدار HCO3 باید بین 1 تا 50 mEq/L باشد";
        isValid = false;
      } else if (HCO3Num < 22 || HCO3Num > 26) {
        errors.HCO3 = "مقدار HCO3 خارج از محدوده نرمال است";
      }
    }

    // اعتبارسنجی اختیاری برای Base Excess
    if (BE) {
      const BENum = parseFloat(BE);
      if (BENum < -30 || BENum > 30) {
        errors.BE = "مقدار BE باید بین -30 تا +30 باشد";
      }
    }

    setAbgErrors(errors);
    setShowValidation(true);
    return isValid;
  };

  // تشخیص حاد یا مزمن بودن اختلال تنفسی بر اساس نلسون
  const determineChronicity = (pH, pCO2, HCO3) => {
    const pCO2Num = parseFloat(pCO2);
    const HCO3Num = parseFloat(HCO3);

    // اسیدوز تنفسی
    if (pCO2Num > 45) {
      // فرمول نلسون برای اسیدوز تنفسی حاد
      const expectedHCO3Acute = 24 + 0.1 * (pCO2Num - 40);
      // فرمول نلسون برای اسیدوز تنفسی مزمن
      const expectedHCO3Chronic = 24 + 0.3 * (pCO2Num - 40);

      if (Math.abs(HCO3Num - expectedHCO3Acute) <= 2) {
        return { status: "حاد", expectedHCO3: expectedHCO3Acute };
      } else if (Math.abs(HCO3Num - expectedHCO3Chronic) <= 2) {
        return { status: "مزمن", expectedHCO3: expectedHCO3Chronic };
      } else if (HCO3Num > expectedHCO3Chronic) {
        return {
          status: "مختلط (اسیدوز تنفسی + آلکالوز متابولیک)",
          expectedHCO3: expectedHCO3Chronic,
        };
      } else {
        return {
          status: "مختلط (اسیدوز تنفسی + اسیدوز متابولیک)",
          expectedHCO3: expectedHCO3Acute,
        };
      }
    }

    // آلکالوز تنفسی
    if (pCO2Num < 35) {
      const expectedHCO3Acute = 24 - 0.2 * (40 - pCO2Num);
      const expectedHCO3Chronic = 24 - 0.4 * (40 - pCO2Num);

      if (Math.abs(HCO3Num - expectedHCO3Acute) <= 2) {
        return { status: "حاد", expectedHCO3: expectedHCO3Acute };
      } else if (Math.abs(HCO3Num - expectedHCO3Chronic) <= 2) {
        return { status: "مزمن", expectedHCO3: expectedHCO3Chronic };
      } else if (HCO3Num < expectedHCO3Chronic) {
        return {
          status: "مختلط (آلکالوز تنفسی + اسیدوز متابولیک)",
          expectedHCO3: expectedHCO3Chronic,
        };
      } else {
        return {
          status: "مختلط (آلکالوز تنفسی + آلکالوز متابولیک)",
          expectedHCO3: expectedHCO3Acute,
        };
      }
    }

    return { status: "نامشخص", expectedHCO3: 24 };
  };

  // تفسیر Base Excess بر اساس نلسون
  const interpretBaseExcess = (BE) => {
    if (!BE) return "";

    const BENum = parseFloat(BE);
    if (BENum < -5) return "اسیدوز متابولیک (BE منفی)";
    if (BENum > +5) return "آلکالوز متابولیک (BE مثبت)";
    return "BE نرمال";
  };

  // تفسیر دقیق ABG برای کودکان بر اساس رفرنس‌های نلسون و اپ‌تودیت
  const interpretABG = () => {
    if (!validateABG()) {
      return;
    }

    // ذخیره تنظیمات فعلی قبل از اعمال تغییرات
    if (onSettingsBeforeUpdate) {
      onSettingsBeforeUpdate(currentSettings);
    }

    const { pH, pCO2, pO2, HCO3, BE } = abgValues;
    const pHNum = parseFloat(pH);
    const pCO2Num = parseFloat(pCO2);
    const pO2Num = parseFloat(pO2);
    const HCO3Num = parseFloat(HCO3);

    let interpretation = {
      primary: "",
      secondary: "",
      oxygenation: "",
      compensation: "",
      chronicity: "",
      clinicalImplications: "",
      management: "",
    };

    let newSettings = { ...currentSettings };

    // تفسیر اصلی بر اساس الگوریتم نلسون
    const isAcidemia = pHNum < 7.35;
    const isAlkalemia = pHNum > 7.45;

    // تشخیص اختلال اولیه
    if (isAcidemia) {
      if (pCO2Num > 45) {
        interpretation.primary = "اسیدوز تنفسی اولیه";
        const chronicityInfo = determineChronicity(pH, pCO2, HCO3);
        interpretation.chronicity = chronicityInfo.status;

        // تنظیمات ونتیلاتور برای اسیدوز تنفسی
        if (chronicityInfo.status.includes("حاد")) {
          interpretation.management =
            "افزایش تهویه دقیقه‌ای - بررسی علل انسداد راه هوایی";
          newSettings.respiratoryRate = Math.min(
            40,
            parseInt(currentSettings.respiratoryRate) + 4
          );
          if (selectedMode === "SIMV" || selectedMode === "PRVC") {
            newSettings.tidalVolume = Math.min(
              weight * 10,
              parseFloat(currentSettings.tidalVolume) + 3
            ).toFixed(1);
          }
        } else if (chronicityInfo.status.includes("مزمن")) {
          interpretation.management =
            "تهویه حمایتی - پایش منظم - اجازه جبران متابولیک";
          newSettings.respiratoryRate = Math.min(
            35,
            parseInt(currentSettings.respiratoryRate) + 2
          );
        }

        interpretation.clinicalImplications =
          "علل شایع: آسم، برونشیولیت، پنومونی، آسپیراسیون، اختلالات CNS";
      } else if (HCO3Num < 22) {
        interpretation.primary = "اسیدوز متابولیک اولیه";

        // تفسیر آنیون گپ بر اساس نلسون
        const anionGap = 140 - (HCO3Num + 104); // Na - (HCO3 + Cl)
        let gapType = "";

        if (anionGap > 16) {
          gapType = "اسیدوز متابولیک با آنیون گپ بالا";
          interpretation.clinicalImplications =
            "علل: کتواسیدوز دیابتی، اورمی، لاکتیک اسیدوز، مسمومیت";
        } else if (anionGap <= 16) {
          gapType = "اسیدوز متابولیک با آنیون گپ نرمال";
          interpretation.clinicalImplications =
            "علل: اسهال، RTA، هیپرکلرمی، داروها";
        }

        interpretation.secondary = ` (${gapType} - آنیون گپ: ${anionGap.toFixed(
          1
        )} mEq/L)`;

        // جبران تنفسی مورد انتظار (فرمول وینتر نلسون)
        const expectedPCO2 = 1.5 * HCO3Num + 8;
        if (Math.abs(pCO2Num - expectedPCO2) <= 2) {
          interpretation.compensation = `جبران تنفسی مناسب (pCO₂ مورد انتظار: ${expectedPCO2.toFixed(
            1
          )} mmHg)`;
        } else if (pCO2Num > expectedPCO2) {
          interpretation.compensation = `اسیدوز تنفسی اضافی (pCO₂ بالاتر از حد مورد انتظار)`;
        } else {
          interpretation.compensation = `آلکالوز تنفسی اضافی (pCO₂ پایین‌تر از حد مورد انتظار)`;
        }

        interpretation.management =
          "اصلاح علت زمینه‌ای - بررسی الکترولیت‌ها - بی‌کربنات فقط در pH < 7.1";

        // تنظیمات برای اسیدوز متابولیک
        newSettings.tidalVolume = Math.min(
          weight * 10,
          parseFloat(currentSettings.tidalVolume) + 2
        ).toFixed(1);
      }
    } else if (isAlkalemia) {
      if (pCO2Num < 35) {
        interpretation.primary = "آلکالوز تنفسی اولیه";
        const chronicityInfo = determineChronicity(pH, pCO2, HCO3);
        interpretation.chronicity = chronicityInfo.status;

        interpretation.clinicalImplications =
          "علل شایع: اضطراب، درد، تب، سپسیس، CNS disorders";

        // تنظیمات ونتیلاتور برای آلکالوز تنفسی
        if (chronicityInfo.status.includes("حاد")) {
          interpretation.management =
            "کاهش تهویه - درمان علت زمینه‌ای - آرام‌بخشی";
          newSettings.respiratoryRate = Math.max(
            12,
            parseInt(currentSettings.respiratoryRate) - 4
          );
          if (selectedMode === "SIMV" || selectedMode === "PRVC") {
            newSettings.tidalVolume = Math.max(
              weight * 5,
              parseFloat(currentSettings.tidalVolume) - 3
            ).toFixed(1);
          }
        }
      } else if (HCO3Num > 26) {
        interpretation.primary = "آلکالوز متابولیک اولیه";

        interpretation.clinicalImplications =
          "علل شایع: استفراغ، دیورتیک‌ها، هیپرآلدوسترونیسم، حجم اضافه";

        // جبران تنفسی مورد انتظار
        const expectedPCO2 = 0.7 * HCO3Num + 20;
        if (Math.abs(pCO2Num - expectedPCO2) <= 3) {
          interpretation.compensation = `جبران تنفسی مناسب (pCO₂ مورد انتظار: ${expectedPCO2.toFixed(
            1
          )} mmHg)`;
        } else if (pCO2Num < expectedPCO2) {
          interpretation.compensation = `آلکالوز تنفسی اضافی (pCO₂ پایین‌تر از حد مورد انتظار)`;
        } else {
          interpretation.compensation = `اسیدوز تنفسی اضافی (pCO₂ بالاتر از حد مورد انتظار)`;
        }

        interpretation.management =
          "اصلاح کم‌آبی - جایگزینی پتاسیم و کلر - بررسی دیورتیک‌ها";

        newSettings.tidalVolume = Math.max(
          weight * 5,
          parseFloat(currentSettings.tidalVolume) - 2
        ).toFixed(1);
      }
    } else {
      interpretation.primary = "ABG نرمال از نظر اسید-باز";
    }

    // تشخیص اختلالات مختلط
    if (pHNum >= 7.35 && pHNum <= 7.45) {
      if (pCO2Num > 45 && HCO3Num > 26) {
        interpretation.primary =
          "اختلال مختلط: آلکالوز متابولیک + اسیدوز تنفسی";
        interpretation.clinicalImplications =
          "معمولاً در بیماری‌های مزمن ریوی دیده می‌شود";
      } else if (pCO2Num < 35 && HCO3Num < 22) {
        interpretation.primary =
          "اختلال مختلط: اسیدوز متابولیک + آلکالوز تنفسی";
        interpretation.clinicalImplications =
          "معمولاً در سپسیس، مسمومیت‌ها و بیماری‌های کبدی دیده می‌شود";
      }
    }

    // تفسیر Base Excess
    if (BE) {
      const BEInterpretation = interpretBaseExcess(BE);
      if (BEInterpretation && !interpretation.secondary) {
        interpretation.secondary = ` (${BEInterpretation})`;
      }
    }

    // ارزیابی اکسیژناسیون بر اساس نلسون
    const PaO2_FiO2_Ratio = pO2Num / (parseInt(currentSettings.fio2) / 100);

    if (pO2Num < 60) {
      interpretation.oxygenation = `هیپوکسمی شدید (PaO₂/FiO₂: ${PaO2_FiO2_Ratio.toFixed(
        1
      )} - احتمال ARDS)`;
      interpretation.management +=
        " - پشتیبانی تهویه تهاجمی - مانیتورینگ دقیق اکسیژناسیون";
      newSettings.fio2 = Math.min(100, parseInt(currentSettings.fio2) + 30);
      newSettings.peep = Math.min(12, parseInt(currentSettings.peep) + 3);
    } else if (pO2Num < 80) {
      interpretation.oxygenation = `هیپوکسمی متوسط (PaO₂/FiO₂: ${PaO2_FiO2_Ratio.toFixed(
        1
      )})`;
      newSettings.fio2 = Math.min(80, parseInt(currentSettings.fio2) + 20);
      newSettings.peep = Math.min(10, parseInt(currentSettings.peep) + 2);
    } else if (pO2Num >= 80 && pO2Num < 100) {
      interpretation.oxygenation = `اکسیژناسیون قابل قبول (PaO₂/FiO₂: ${PaO2_FiO2_Ratio.toFixed(
        1
      )})`;
      if (parseInt(currentSettings.fio2) > 40) {
        newSettings.fio2 = Math.max(30, parseInt(currentSettings.fio2) - 10);
      }
    } else {
      interpretation.oxygenation = `اکسیژناسیون خوب (PaO₂/FiO₂: ${PaO2_FiO2_Ratio.toFixed(
        1
      )})`;
      if (parseInt(currentSettings.fio2) > 30) {
        newSettings.fio2 = Math.max(21, parseInt(currentSettings.fio2) - 15);
      }
    }

    // محاسبه مقادیر وابسته
    newSettings.mvent = calculateMvent(
      newSettings.tidalVolume,
      newSettings.respiratoryRate
    );
    newSettings.vti = newSettings.tidalVolume;

    setAbgInterpretation(interpretation);

    // محاسبه تغییرات اعمال شده
    calculateAppliedChanges(currentSettings, newSettings);

    // ارسال تنظیمات جدید به کامپوننت والد
    if (onSettingsUpdate) {
      onSettingsUpdate(newSettings);
    }
  };

  // محاسبه تغییرات اعمال شده
  const calculateAppliedChanges = (beforeSettings, afterSettings) => {
    const changes = [];

    if (beforeSettings && afterSettings) {
      if (
        parseInt(beforeSettings.respiratoryRate) !==
        parseInt(afterSettings.respiratoryRate)
      ) {
        changes.push({
          label: "RR",
          from: beforeSettings.respiratoryRate,
          to: afterSettings.respiratoryRate,
          unit: "/min",
        });
      }

      if (
        parseFloat(beforeSettings.tidalVolume) !==
        parseFloat(afterSettings.tidalVolume)
      ) {
        changes.push({
          label: "TV",
          from: beforeSettings.tidalVolume,
          to: afterSettings.tidalVolume,
          unit: "ml",
        });
      }

      if (parseInt(beforeSettings.fio2) !== parseInt(afterSettings.fio2)) {
        changes.push({
          label: "FiO₂",
          from: beforeSettings.fio2,
          to: afterSettings.fio2,
          unit: "%",
        });
      }

      if (parseInt(beforeSettings.peep) !== parseInt(afterSettings.peep)) {
        changes.push({
          label: "PEEP",
          from: beforeSettings.peep,
          to: afterSettings.peep,
          unit: "cmH₂O",
        });
      }

      if (
        parseFloat(beforeSettings.mvent) !== parseFloat(afterSettings.mvent)
      ) {
        changes.push({
          label: "MVent",
          from: beforeSettings.mvent,
          to: afterSettings.mvent,
          unit: "L/min",
        });
      }
    }

    setAppliedChanges(changes);
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

  const resetABG = () => {
    setAbgValues({
      pH: "",
      pCO2: "",
      pO2: "",
      HCO3: "",
      BE: "",
    });
    setAbgInterpretation({
      primary: "",
      secondary: "",
      oxygenation: "",
      compensation: "",
      chronicity: "",
      clinicalImplications: "",
      management: "",
    });
    setAbgErrors({});
    setShowValidation(false);
    setAppliedChanges([]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          تفسیر  ABG کودکان
        </h2>
        <button
          onClick={resetABG}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          پاک کردن
        </button>
      </div>

      {/* فرم ورود ABG */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            pH
          </label>
          <input
            type="number"
            step="0.01"
            value={abgValues.pH}
            onChange={(e) => handleAbgChange("pH", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pH ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="7.40"
            dir="ltr"
          />
          {abgErrors.pH && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pCO2 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="40"
            dir="ltr"
          />
          {abgErrors.pCO2 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.pO2 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="80"
            dir="ltr"
          />
          {abgErrors.pO2 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.HCO3 ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="24"
            dir="ltr"
          />
          {abgErrors.HCO3 && (
            <p className="text-red-500 text-xs mt-1 text-right">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base Excess (mEq/L)
          </label>
          <input
            type="number"
            step="0.1"
            value={abgValues.BE}
            onChange={(e) => handleAbgChange("BE", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-right direction-ltr ${
              abgErrors.BE ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            placeholder="0"
            dir="ltr"
          />
          {abgErrors.BE && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {abgErrors.BE}
            </p>
          )}
          {showValidation && abgValues.BE && (
            <NormalRangeIndicator
              value={abgValues.BE}
              normalMin={-2}
              normalMax={2}
              unit="mEq/L"
            />
          )}
        </div>
      </div>

      <button
        onClick={interpretABG}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors mb-6 flex items-center justify-center gap-2"
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        تفسیر پیشرفته ABG و اعمال تنظیمات
      </button>

      {/* نتایج تفسیر */}
      {abgInterpretation.primary && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              تفسیر کامل ABG :
            </h3>
            <div className="space-y-2 text-blue-700">
              <p className="font-semibold text-lg">
                {" "}
                {abgInterpretation.primary}
                {abgInterpretation.secondary}
              </p>
              {abgInterpretation.chronicity && (
                <p className="font-medium">
                   <strong>سیر زمانی:</strong> {abgInterpretation.chronicity}
                </p>
              )}
              {abgInterpretation.compensation && (
                <p className="font-medium">
                   <strong>وضعیت جبرانی:</strong>{" "}
                  {abgInterpretation.compensation}
                </p>
              )}
              {abgInterpretation.oxygenation && (
                <p className="font-medium">
                   <strong>اکسیژناسیون:</strong>{" "}
                  {abgInterpretation.oxygenation}
                </p>
              )}
              {abgInterpretation.clinicalImplications && (
                <p className="font-medium">
                   <strong>پیامدهای بالینی:</strong>{" "}
                  {abgInterpretation.clinicalImplications}
                </p>
              )}
              {abgInterpretation.management && (
                <p className="font-medium">
                   <strong>پیشنهادات مدیریتی:</strong>{" "}
                  {abgInterpretation.management}
                </p>
              )}
            </div>
          </div>

          {appliedChanges.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <MdCheckCircleOutline size={20} />
                تغییرات اعمال شده در تنظیمات ونتیلاتور:
              </h3>
              <div className="space-y-2">
                {appliedChanges.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white rounded-lg p-2"
                  >
                    <span className="text-green-700 font-medium text-right flex-1">
                      {change.label}:
                    </span>
                    <span
                      className="text-green-900 font-bold direction-ltr text-left flex-1"
                      dir="ltr"
                    >
                      {change.from} {change.unit} → {change.to} {change.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* راهنمای تفسیر پیشرفته */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              راهنمای تفسیر:
            </h3>
            <div className="text-purple-700 text-sm space-y-2 text-right">
              <p className="mt-2">
                <strong>فرمول‌های جبرانی :</strong>
              </p>
              <p>
                • <strong>اسیدوز متابولیک:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                pCO₂ مورد انتظار = (1.5 × HCO₃) + 8 ± 2
              </div>
              <p>
                • <strong>آلکالوز متابولیک:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                pCO₂ مورد انتظار = (0.7 × HCO₃) + 20 ± 3
              </div>
              <p>
                • <strong>اسیدوز تنفسی حاد:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                HCO₃ افزایش 0.1 mEq/L به ازای هر mmHg pCO₂
              </div>
              <p>
                • <strong>اسیدوز تنفسی مزمن:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                HCO₃ افزایش 0.3-0.4 mEq/L به ازای هر mmHg pCO₂
              </div>
              <p>
                • <strong>آلکالوز تنفسی حاد:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                HCO₃ کاهش 0.2 mEq/L به ازای هر mmHg pCO₂
              </div>
              <p>
                • <strong>آلکالوز تنفسی مزمن:</strong>
              </p>
              <div dir="ltr" className="text-left bg-gray-100 p-2 rounded mt-1">
                HCO₃ کاهش 0.4 mEq/L به ازای هر mmHg pCO₂
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ABGInterpretation;
