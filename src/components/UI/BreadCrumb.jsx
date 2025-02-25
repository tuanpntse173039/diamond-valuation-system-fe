import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

function LinkRouter(props) {
    return <Link {...props} component={RouterLink} />;
}

export default function UIBreadCrumb({ pathNames }) {
    const { requestId, detailId, valuationId, serviceId, supplierId, blogId } = useParams();

  const breadcrumbNameMap = {
    "/requests": "Requests",
    [`/requests/${requestId}`]: requestId,
    [`/requests/${requestId}/${detailId}`]: detailId,
    [`/requests/${requestId}/receipt`]: "Receipt",
    [`/requests/${requestId}/return`]: "Return",
    [`/requests/${requestId}/commitment`]: "Commitment",
    [`/requests/${requestId}/sealing`]: "Sealing",
    "/valuations": "Valuations",
    [`/valuations/${valuationId}`]: valuationId,
    "/services": "Services",
    [`/services/${serviceId}`]: serviceId ? `${serviceId}` : null,
    "/suppliers": "Suppliers",
    [`/suppliers/${supplierId}`]: supplierId ? `${supplierId}` : null,
    "/blogs": "Blogs",
    [`/blogs/${blogId}`]: blogId ? `${blogId}` : null,
    [`/blogs/${blogId}/edit`]: blogId ? `Edit` : null,
  };

  return (
    <Stack spacing={2}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {pathNames.map((_value, index) => {
          const last = index === pathNames.length - 1;
          const to = `/${pathNames.slice(0, index + 1).join("/")}`;

          return last ? (
            <Typography color="text.primary" key={to}>
              {breadcrumbNameMap[to]}
            </Typography>
          ) : (
            <LinkRouter underline="hover" color="inherit" to={to} key={to}>
              {breadcrumbNameMap[to]}
            </LinkRouter>
          );
        })}
      </Breadcrumbs>
    </Stack>
  );
}
