import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { Avatar, AvatarGroup, ImageList, ImageListItem } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import * as React from "react";
import { useState } from "react";
import Carousel from "react-material-ui-carousel";
import { updateDiamondNote } from "../../services/DiamondValuation/api.js";
import { getStaffById } from "../../services/Staff/utils.jsx";
import { updateDetail } from "../../services/ValuationRequestDetail/api.js";
import { formattedMoney } from "../../utilities/AppConfig.js";
import DiamondValuationAssessment from "../DiamondValuation/Assessment.jsx";
import DiamondValuationAssignTable from "../DiamondValuation/AssignTable.jsx";
import DiamondValuationFieldGroup from "../DiamondValuation/FieldGroup.jsx";
import DiamondValuationUserInfor from "../DiamondValuation/UserInfor.jsx";
import UIDetailHeader from "../UI/UIDetailHeader.jsx";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
const imagesData = [
  {
    img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
    title: "Breakfast",
  },
  {
    img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
    title: "Burger",
  },
  {
    img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
    title: "Camera",
  },
  {
    img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    title: "Coffee",
  },
  {
    img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
    title: "Hats",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
  },
  {
    img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
    title: "Honey",
  },
];

const ValuationRequestDetailItem = ({
  detail,
  valuationRequests,
  customer,
  staffs,
}) => {
  const queryClient = useQueryClient();
  const { mutate: mutateDetail } = useMutation({
    mutationFn: (body) => {
      return updateDetail(detail.id, body);
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries(["valuationRequests"]);
    },
  });

  const { mutate: mutateAssessment } = useMutation({
    mutationFn: (body) => {
      return updateDiamondNote(detail.diamondValuationNote.id, body);
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries(["valuationRequests"]);
    },
  });
  const serverDiamondInfor = detail?.diamondValuationNote;
  const [diamondInfor, setDiamondInfor] = useState({
    giaCertDate: dayjs(new Date()),
    certificateId: serverDiamondInfor?.certificateId,
    diamondOrigin: serverDiamondInfor?.diamondOrigin,
    caratWeight: serverDiamondInfor?.caratWeight,
    color: serverDiamondInfor?.color,
    clarity: serverDiamondInfor?.clarity,
    cut: serverDiamondInfor?.cut,
    shape: serverDiamondInfor?.shape,
    symmetry: serverDiamondInfor?.symmetry,
    polish: serverDiamondInfor?.polish,
    fluorescence: serverDiamondInfor?.fluorescence,
    proportions: serverDiamondInfor?.proportions,
    clarityCharacteristics: serverDiamondInfor?.clarityCharacteristic,
  });
  const getPreviousStatus = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return "PENDING";
      case "ASSESSING":
        return "PENDING";
      case "ASSESSED":
        return "ASSESSING";
      case "VALUATING":
        return "ASSESSED";
      case "VALUATED":
        return "VALUATING";
      case "APPROVED":
        return "APPROVED";
    }
  };
  const [detailState, setDetailState] = useState({
    previous: getPreviousStatus(detail.status),
    current: detail.status,
  });

  const infor = {
    customerName: customer.firstName + " " + customer.lastName,
    phone: customer.phone.trim(),
    email: customer.email.trim(),
    size: detail.size,
    service: valuationRequests.service.name,
    servicePrice: detail.servicePrice,
    status: detail.status,
    fairPriceEstimate:
      serverDiamondInfor?.fairPrice === null
        ? "N/A"
        : serverDiamondInfor?.fairPrice,
    estimateRange:
      serverDiamondInfor?.minPrice + " - " + serverDiamondInfor?.maxPrice,
  };

  function handleAssessing() {
    setDetailState((prevState) => {
      return {
        ...prevState,
        previous: prevState.previous,
        current: "ASSESSING",
      };
    });
  }

  function handleCancelAssessing() {
    setDetailState((prevState) => {
      if (prevState.previous === "PENDING") {
        return {
          ...prevState,
          current: "PENDING",
        };
      }
      return {
        ...prevState,
        previous: "ASSESSING",
        current: "DRAFT_ASSESSING",
      };
    });
  }

  function handleSaveAssessing() {
    setDetailState((prevState) => {
      return {
        ...prevState,
        previous: "ASSESSING",
        current: "DRAFT_ASSESSING",
      };
    });
    const detailBody = {
      ...detail,
      status: "ASSESSING",
    };
    mutateDetail(detailBody);
    const assessmentBody = {
      ...diamondInfor,
    };
    mutateAssessment(assessmentBody);
  }

  function handleEditAssessment() {
    setDetailState((prevState) => {
      return {
        ...prevState,
        previous: prevState.previous,
        current: "ASSESSING",
      };
    });
  }

  function handleConfirmAssessment() {
    setDetailState((prevState) => {
      return {
        ...prevState,
        previous: "",
        current: "ASSESSED",
      };
    });
    const detailBody = {
      ...detail,
      status: "ASSESSED",
    };
    mutateDetail(detailBody);
  }

  const [open, setOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState(null);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    // Save your changes here
    // ...
    setOpen(false);
  };

  const resultStaff =
    detail.valuationPrice === 0
      ? null
      : !detail.mode
        ? {
            staff: getStaffById(staffs, detail.diamondValuationAssign.staffId),
            comment: detail.diamondValuationAssign.comment,
          }
        : detail.diamondValuationAssigns.map((item) => ({
            staff: getStaffById(staffs, item.staffId),
            comment: item.comment,
          }));
  console.log(resultStaff);
  return (
    <>
      {/*HEADING*/}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <UIDetailHeader title={"Valuation Request Detail"} detail={detail} />

        {detailState.current === "PENDING" && (
          <Button variant={"contained"} onClick={handleAssessing}>
            Assessing
          </Button>
        )}
        {detailState.current === "ASSESSING" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant={"outlined"} onClick={handleCancelAssessing}>
              Cancel
            </Button>
            <Button variant={"contained"} onClick={handleSaveAssessing}>
              Save
            </Button>
          </Box>
        )}
        {detailState.current === "DRAFT_ASSESSING" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant={"outlined"} onClick={handleEditAssessment}>
              Edit
            </Button>
            <Button variant={"contained"} onClick={handleConfirmAssessment}>
              Confirm
            </Button>
          </Box>
        )}
      </Box>

      {/*CONTENT*/}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          mt: 2.5,
        }}
      >
        {/*Description*/}
        <DiamondValuationFieldGroup title="Description" sx={{ width: "50%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              minHeight: 328,
            }}
          >
            <DiamondValuationUserInfor
              infor={infor}
              sx={{ width: detail.valuationPrice === 0.0 ? "100%" : "50%" }}
            />
            {detail.valuationPrice !== 0.0 && (
              <Box
                sx={{
                  width: detail.valuationPrice === 0.0 ? undefined : "50%",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <Typography sx={{ fontSize: "1rem" }}>Final price</Typography>
                <Typography sx={{ fontSize: "3rem" }}>
                  {formattedMoney(detail.valuationPrice)}
                </Typography>
                <AvatarGroup
                  max={3}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  {!detail.mode ? (
                    <Avatar alt={resultStaff.staff.id} src="" />
                  ) : (
                    resultStaff.map((item) => {
                      return (
                        <Avatar
                          key={item.staff.id}
                          alt={item.staff.id}
                          src=""
                        />
                      );
                    })
                  )}
                </AvatarGroup>
                <Box>
                  {!detail.mode ? (
                    <Typography>
                      `${resultStaff.comment.replace(/<[^>]*>/g, "")}`
                    </Typography>
                  ) : (
                    <Carousel sx={{ mt: 5, height: "100%" }}>
                      {resultStaff.map((item) => (
                        // <Box>
                        //   <Typography sx={{ fontSize: "1.5rem", mt: 5.5 }}>
                        //     {item.staff.firstName}
                        //   </Typography>
                        //   <Typography sx={{ fontSize: "0.8rem", px: 3 }}>
                        //     {item.comment}
                        //   </Typography>
                        // </Box>
                        <Box sx={{ mt: 2 }}>
                          <h2 className="text-xl mb-1/2 font-bold">
                            {item.staff.firstName + " " + item.staff.lastName}
                          </h2>
                          <p>{item.comment.replace(/<[^>]*>/g, "")}</p>

                          {/*<Button className="CheckButton">Check it out!</Button>*/}
                        </Box>
                      ))}
                    </Carousel>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </DiamondValuationFieldGroup>
        {/*Diamond Image*/}
        <Box sx={{ position: "relative", width: "50%" }}>
          <DiamondValuationFieldGroup title="Diamond Images">
            <ImageList
              sx={{ width: "100%", height: 328, rowGap: "10px" }}
              cols={3}
              rowHeight={164}
            >
              <ImageListItem>
                <Button
                  component="label"
                  role={undefined}
                  variant="outlined"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  sx={{ height: 164 }}
                >
                  Upload file
                  <VisuallyHiddenInput type="file" />
                </Button>
              </ImageListItem>
              {imagesData.map((item, index) => (
                <ImageListItem key={index} sx={{ position: "relative" }}>
                  <IconButton
                    aria-label="delete"
                    size="large"
                    sx={{
                      position: "absolute",
                      bottom: 7,
                      right: 7,
                      bgcolor: "white",
                      "&:hover": {
                        bgcolor: "red",
                      },
                      p: 0.5,
                    }}
                  >
                    <DeleteIcon
                      sx={{ color: "red", "&:hover": { color: "white" } }}
                    />
                  </IconButton>
                  <img
                    srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.img}?w=164&h=164&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                    style={{ height: "164px", objectFit: "cover" }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DiamondValuationFieldGroup>
        </Box>
      </Box>

      {detailState.current !== "PENDING" && (
        <DiamondValuationAssessment
          diamondInfor={diamondInfor}
          setDiamondInfor={setDiamondInfor}
          detailState={detailState}
        />
      )}
      {(detailState.current === "ASSESSED" ||
        detailState.current === "VALUATING" ||
        detailState.current === "DRAFT_VALUATING" ||
        detailState.current === "VALUATED") && (
        <>
          <DiamondValuationAssignTable
            detailState={detailState}
            staffs={staffs}
            detail={detail}
          />
        </>
      )}
    </>
  );
};

export default ValuationRequestDetailItem;
