import React, { useMemo } from "react";

type ToggleProps = {
  isOn: boolean;
};

export const Toggle: React.FC<ToggleProps> = ({ isOn }) => {
  const classNames = useMemo(() => {
    return isOn
      ? { color: "bg-purple-600", transition: "translate-x-5" }
      : { color: "bg-gray-200", transition: "translate-x-0" };
  }, [isOn]);

  return (
    <button
      type="button"
      className={`${classNames.color} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
      aria-pressed="false"
    >
      {/* <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" --> */}

      {/* <span className="sr-only">Use setting</span> */}
      {/* <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" --> */}
      <span
        aria-hidden="true"
        className={`${classNames.transition} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
      ></span>
    </button>
  );
};

export default Toggle;
