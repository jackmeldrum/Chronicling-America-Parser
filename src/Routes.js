import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import Search from "./containers/Search";
import Profile from "./containers/Profile";
import Users from "./containers/Users";


export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/login" exact component={Login} />
      <Route path="/signup" exact component={Signup} />
      <Route path="/search" exact component={Search} />
      <Route path="/profile" exact component={Profile} />
      <Route path="/users" exact component={Users} />
    </Switch>
  );
}