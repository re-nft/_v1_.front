import React from "react";

import { UserIsLending } from "../../components/pages/user-is-lending";
import { UserIsRenting } from "../../components/pages/user-is-renting";
import { DashboardPage } from "../../components/pages/dashboard";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <UserIsRenting />
    </DashboardPage>
  );
};

export default Dashboard;
