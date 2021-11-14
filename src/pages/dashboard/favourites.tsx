import React from "react";

import { DashboardPage } from "renft-front/components/pages/dashboard-page";
import MyFavorites from "renft-front/components/pages/favourites";

export const Dashboard: React.FC = () => {
  return (
    <DashboardPage>
      <MyFavorites />
    </DashboardPage>
  );
};

export default Dashboard;
