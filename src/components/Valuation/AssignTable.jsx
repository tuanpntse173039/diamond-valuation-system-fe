import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { assignValuationStaff, updateDetail } from "../../services/api.js";
import { useDetail } from "../../services/details.js";
import { useStaffs } from "../../services/staffs.js";

import { getStaffById } from "../../utilities/filtering.js";
import {
  formattedDateTime,
  formattedMoney,
} from "../../utilities/formatter.js";
import Role from "../../utilities/Role.js";
import { convertStatus } from "../../utilities/Status.jsx";
import { StaffHeadCells } from "../../utilities/table.js";
import UICircularIndeterminate from "../UI/CircularIndeterminate.jsx";
import UITable from "../UI/Table.jsx";
import DiamondValuationFieldGroup from "./FieldGroup.jsx";

const DiamondValuationAssignTable = ({ detailState }) => {
  const assessState = useSelector((state) => state.assessing);
  const { requestId, detailId } = useParams();
  const { data: detail, isLoading: isDetailLoading } = useDetail(detailId);
  const { data: staffs, isLoading: isStaffsLoading } = useStaffs(
    Role.VALUATION,
  );

  //Mutate
  const queryClient = useQueryClient();
  const { mutateAsync: assign } = useMutation({
    mutationFn: (data) => {
      return assignValuationStaff(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
      toast.success("Valuation staff is assigned");
      updateAssignStaff({
        ...detail,
        status: "VALUATING",
      });
    },
  });
  const { mutate: updateAssignStaff } = useMutation({
    mutationFn: (body) => {
      return updateDetail(detailId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
    },
  });

  //Approve Valuation
  const { mutate: approve } = useMutation({
    mutationFn: (data) => {
      return updateDetail(detailId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
      toast.success("Approved successfully");
    },
  });
  const valuationAssignment = detail?.diamondValuationAssigns.map((item) => {
    const vStaff = getStaffById(staffs, item.staffId);
    return {
      id: item.id,
      valuationStaffName: vStaff.firstName + " " + vStaff.lastName,
      date: item.creationDate,
      price: item.valuationPrice,
      comment: item.comment,
      // status: item.status ? "VALUATED" : "VALUATING",
      status: item.status,
    };
  });
  const [valuationMode, setValuationMode] = useState("Average");
  const handleValuationModeChange = (event) => {
    const isAverageMode = event.target.checked;
    setValuationMode(isAverageMode ? "Average" : "One");
    if (isAverageMode) {
      setSwitches(
        switches.map((val) => ({
          ...val,
          value: isAverageMode,
        })),
      ); // Enable the first switch when valuation mode changes
    } else {
      setSwitches(
        switches.map((val, i) => ({
          ...val,
          value: i === 0,
        })),
      ); // Enable the first switch when valuation mode changes
    }
  };
  const handleSwitchChange = (index, id) => {
    if (valuationMode === "One") {
      setSwitches(
        switches.map((val, i) => ({
          ...val,
          value: val.valuationId === id,
        })),
      ); // Enable only the selected switch
    } else {
      setSwitches(
        switches.map((val, i) => ({
          ...val,
          value: i === index ? !val.value : val.value,
        })),
      );
    }
  };
  const [switches, setSwitches] = useState(
    valuationAssignment?.map((row) => ({
      valuationId: row.id,
      value: true,
    })),
  ); // Enable the first switch by default

  //Assign Valuation Staff
  const valuationStaffList = staffs?.content
    .filter((staff) => staff?.account.is_active)
    .map((staff) => {
      return {
        number: staff.id,
        staffName: staff.firstName + " " + staff.lastName,
        staffPhone: staff.phone,
        yearExperience: staff.experience,
        totalProjects: staff.countProject,
        currentProjects: staff.currentTotalProject,
      };
    });
  const [selectedStaffs, setSelectedStaffs] = useState([]);
  const [valuationStaff, setValuationStaff] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleClickAssign = () => {
    setIsDialogOpen(true);
  };
  const handleClose = () => {
    setIsDialogOpen(false);
  };
  const getValuationAssignmentById = (id) => {
    return valuationAssignment.find((item) => item.id === id);
  };

  if (isStaffsLoading || isDetailLoading) {
    return <UICircularIndeterminate />;
  }

  return (
    <DiamondValuationFieldGroup
      title="Diamond Valuation Assignment"
      sx={{
        position: "relative",
        mt: 4,
      }}
    >
      <TableContainer component={Box}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: 17, fontWeight: 700 }} align="center">
                ID
              </TableCell>
              <TableCell
                width="13%"
                align="left"
                sx={{ fontSize: 17, fontWeight: 700 }}
              >
                Staff Name
              </TableCell>
              <TableCell
                width="17%"
                align="left"
                sx={{ fontSize: 17, fontWeight: 700 }}
              >
                Date
              </TableCell>
              <TableCell align="right" sx={{ fontSize: 17, fontWeight: 700 }}>
                Price
              </TableCell>
              <TableCell
                align="left"
                width="40%"
                sx={{ fontSize: 17, fontWeight: 700 }}
              >
                Comments
              </TableCell>
              <TableCell align="center" sx={{ fontSize: 17, fontWeight: 700 }}>
                Status
              </TableCell>

              {detail.status === "VALUATED" && (
                <TableCell
                  align="center"
                  sx={{ fontSize: 17, fontWeight: 700 }}
                >
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {valuationAssignment.length === 0 && (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={7}
                  sx={{ p: 3, fontSize: 20 }}
                >
                  There are no items is shown in this table
                </TableCell>
              </TableRow>
            )}
            {valuationAssignment.map((row, index) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="center">
                  {row.id}
                </TableCell>
                <TableCell align="left">{row.valuationStaffName}</TableCell>
                <TableCell align="left">
                  {formattedDateTime(row.date)}
                </TableCell>
                <TableCell align="right">{formattedMoney(row.price)}</TableCell>
                <TableCell align="left">{row.comment}</TableCell>
                <TableCell align="center">
                  {convertStatus(row.status ? "VALUATED" : "VALUATING")}
                </TableCell>
                {detail.status === "VALUATED" && (
                  <TableCell align="center">
                    <Switch
                      checked={
                        switches.find((sw) => sw.valuationId === row.id)?.value
                      }
                      onChange={() => handleSwitchChange(index, row.id)}
                      inputProps={{ "aria-label": "action" }}
                      disabled={valuationMode === "Average"}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ position: "absolute", top: 0, right: 0 }}>
        {assessState.current === "ASSESSED" && (
          <>
            <Button
              onClick={handleClickAssign}
              variant={"contained"}
              endIcon={<AddIcon />}
              sx={{ minWidth: 250 }}
            >
              Assign Valuation Staff
            </Button>
            <Dialog open={isDialogOpen} onClose={handleClose} maxWidth={"md"}>
              <DialogTitle>Assign Consultant</DialogTitle>
              <DialogContent>
                <UITable
                  rows={valuationStaffList}
                  headCells={StaffHeadCells}
                  heading="Valuation staff List"
                  readOnly
                  isPagination={false}
                  selected={selectedStaffs}
                  setSelected={setSelectedStaffs}
                  selectedAction={
                    <Button
                      variant={"contained"}
                      onClick={() => {
                        selectedStaffs.forEach((staff) => {
                          const body = {
                            staffId: staff,
                            valuationRequestDetailId: detailId,
                          };
                          assign(body);
                          handleClose();
                        });
                      }}
                    >
                      Assign
                    </Button>
                  }
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} variant="outlined">
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {assessState.current === "VALUATED" && (
          <Stack direction="row" spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ mr: 3, fontWeight: 600, color: "#3f51b5" }}>
                Choose Valuation Mode:{" "}
              </Typography>
              <Typography>One</Typography>
              <Switch
                checked={valuationMode === "Average"}
                onChange={handleValuationModeChange}
                inputProps={{ "aria-label": "controlled" }}
              />
              <Typography>Average</Typography>
            </Stack>
            <Button
              variant={"contained"}
              onClick={() => {
                const body = {
                  ...detail,
                  mode: valuationMode === "Average",
                  diamondValuationAssign:
                    valuationMode === "Average"
                      ? null
                      : getValuationAssignmentById(
                          switches.find((val) => val.value).valuationId,
                        ),
                  status: "APPROVED",
                };
                approve(body);
              }}
            >
              Approve
            </Button>
          </Stack>
        )}
      </Box>
    </DiamondValuationFieldGroup>
  );
};

export default DiamondValuationAssignTable;
