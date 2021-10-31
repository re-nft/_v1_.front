import React from "react";

import { UserIsLending } from "renft-front/components/pages/user-is-lending";
import { DashboardPage } from "renft-front/components/pages/dashboard-page";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <UserIsLending />
    </DashboardPage>
  );
};

export default Dashboard;
