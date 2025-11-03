import React, { useState } from 'react';

const Tooltip = ({ 
  children, 
  text, 
  position = "top",
  bgColor = "bg-red-600",
  textColor = "text-white"
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // استایل‌های مختلف برای موقعیت‌های مختلف
  const positionStyles = {
    top: {
      container: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      arrow: "absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"
    },
    bottom: {
      container: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      arrow: "absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-red-600"
    },
    left: {
      container: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      arrow: "absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-red-600"
    },
    right: {
      container: "left-full top-1/2 transform -translate-y-1/2 ml-2",
      arrow: "absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-red-600"
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-block"
      >
        {children}
      </div>
      {showTooltip && (
        <div className={`absolute z-50 ${positionStyles[position].container}`}>
          <div className={`${bgColor} ${textColor} text-sm font-bold py-1 px-3 rounded-lg shadow-lg whitespace-nowrap`}>
            {text}
            <div className={positionStyles[position].arrow}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;