import React from "react";

import { UserIsRenting } from "../../components/pages/user-is-renting";
import { DashboardPage } from "../../components/pages/dashboard-page";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <UserIsRenting />
    </DashboardPage>
  );
};

export default Dashboard;
