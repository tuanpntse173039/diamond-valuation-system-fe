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
import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import * as React from "react";
import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateDetail, updateDiamondNote } from "../../services/api.js";
import { storage } from "../../services/config/firebase.js";
import { useDetail } from "../../services/details.js";

import { getStaffById } from "../../utilities/filtering.js";
import { formattedMoney } from "../../utilities/formatter.js";
import { loadImageByPath } from "../../utilities/imageLoader.js";
import { getPreviousStatus } from "../../utilities/Status.jsx";
import UIDetailHeader from "../UI/UIDetailHeader.jsx";
import DiamondValuationAssessment from "../Valuation/Assessment.jsx";
import DiamondValuationAssignTable from "../Valuation/AssignTable.jsx";
import DiamondValuationFieldGroup from "../Valuation/FieldGroup.jsx";
import DiamondValuationUserInfor from "../Valuation/UserInfor.jsx";

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

export const metadata = {
  contentType: "image/jpeg",
};
const DetailItem = ({ staffs }) => {
  const queryClient = useQueryClient();
  const { requestId, detailId } = useParams();
  const { data: detail } = useDetail(detailId);

  //Mutate
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
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
      if (body.status === "ASSESSING")
        toast.success("Save assessment successfully");
      else if (body.status === "ASSESSED")
        toast.success("Confirm assessment successfully");
    },
  });

  //DiamondInfor
  const serverDiamondInfor = detail.diamondValuationNote;
  const [diamondInfor, setDiamondInfor] = useState({
    giaCertDate: dayjs(new Date()), //xu ly sau
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
    clarityCharacteristicLink: serverDiamondInfor?.clarityCharacteristicLink,
    clarityCharacteristic: serverDiamondInfor?.clarityCharacteristic,
  });

  //Clarity Characteristic List
  const [clarities, setClarities] = useState(
    diamondInfor.clarityCharacteristic === null
      ? []
      : () => diamondInfor.clarityCharacteristic,
  );
  const handleClarities = (event, newClarity) => {
    setClarities(newClarity);
  };

  //Assessing State
  const [detailState, setDetailState] = useState({
    previous: getPreviousStatus(detail.status),
    current: detail.status,
  });
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
      clarityCharacteristic: clarities,
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

  //Image
  const [diamondImage, setDiamondImage] = useState(null);
  const [uploadedDiamondImages, setUploadedDiamondImages] = useState([]);
  const [proportionImage, setProportionImage] = useState(null);
  const [clarityCharacteristicImage, setClarityCharacteristicImage] =
    useState(null);
  function handleSelectDiamondImage(e) {
    if (e.target.files[0]) {
      setDiamondImage(e.target.files[0]);
    }
  }
  const imageLinks = `diamonds/${detailId}/images`;
  const getListAllImages = () => {
    const listRef = ref(storage, imageLinks);

    listAll(listRef)
      .then(async (res) => {
        res.prefixes.forEach((folderRef) => {
          console.log("folderRef", folderRef);
        });
        const images = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return url;
          }),
        );
        setUploadedDiamondImages(images);
      })
      .catch((error) => {
        console.error("Error getting download URL:", error);
      });
  };
  useEffect(() => {
    getListAllImages();
    if (detail.diamondValuationNote?.proportions !== null) {
      loadImageByPath(
        detail.diamondValuationNote?.proportions,
        setProportionImage,
      );
    }
    if (detail.diamondValuationNote?.clarityCharacteristicLink !== null) {
      loadImageByPath(
        detail.diamondValuationNote?.clarityCharacteristicLink,
        setClarityCharacteristicImage,
      );
    }
  }, []);
  const handleUploadDiamondImage = () => {
    const storageRef = ref(storage, `${imageLinks}/${diamondImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, diamondImage, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadedDiamondImages([downloadURL, ...uploadedDiamondImages]);
          const imageLink = `${imageLinks}` / `${diamondImage.name}`;
          setDiamondImage(null);
          toast.success("Upload image successfully");
        });
      },
    );
  };

  //ResultStaff after approve
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
              sx={{ width: "100%", height: 339, rowGap: "10px" }}
              cols={3}
              rowHeight={164}
            >
              {!diamondImage && (
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
                    <VisuallyHiddenInput
                      type="file"
                      onChange={handleSelectDiamondImage}
                    />
                  </Button>
                </ImageListItem>
              )}
              {diamondImage && (
                <ImageListItem sx={{ position: "relative" }}>
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
                  <Box sx={{ w: 164, h: 164 }}>
                    <img
                      src={`${URL.createObjectURL(diamondImage)}`}
                      alt="New upload image"
                      loading="lazy"
                      style={{ height: "164px", objectFit: "cover" }}
                    />
                  </Box>
                </ImageListItem>
              )}
              {uploadedDiamondImages
                .map((item) => ({ img: item, title: "Diamond Image" }))
                .map((item, index) => (
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
            {diamondImage && (
              <Button
                onClick={handleUploadDiamondImage}
                variant={"outlined"}
                sx={{ position: "absolute", top: 0, right: 0 }}
                size={"small"}
              >
                Upload
              </Button>
            )}
          </DiamondValuationFieldGroup>
        </Box>
      </Box>

      {detailState.current !== "PENDING" && (
        <DiamondValuationAssessment
          diamondInfor={diamondInfor}
          setDiamondInfor={setDiamondInfor}
          detailState={detailState}
          proportionImage={proportionImage}
          clarityCharacteristicImage={clarityCharacteristicImage}
          clarities={clarities}
          handleClarities={handleClarities}
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

export default DetailItem;
