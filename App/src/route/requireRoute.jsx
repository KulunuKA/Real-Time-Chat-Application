import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { userInfo } from "../store/user";

export default function RequireRoute() {
  const reduxUser = useSelector(userInfo);
  const isLogin = reduxUser?.id;
  const location = useLocation();

  return isLogin ? (
    <Outlet />
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
}
