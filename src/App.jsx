import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ScreenAppLayout from "./screens/AppLayout.jsx";
import ScreenDiamondValuationItem from "./screens/DiamondValuation/Item.jsx";
import ScreenDiamondValuationList from "./screens/DiamondValuation/List.jsx";
import ScreenValuationRequestItem from "./screens/ValuationRequest/Item.jsx";
import ScreenValuationRequestList from "./screens/ValuationRequest/List.jsx";
import ScreenValuationRequestDetailItem from "./screens/ValuationRequestDetail/Item.jsx";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ScreenAppLayout />,
    children: [
      {
        index: true,
        element: <div>Dashboard</div>,
      },
      {
        path: "requests",
        children: [
          {
            index: true,
            element: <ScreenValuationRequestList />,
          },
          {
            path: ":requestId",
            element: <ScreenValuationRequestItem />,
          },
          {
            path: ":requestId/:detailId",
            element: <ScreenValuationRequestDetailItem />,
          },
        ],
      },
      {
        path: "valuations",
        children: [
          {
            index: true,
            element: <ScreenDiamondValuationList />,
          },
          {
            path: ":detailId",
            element: <ScreenDiamondValuationItem />,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
