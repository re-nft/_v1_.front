import React from "react";

import { UserIsLending } from "../../components/pages/user-is-lending";
import { DashboardPage } from "../../components/pages/dashboard-page";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <UserIsLending />
    </DashboardPage>
  );
};

export default Dashboard;