import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { routes } from "./routes";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Companies from "../pages/Companies";
import WorkOrders from "../pages/WorkOrders";
import WorkOrderNew from "../pages/WorkOrderNew";
import WorkOrderDetail from "../pages/WorkOrderDetail";
import WorkOrderEdit from "../pages/WorkOrderEdit";
import WorkOrdersCompanyDetail from "../pages/WorkOrdersCompanyDetail";
import FiscalFiles from "../pages/FiscalFiles";
import FiscalFilesCompanyDetail from "../pages/FiscalFilesCompanyDetail";
import Calendar from "../pages/Calendar";
import Fiscal from "../pages/Fiscal";
import FiscalCompanyDetail from "../pages/FiscalCompanyDetail";
import ChatStage from "../pages/ChatStage";
import CompanyForm from "../pages/CompanyForm";
import { getAuthUser } from "./auth";
import CompanyDetail from "../pages/CompanyDetail";

function AppRoutes() {
  const location = useLocation();
  const [isAuthed, setIsAuthed] = useState(() => Boolean(getAuthUser()));

  useEffect(() => {
    setIsAuthed(Boolean(getAuthUser()));
  }, [location]);

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path={routes.login}
          element={isAuthed ? <Navigate to={routes.dashboard} replace /> : <Login />}
        />
      </Route>

      <Route element={isAuthed ? <AppLayout /> : <Navigate to={routes.login} replace />}>
        <Route path="/" element={<Navigate to={routes.login} replace />} />
        <Route path={routes.dashboard} element={<Dashboard />} />
        <Route path={routes.companies} element={<Companies />} />
        <Route path={routes.workOrders} element={<Navigate to={routes.workOrdersPending} replace />} />
        <Route path={routes.workOrdersPending} element={<WorkOrders view="pending" />} />
        <Route path={routes.workOrdersFinished} element={<WorkOrders view="finished" />} />
        <Route path={routes.workOrdersCompanyDetail} element={<WorkOrdersCompanyDetail />} />
        <Route path={routes.workOrderNew} element={<WorkOrderNew />} />
        <Route path={routes.workOrderDetail} element={<WorkOrderDetail />} />
        <Route path={routes.workOrderEdit} element={<WorkOrderEdit />} />
        <Route path="/servicos-recorrentes" element={<Navigate to={routes.fiscalFilesPending} replace />} />
          <Route path={routes.fiscalFilesPending} element={<FiscalFiles view="pending" />} />
          <Route path={routes.fiscalFilesFinished} element={<FiscalFiles view="finished" />} />
          <Route path={routes.fiscalFilesCompanyDetail} element={<FiscalFilesCompanyDetail />} />
        <Route path={routes.calendar} element={<Calendar />} />
        <Route path="/producao-fiscal" element={<Navigate to={routes.fiscalPending} replace />} />
        <Route path={routes.fiscalPending} element={<Fiscal view="pending" />} />
        <Route path={routes.fiscalFinished} element={<Fiscal view="finished" />} />
        <Route path={routes.fiscalCompanyDetail} element={<FiscalCompanyDetail />} />
        <Route path={routes.chatstage} element={<ChatStage />} />
        <Route path={routes.companyNew} element={<CompanyForm />} />
        <Route path={routes.companyDetail} element={<CompanyDetail />} />
        <Route path={routes.companyEdit} element={<CompanyForm />} />
      </Route>
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
