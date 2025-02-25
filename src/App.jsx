import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import AuthGuard from "./components/Auth/AuthGuard.jsx";
import GuestGuard from "./components/Auth/GuestGuard.jsx";
import RoleBasedGuard from "./components/Auth/RoleBasedGuard.jsx";
import AuthSignIn from "./components/Auth/SignIn.jsx";
import BlogDetail from "./components/Blog/Detail.jsx";
import BlogForm from "./components/Blog/Form.jsx";
import BlogList from "./components/Blog/List.jsx";
import CustomerDetail from "./components/Customer/Detail.jsx";
import CustomerList from "./components/Customer/List.jsx";
import Dashboard from "./components/Dashboard.jsx";
import DetailItem from "./components/Detail/Item.jsx";
import DiamondPriceList from "./components/DiamondPrice/List.jsx";
import NotFound from "./components/NotFound.jsx";
import ProfilePage from "./components/Profile/Page.jsx";
import RecordScreenCommitment from "./components/Record/Screen/Commitment.jsx";
import RecordScreenReceipt from "./components/Record/Screen/Receipt.jsx";
import RecordScreenResult from "./components/Record/Screen/Result.jsx";
import RecordScreenReturn from "./components/Record/Screen/Return.jsx";
import RecordScreenSealing from "./components/Record/Screen/Sealing.jsx";
import RequestItem from "./components/Request/Item.jsx";
import RequestList from "./components/Request/List.jsx";
import RequestResultPayment from "./components/Request/PaymentResult.jsx";
import ServiceList from "./components/Service/List.jsx";
import ServicePriceList from "./components/Service/ServicePriceList.jsx";
import StaffDetail from "./components/Staff/Detail.jsx";
import StaffList from "./components/Staff/List.jsx";
import DiamondList from "./components/Supplier/DiamondList.jsx";
import SupplierList from "./components/Supplier/List.jsx";
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
                element: <RecordScreenResult />,
              },
              {
                path: "receipt",
                children: [
                  {
                    index: true,
                    element: <RecordScreenReceipt />,
                  },
                  {
                    path: "payment",
                    element: <RequestResultPayment />,
                  },
                ],
              },
              {
                path: "return",
                children: [
                  {
                    index: true,
                    element: <RecordScreenReturn />,
                  },
                  {
                    path: "payment",
                    element: <RequestResultPayment />,
                  },
                ],
              },
              {
                path: "commitment",
                element: <RecordScreenCommitment />,
              },
              {
                path: "sealing",
                element: <RecordScreenSealing />,
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
      {
        path: "blogs",
        children: [
          {
            index: true, // uri: /blogs
            element: (
              <RoleBasedGuard allowedRoles={[Role.ADMIN]}>
                <BlogList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":blogId", // uri: /blogs/:blogId
            element: (
              <RoleBasedGuard allowedRoles={[Role.ADMIN]}>
                <BlogDetail />
              </RoleBasedGuard>
            ),
          },
          {
            path: "new", // uri: /blogs/new
            element: (
              <RoleBasedGuard allowedRoles={[Role.ADMIN]}>
                <BlogForm />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":blogId/edit", // uri: /blogs/:blogId/edit
            element: (
              <RoleBasedGuard allowedRoles={[Role.ADMIN]}>
                <BlogForm />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "prices",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER]}>
                <DiamondPriceList />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "staffs",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <StaffList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":staffId",
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <StaffDetail />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "customers",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <CustomerList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":customerId",
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}>
                <CustomerDetail />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "services",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER]}>
                <ServiceList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":serviceId",
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER]}>
                <ServicePriceList />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "suppliers",
        children: [
          {
            index: true,
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER]}>
                <SupplierList />
              </RoleBasedGuard>
            ),
          },
          {
            path: ":supplierId",
            element: (
              <RoleBasedGuard allowedRoles={[Role.MANAGER]}>
                <DiamondList />
              </RoleBasedGuard>
            ),
          },
        ],
      },
      {
        path: "profile",
        element: <ProfilePage />,
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
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/not-found",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
