import { short } from "../../utils";
import { makeStyles, Popover, Typography } from "@material-ui/core";
import React, { useState } from "react";

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

export const ShortenPopover: React.FC<{ longString: string; dataCy?: string }> =
  ({ longString, dataCy }) => {
    const classes = useStyles();
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
        <Popover
          id="mouse-over-popover"
          className={classes.popover}
          classes={{
            paper: classes.paper,
          }}
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography data-cy={dataCy}>{longString}</Typography>
        </Popover>
      </>
    );
  };
