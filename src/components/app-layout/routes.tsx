import { Route, Switch } from "react-router-dom"
import { MyFavorites } from "../../pages/favourites"
import { Lend, LendSpecificity } from "../../pages/lend"
import { Rent, RentSpecificity } from "../../pages/rent"
import PageLayout from "../page-layout"
import Faq from "../../pages/faq";
import Profile from "../../pages/profile";
import React from "react";
import { Dashboard } from "../../pages/dashboard"


export const Routes = () => {
    return (
        <Switch>
            <Route exact path="/">
                <Rent specificity={RentSpecificity.ALL} />
            </Route>
            <Route exact path="/lend">
                <Lend specificity={LendSpecificity.ALL} />
            </Route>
            <Route exact path="/user-is-renting">
                <Rent specificity={RentSpecificity.RENTING} />
            </Route>
            <Route exact path="/user-is-lending">
                <Lend specificity={LendSpecificity.LENDING} />
            </Route>
            <Route exact path="/dashboard">
                <PageLayout>
                    <Dashboard />
                </PageLayout>
            </Route>
            <Route exact path="/favourites">
                <MyFavorites />
            </Route>
            {/* <Route exact path="/leaderboard">
              <Leaderboard />
            </Route> */}
            <Route exact path="/faq">
                <Faq />
            </Route>
            <Route exact path="/profile">
                <Profile />
            </Route>
        </Switch>
    )
}