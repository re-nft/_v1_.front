import React from "react";

import { Switch } from "@headlessui/react";
import { classNames } from "renft-front/utils";

export const Toggle: React.FC<{
  title: string;
  onSwitch: () => void;
  toggleValue?: boolean;
}> = ({ title, onSwitch, toggleValue = false }) => {
  return (
    <Switch.Group as="div" className="flex items-center justify-end">
      <Switch.Label as="span" className="mr-3">
        <span className="text-sm text-white font-medium font-display">
          {title}
        </span>
      </Switch.Label>
      <Switch
        checked={!toggleValue}
        onChange={onSwitch}
        className="bg-black relative inline-flex flex-shrink-0 h-10 w-16 border-2 border-transparent 
        cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rn-purple"
      >
        <span
          aria-hidden="true"
          className={classNames(
            !toggleValue
              ? "translate-x-6 bg-rn-green shadow-rn-drop-green"
              : "translate-x-0 bg-rn-orange shadow-rn-drop-orange",
            "pointer-events-none inline-block h-8 w-8 -mt-1   shadow transform ring-0 transition ease-in-out duration-200"
          )}
        />
      </Switch>
    </Switch.Group>
  );
};
