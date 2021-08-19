import { short } from "../../utils";
import React, { useState } from "react";

export const ShortenPopover: React.FC<{ longString: string; dataCy?: string }> =
  ({ longString, dataCy }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event: any) => {
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setAnchorEl(null);
    };
    const open = Boolean(anchorEl);

    return (
      <>
        <span
          aria-owns={open ? "mouse-over-popover" : undefined}
          aria-haspopup="true"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          {longString.length > 10 ? short(longString) : longString}
        </span>
        {/* <div
          id="mouse-over-popover"
          // classes={{
          //   paper: classes.paper,
          // }}
          //  open={open}
          //  anchorEl={anchorEl}
          // anchorOrigin={{
          //   vertical: "bottom",
          //   horizontal: "left",
          // }}
          // transformOrigin={{
          //   vertical: "top",
          //   horizontal: "left",
          // }}
          // onClose={handlePopoverClose}
          // disableRestoreFocus
        >
          <div data-cy={dataCy}>{longString}</div>
        </div> */}
      </>
    );
  };
