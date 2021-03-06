import React from "react";
import { Box } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { purple } from "@material-ui/core/colors";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import BatchProvider from '../controller/batch-controller';
import { Nft } from "../../contexts/graph/classes";

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
					<span style={{ textTransform: "uppercase", fontWeight: "bold" }}>{title}&nbsp; &nbsp;</span>
					<Box onClick={onSwitch}>
						<FormGroup>
							<FormControlLabel
								control={<PurpleSwitch checked={toggleValue} />}
								label=""
							/>
						</FormGroup>
					</Box>
				</Box>
			</Box>
			<BatchProvider>
				<Box className="Catalogue">{children}</Box>
			</BatchProvider>			
		</Box>
	</Box>
  );
};

export default PageLayout;
