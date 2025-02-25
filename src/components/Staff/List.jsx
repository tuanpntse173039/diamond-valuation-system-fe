import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useStaffList } from "../../services/staffs";
import Role from "../../utilities/Role.js";
import { a11yProps, StaffHeadCells } from "../../utilities/table.js";
import UICircularIndeterminate from "../UI/CircularIndeterminate.jsx";
import UITable from "../UI/Table.jsx";
import UITabPanel from "../UI/TabPanel.jsx";
import RegisterStaff from "./Form.jsx";

const staffStatus = [
  { id: 0, name: "All", roles: [Role.MANAGER, Role.ADMIN] },
  { id: 1, name: "Consultant Staff", roles: [Role.MANAGER, Role.ADMIN] },
  { id: 2, name: "Valuation Staff", roles: [Role.MANAGER, Role.ADMIN] },
  { id: 3, name: "Former Staff", roles: [Role.MANAGER, Role.ADMIN] },
];

const getRoleName = (role) => {
  const roleNames = {
    [Role.CONSULTANT]: "Consultant Staff",
    [Role.VALUATION]: "Valuation Staff",
    [Role.ADMIN]: "Admin Staff",
    [Role.MANAGER]: "Manager Staff",
  };
  return roleNames[role] || "Unknown Role";
};

const StaffList = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const userRole = currentUser?.account.role;

  const [statusIndex, setStatusIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [open, setOpen] = useState(false);

  const {
    data: staffResponse = {},
    isFetching,
    error,
  } = useStaffList(rowsPerPage, page);

  const handleChange = (event, newValue) => {
    setStatusIndex(newValue);
  };

  const handleAddStaff = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const filterStaff = (staff) => {
    switch (statusIndex) {
      case 1:
        return (
          staff.account.role === Role.CONSULTANT && staff.account.is_active
        );
      case 2:
        return staff.account.role === Role.VALUATION && staff.account.is_active;
      case 3:
        return !staff.account.is_active;
      default:
        return true;
    }
  };

  const staffRows = (staffResponse.content || [])
    .filter(filterStaff)
    .map((row) => ({
      id: row.id,
      number: row.id,
      staffName: `${row.firstName} ${row.lastName}`,
      staffPhone: row.phone.trim(),
      yearExperience: row.experience,
      role: getRoleName(row.account.role),
      sta: row.account.is_active ? "Active" : "Inactive",
    }));

  if (isFetching) {
    return <UICircularIndeterminate />;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        Error loading staff data.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={statusIndex}
          onChange={handleChange}
          aria-label="staff status"
        >
          {staffStatus
            .filter((status) => status.roles.includes(userRole))
            .map((status, index) => (
              <Tab key={status.id} label={status.name} {...a11yProps(index)} />
            ))}
        </Tabs>
      </Box>

      {staffStatus
        .filter((status) => status.roles.includes(userRole))
        .map((status, index) => (
          <UITabPanel key={index} index={index} value={statusIndex}>
            <UITable
              heading={status.name}
              headCells={StaffHeadCells}
              rows={staffRows}
              selected={selectedStaff}
              setSelected={setSelectedStaff}
              page={page}
              setPage={setPage}
              count={staffResponse.totalElement}
              rowsPerPage={rowsPerPage}
              setRowsPerPage={setRowsPerPage}
            >
              <Button
                onClick={handleAddStaff}
                variant="contained"
                size="large"
                endIcon={<AddIcon />}
              >
                Add
              </Button>
            </UITable>
          </UITabPanel>
        ))}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Register Staff</DialogTitle>
        <DialogContent>
          <RegisterStaff handleClose={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffList;
