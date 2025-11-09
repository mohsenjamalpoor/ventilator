import React from "react";

const ModeSelectionModal = ({
  show,
  onClose,
  modes,
  selectedMode,
  onModeChange,
  isInfant = false
}) => {
  if (!show) return null;

  
  const modeEvidence = {
    SIMV: {
      description: "مناسب برای weaning تدریجی ",
      details: "کاهش پیشرونده تعداد تنفس مکانیکی، حفظ فشار مثبت انتهای بازدمی",
      indication: "بیماران با نقص تنفسی خفیف تا متوسط، مرحله weaning",
      note: "ممکن است کار تنفسی افزایش یابد "
    },
    CPAP: {
      description: "حفظ فشار مثبت مداوم در راه هوایی ",
      details: "برای بیماران با تنفس خودبخودی کافی اما نیازمند حمایت فشار",
      indication: "ادم حاد ریه، آپنه خواب، هیپوکسمی خفیف",
      note: "Back up ventilation ضروری در موارد ناپایداری"
    },
    PRVC: {
      description: "ترکیب مزایای حجمی و فشاری ",
      details: "تحویل حجم جاری ثابت با کمترین فشار دمی ممکن",
      indication: "بیماران با compliance متغیر ریه، ARDS",
      note: "کاهش خطر باروتروما "
    }
   
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* هدر مودال */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">انتخاب مد ونتیلاتور</h2>
              <p className="text-blue-100 mt-2">
            
                {isInfant && " (تنظیمات ویژه نوزادان)"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* محتوای مودال */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(modes).map(([key, mode]) => (
              <div
                key={key}
                className={`text-right p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMode === key
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-800 shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                }`}
                onClick={() => onModeChange(key)}
              >
                {/* نشانگر مد فعال */}
                {selectedMode === key && (
                  <div className="flex justify-start mb-2">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      فعال
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-3">
                    <div className="font-bold text-lg mb-1">{mode.name}</div>
                    <div className="text-sm text-gray-600 leading-relaxed mb-2">
                      {mode.description}
                    </div>
                    
                    {/* اطلاعات مبتنی بر شواهد */}
                    <div className="bg-gray-50 p-3 rounded-lg mt-2">
                      <div className="text-xs text-blue-600 font-semibold mb-1">
                        {modeEvidence[key]?.description}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {modeEvidence[key]?.details}
                      </div>
                      <div className="text-xs text-green-600 mt-2">
                        <strong>اندیکاسیون:</strong> {modeEvidence[key]?.indication}
                      </div>
                    </div>
                  </div>
                </div>

                {/* نکات مهم و هشدارها */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-orange-600 font-semibold">
                    {modeEvidence[key]?.note}
                  </div>
                  
                  {/* هشدارهای ویژه */}
                  {(key === "CPAP" || key === "PSV") && (
                    <div className="text-xs text-red-500 font-semibold mt-1 flex items-center">
                   
                      {key === "CPAP" 
                        ? "  " 
                        : "نیاز به درایو تنفسی adequate"}
                    </div>
                  )}
                  
                
                </div>
              </div>
            ))}
          </div>
        </div>

     

        {/* فوتر مودال */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-gray-600">
              مد فعلی:{" "}
              <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {modes[selectedMode]?.name}
              </span>
              <span className="text-sm text-gray-500 mr-3">
                - {modeEvidence[selectedMode]?.description}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;