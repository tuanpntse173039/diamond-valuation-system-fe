import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import AuthGuard from "./components/Auth/AuthGuard.jsx";
import GuestGuard from "./components/Auth/GuestGuard.jsx";
import RoleBasedGuard from "./components/Auth/RoleBasedGuard.jsx";
import AuthSignIn from "./components/Auth/SignIn.jsx";
import Dashboard from "./components/Dashboard.jsx";
import DetailItem from "./components/Detail/Item.jsx";
import ScreenResult from "./components/Record/ScreenResult.jsx";
import RequestItem from "./components/Request/Item.jsx";
import RequestList from "./components/Request/List.jsx";
import DiamondValuationItem from "./components/Valuation/Item.jsx";
import DiamondValuationList from "./components/Valuation/List.jsx";
import "react-toastify/dist/ReactToastify.css";
import Role from "./utilities/Role.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleBasedGuard allowedRoles={[Role.ADMIN, Role.MANAGER]}>
            <Dashboard />
          </RoleBasedGuard>
        ),
      },
      {
        path: "requests",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.CONSULTANT, Role.MANAGER]}>
                <RequestList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":requestId",
            children: [
              {
                index: true,
                element: (
                  <RoleBasedGuard
                    allowedRoles={[Role.CONSULTANT, Role.MANAGER]}
                  >
                    <RequestItem />
                  </RoleBasedGuard>
                ),
              },
              {
                path: ":detailId",
                element: (
                  <RoleBasedGuard
                    allowedRoles={[Role.CONSULTANT, Role.MANAGER]}
                  >
                    <DetailItem />
                  </RoleBasedGuard>
                ),
              },
              {
                path: "results",
                element: <ScreenResult />,
              },
            ],
          },
        ],
      },
      {
        path: "valuations",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.VALUATION, Role.MANAGER]}>
                <DiamondValuationList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":valuationId",
            element: (
              <RoleBasedGuard allowedRoles={[Role.VALUATION, Role.MANAGER]}>
                <DiamondValuationItem />
              </RoleBasedGuard>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: (
          <GuestGuard>
            <AuthSignIn />
          </GuestGuard>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
