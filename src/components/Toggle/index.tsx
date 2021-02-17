import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { purple } from "@material-ui/core/colors";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const PurpleSwitch = withStyles({
  switchBase: {
    color: purple[300],
    "&$checked": {
      color: purple[500],
    },
    "&$checked + $track": {
      backgroundColor: purple[500],
    },
  },
  checked: {},
  track: {},
})(Switch);

type ToggleProps = {
  isOn: boolean;
};

export const Toggle: React.FC<ToggleProps> = ({ isOn }) => {
  // * tailwind
  // const classNames = useMemo(() => {
  //   return isOn
  //     ? { color: "bg-purple-600", transition: "translate-x-5" }
  //     : { color: "bg-gray-200", transition: "translate-x-0" };
  // }, [isOn]);

  return (
    <FormGroup>
      <FormControlLabel
        control={
          <PurpleSwitch
            checked={isOn}
            // onChange={handleChange}
          />
        }
        label=""
      />
    </FormGroup>
    // * tailwind
    // <button
    //   type="button"
    //   className={`${classNames.color} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
    //   aria-pressed="false"
    // >
    //   {/* <!-- Enabled: "bg-indigo-600", Not Enabled: "bg-gray-200" --> */}

    //   {/* <span className="sr-only">Use setting</span> */}
    //   {/* <!-- Enabled: "translate-x-5", Not Enabled: "translate-x-0" --> */}
    //   <span
    //     aria-hidden="true"
    //     className={`${classNames.transition} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
    //   ></span>
    // </button>
  );
};

export default Toggle;
