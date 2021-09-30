import React from "react";

import { DashboardPage } from "../../components/pages/dashboard-page";
import MyFavorites from "../../components/pages/favourites";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <MyFavorites />
    </DashboardPage>
  );
};

export default Dashboard;
