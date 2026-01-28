import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { routes } from "../app/routes";
import {
  Building2,
  Calendar as CalendarIcon,
  ClipboardList,
  LayoutDashboard,
  Repeat,
  ReceiptText,
  LogOut,
  UserCircle2,
  MessageCircleIcon,
  PanelLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "../shared/ThemeToggle";
import { clearAuthUser, getAuthUser } from "../app/auth";

const navItemClass = ({ isActive, collapsed }: { isActive: boolean; collapsed: boolean }) =>
  [
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
    collapsed ? "justify-center" : "",
    isActive
      ? "bg-blue-600/10 text-blue-500"
      : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
  ].join(" ");

export default function AppLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openWorkOrders, setOpenWorkOrders] = useState(true);
  const [openFiscalFiles, setOpenFiscalFiles] = useState(true);
  const [openFiscalProd, setOpenFiscalProd] = useState(true);
  const [userName, setUserName] = useState("Usuario");

  useEffect(() => {
    const user = getAuthUser();
    setUserName(user?.name ?? "Usuario");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <div className="flex">
        <aside
          className={`min-h-screen border-r border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="p-5">
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
              <div className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                <img src="/favicon.png" alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              {!collapsed && (
                <div>
                  <div className="font-semibold leading-5">Stage Sistemas</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Gestao Empresarial</div>
                </div>
              )}
            </div>
          </div>

          <nav className="px-4 space-y-1">
            <button
              className={`mb-2 h-10 w-full rounded-lg border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 flex items-center ${
                collapsed ? "justify-center" : "justify-start px-3"
              }`}
              onClick={() => setCollapsed((prev) => !prev)}
              title="Recolher menu"
              aria-label="Recolher menu"
            >
              <PanelLeft size={18} />
              {!collapsed && <span className="ml-2 text-sm">Recolher</span>}
            </button>

            <NavLink to={routes.dashboard} className={({ isActive }) => navItemClass({ isActive, collapsed })}>
              <LayoutDashboard size={18} />
              {!collapsed && "Dashboard"}
            </NavLink>
            <NavLink to={routes.companies} className={({ isActive }) => navItemClass({ isActive, collapsed })}>
              <Building2 size={18} />
              {!collapsed && "Empresas"}
            </NavLink>
            <div className="space-y-1">
              <div
                className={[
                  "flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                  collapsed ? "justify-center" : "justify-between",
                ].join(" ")}
              >
                <NavLink
                  to={routes.workOrdersPending}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 flex-1",
                      isActive ? "text-blue-500" : "",
                      collapsed ? "justify-center" : "",
                    ].join(" ")
                  }
                >
                  <ClipboardList size={18} />
                  {!collapsed && <span>Ordens de Servico</span>}
                </NavLink>
                {!collapsed && (
                  <button
                    className="h-6 w-6 flex items-center justify-center"
                    onClick={() => setOpenWorkOrders((prev) => !prev)}
                    aria-label="Recolher subtopicos"
                  >
                    {openWorkOrders ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>
              {!collapsed && openWorkOrders && (
                <div className="ml-6 space-y-1">
                  <NavLink
                    to={routes.workOrdersPending}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Pendentes
                  </NavLink>
                  <NavLink
                    to={routes.workOrdersFinished}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Finalizadas
                  </NavLink>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div
                className={[
                  "flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                  collapsed ? "justify-center" : "justify-between",
                ].join(" ")}
              >
                <NavLink
                  to={routes.fiscalFilesPending}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 flex-1",
                      isActive ? "text-blue-500" : "",
                      collapsed ? "justify-center" : "",
                    ].join(" ")
                  }
                >
                  <Repeat size={18} />
                  {!collapsed && <span>Arquivos Fiscais</span>}
                </NavLink>
                {!collapsed && (
                  <button
                    className="h-6 w-6 flex items-center justify-center"
                    onClick={() => setOpenFiscalFiles((prev) => !prev)}
                    aria-label="Recolher subtopicos"
                  >
                    {openFiscalFiles ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>
              {!collapsed && openFiscalFiles && (
                <div className="ml-6 space-y-1">
                  <NavLink
                    to={routes.fiscalFilesPending}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Pendentes
                  </NavLink>
                  <NavLink
                    to={routes.fiscalFilesFinished}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Finalizados
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to={routes.calendar} className={({ isActive }) => navItemClass({ isActive, collapsed })}>
              <CalendarIcon size={18} />
              {!collapsed && "Calendario"}
            </NavLink>

            <div className="space-y-1">
              <div
                className={[
                  "flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                  collapsed ? "justify-center" : "justify-between",
                ].join(" ")}
              >
                <NavLink
                  to={routes.fiscalPending}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 flex-1",
                      isActive ? "text-blue-500" : "",
                      collapsed ? "justify-center" : "",
                    ].join(" ")
                  }
                >
                  <ReceiptText size={18} />
                  {!collapsed && <span>Producao Fiscal</span>}
                </NavLink>
                {!collapsed && (
                  <button
                    className="h-6 w-6 flex items-center justify-center"
                    onClick={() => setOpenFiscalProd((prev) => !prev)}
                    aria-label="Recolher subtopicos"
                  >
                    {openFiscalProd ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>
              {!collapsed && openFiscalProd && (
                <div className="ml-6 space-y-1">
                  <NavLink
                    to={routes.fiscalPending}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Pendentes
                  </NavLink>
                  <NavLink
                    to={routes.fiscalFinished}
                    className={({ isActive }) =>
                      [
                        "flex items-center px-3 py-2 rounded-lg text-xs",
                        isActive
                          ? "bg-blue-600/10 text-blue-500"
                          : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-900",
                      ].join(" ")
                    }
                  >
                    Finalizados
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink to={routes.chatstage} className={({ isActive }) => navItemClass({ isActive, collapsed })}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm opacity-50 cursor-not-allowed">
                <MessageCircleIcon size={18} />
                {!collapsed && (
                  <>
                    Chat Stage <span className="text-xs">(EM BREVE)</span>
                  </>
                )}
              </div>
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/40 backdrop-blur">
            <div className="font-semibold"></div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 dark:text-slate-400">{userName}</span>
                <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <UserCircle2 size={18} />
                </div>
              </div>

              <button
                className="h-9 w-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center"
                title="Sair"
                aria-label="Sair"
                onClick={() => {
                  clearAuthUser();
                  navigate(routes.login);
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
