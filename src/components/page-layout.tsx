import React, { useState, useCallback } from "react";
import { Box } from "@material-ui/core";
import Toggle from "./toggle";

type PageLayoutProps = {
  onSwitch(): void;
  title: string;
  toggleValue: boolean;
};

const PageLayout: React.FC<PageLayoutProps> = ({
  onSwitch,
  toggleValue,
  title,
  children,
}) => {
  return (
    <Box>
      <Box>
        <Box style={{ display: "flex" }}>
          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
              {/*specificity.valueOf() === 0 ? "AVAILABLE TO LEND" : "LENDING"}{" "}*/}
              {title}
              &nbsp; &nbsp;
            </span>
            <Box onClick={onSwitch}>
              <Toggle isOn={toggleValue} />
            </Box>
          </Box>
        </Box>
        <Box>
          <Box className="Catalogue">{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PageLayout;
