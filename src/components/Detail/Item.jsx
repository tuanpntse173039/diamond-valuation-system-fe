import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  AvatarGroup,
  DialogContentText,
  ImageList,
  ImageListItem,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import * as React from "react";
import { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { setCurrent, setPrevious } from "../../redux/assessingSlice.js";
import { updateDetail, updateDiamondNote } from "../../services/api.js";
import { storage } from "../../services/config/firebase.js";
import { useDetail } from "../../services/details.js";
import { useStaffs } from "../../services/staffs.js";
import { getStaffById } from "../../utilities/filtering.js";
import { formattedDate, formattedMoney } from "../../utilities/formatter.js";
import Role from "../../utilities/Role.js";
import { getPreviousStatus } from "../../utilities/Status.jsx";
import UIBreadCrumb from "../UI/BreadCrumb.jsx";
import UICircularIndeterminate from "../UI/CircularIndeterminate.jsx";
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

const ValuationInforItem = ({ title, children }) => {
  return (
    <Box mb={3}>
      <Typography fontSize={20} fontWeight={700} mb={1}>
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export const metadata = {
  contentType: "image/jpeg",
};
const DetailItem = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.account.role;

  const queryClient = useQueryClient();
  const { detailId } = useParams();
  const { data: detail, isLoading: isDetailLoading } = useDetail(detailId);
  const { data: staffs, isLoading: isStaffLoading } = useStaffs(Role.VALUATION);

  const location = useLocation();
  const pathNames = location.pathname.split("/").filter((x) => x);

  //Mutate
  const { mutateAsync: mutateDetail } = useMutation({
    mutationFn: (body) => {
      return updateDetail(detail.id, body);
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
      if (body.data.status === "ASSESSING") {
        toast.success("Save assessment successfully");
      } else if (body.data.status === "ASSESSED") {
        toast.success("Confirm assessment successfully");
        dispatch(setPrevious("ASSESSING"));
        dispatch(setCurrent("ASSESSED"));
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });
  const { mutateAsync: mutateAssessment } = useMutation({
    mutationFn: (body) => {
      return updateDiamondNote(detail?.diamondValuationNote.id, body);
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries({
        queryKey: ["detail", { detailId: detailId }],
      });
      dispatch(setCurrent("ASSESSING"));
      dispatch(setPrevious("DOING"));
    },
    onError: (error) => {
      toast.error(error.response.data.message || "An error occurred");
    },
  });

  //DiamondInfor
  const serverDiamondInfor = detail?.diamondValuationNote;
  const [diamondInfor, setDiamondInfor] = useState({});
  useEffect(() => {
    if (detail) {
      setDiamondInfor((prev) => {
        return {
          ...prev,
          certificateDate: formattedDate(serverDiamondInfor?.certificateDate),
          certificateId: serverDiamondInfor?.certificateId,
          diamondOrigin: serverDiamondInfor?.diamondOrigin,
          cutScore: serverDiamondInfor?.cutScore,
          caratWeight: serverDiamondInfor?.caratWeight,
          color: serverDiamondInfor?.color,
          clarity: serverDiamondInfor?.clarity,
          cut: serverDiamondInfor?.cut,
          shape: serverDiamondInfor?.shape,
          symmetry: serverDiamondInfor?.symmetry,
          polish: serverDiamondInfor?.polish,
          fluorescence: serverDiamondInfor?.fluorescence,
          proportions: serverDiamondInfor?.proportions,
          clarityCharacteristicLink:
            serverDiamondInfor?.clarityCharacteristicLink,
          clarityCharacteristic: serverDiamondInfor?.clarityCharacteristic,
          fairPrice: serverDiamondInfor?.fairPrice,
          minPrice: serverDiamondInfor?.minPrice,
          maxPrice: serverDiamondInfor?.maxPrice,
        };
      });
      setClarities(serverDiamondInfor?.clarityCharacteristic);
    }
  }, [detail]);

  const [clarities, setClarities] = useState([]);
  const handleClarities = (event, newClarity) => {
    setClarities(newClarity);
  };

  //Assessing State
  const [detailState, setDetailState] = useState({
    previous: null,
    current: null,
  });

  const assessState = useSelector((state) => state.assessing);
  const dispatch = useDispatch();

  useEffect(() => {
    if (detail) {
      dispatch(setCurrent(detail.status));
      dispatch(setPrevious(getPreviousStatus(detail.status)));
    }
  }, [detail]);
  async function handleSaveAssessing() {
    const isValid =
      diamondInfor.cutScore > 0 &&
      diamondInfor.cutScore <= 10 &&
      diamondInfor.caratWeight > 0 &&
      diamondInfor.caratWeight <= 50;
    // if (!isValid) {
    //   toast.error("Invalid cut score or carat weight");
    //   return;
    // }
    const detailBody = {
      ...detail,
      status: "ASSESSING",
    };
    await mutateDetail(detailBody);
    const assessmentBody = {
      ...diamondInfor,
      clarityCharacteristic: clarities,
      certificateDate: null,
    };
    await mutateAssessment(assessmentBody);
  }

  async function handleConfirmAssessment() {
    const detailBody = {
      ...detail,
      status: "ASSESSED",
    };
    await mutateDetail(detailBody);
  }

  //Image
  const [diamondImage, setDiamondImage] = useState(null);
  const [uploadedDiamondImages, setUploadedDiamondImages] = useState([]);
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
          // console.log("folderRef", folderRef);
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
  }, [detail]);
  const handleUploadDiamondImage = () => {
    const storageRef = ref(storage, `${imageLinks}/${diamondImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, diamondImage, metadata);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            // console.log("Upload is paused");
            break;
          case "running":
            // console.log("Upload is running");
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
    detail?.valuationPrice === null
      ? null
      : !detail?.mode
        ? {
            staff: getStaffById(staffs, detail?.diamondValuationAssign.staffId),
            comment: detail?.diamondValuationAssign.comment,
            commentDetail: detail?.diamondValuationAssign.commentDetail,
          }
        : detail?.diamondValuationAssigns.map((item) => ({
            staff: getStaffById(staffs, item.staffId),
            comment: item.comment,
            commentDetail: item.commentDetail,
          }));
  const [selectedValuationDetail, setSelectedValuationDetail] = useState(null);
  const [moreDetail, setMoreDetail] = useState(false);
  const handleClickOpen = () => {
    setMoreDetail(true);
  };
  const handleClickClose = () => {
    setMoreDetail(false);
  };
  if (isStaffLoading || isDetailLoading) {
    return <UICircularIndeterminate />;
  }

  return (
    <>
      <UIBreadCrumb pathNames={pathNames} />
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

        {assessState.current === "PENDING" && (
          <Button
            variant={"contained"}
            onClick={() => {
              dispatch(setCurrent("DOING"));
              dispatch(setPrevious("PENDING"));
            }}
          >
            Assess Now
          </Button>
        )}
        {assessState.current === "DOING" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={"outlined"}
              onClick={() => {
                if (
                  assessState.previous === "PENDING" &&
                  assessState.current === "DOING"
                ) {
                  dispatch(setCurrent("PENDING"));
                } else {
                  dispatch(setCurrent("ASSESSING"));
                }
              }}
            >
              Cancel
            </Button>
            <Button variant={"contained"} onClick={handleSaveAssessing}>
              Save
            </Button>
          </Box>
        )}
        {assessState.current === "ASSESSING" && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={"outlined"}
              onClick={() => {
                dispatch(setCurrent("DOING"));
              }}
            >
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
              sx={{ width: detail.valuationPrice === null ? "100%" : "50%" }}
            />

            {detail.valuationPrice !== null && (
              <Box
                sx={{
                  width: detail.valuationPrice !== null ? "50%" : undefined,
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
                    <Avatar src={resultStaff.staff.avatar} />
                  ) : (
                    resultStaff.map((item) => {
                      return (
                        <Avatar key={item.staff.id} src={item.staff.avatar} />
                      );
                    })
                  )}
                </AvatarGroup>
                <Box>
                  {!detail.mode ? (
                    <Box sx={{ mt: 5.5 }}>
                      <h2 className="text-xl font-bold mb-1/2">
                        {resultStaff.staff.firstName +
                          " " +
                          resultStaff.staff.lastName}
                      </h2>
                      <Typography
                        sx={{
                          maxHeight: "100px",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          p: 1,
                        }}
                      >
                        {resultStaff.comment}
                      </Typography>
                      <Link
                        component="button"
                        onClick={() => {
                          setSelectedValuationDetail(resultStaff);
                          handleClickOpen();
                        }}
                      >
                        More
                      </Link>
                    </Box>
                  ) : (
                    <Carousel sx={{ mt: 5.5, height: "100%" }}>
                      {resultStaff.map((item, index) => (
                        <Box sx={{ mt: 2 }} key={index}>
                          <h2 className="text-xl font-bold mb-1/2">
                            {item.staff.firstName + " " + item.staff.lastName}
                          </h2>
                          <Typography
                            sx={{
                              maxHeight: "100px",
                              whiteSpace: "normal",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              p: 1,
                            }}
                          >
                            {item.comment}
                          </Typography>
                          <Link
                            component="button"
                            onClick={() => {
                              setSelectedValuationDetail(item);
                              handleClickOpen();
                            }}
                          >
                            More
                          </Link>
                        </Box>
                      ))}
                    </Carousel>
                  )}
                </Box>
                <Dialog
                  open={moreDetail}
                  onClose={handleClickClose}
                  scroll={"body"}
                  fullWidth
                  maxWidth={"md"}
                >
                  <DialogTitle id="scroll-dialog-title">
                    Valuation Detail
                  </DialogTitle>
                  <DialogContent dividers={scroll === "paper"}>
                    <DialogContentText
                      id="scroll-dialog-description"
                      tabIndex={-1}
                    >
                      <ValuationInforItem title="General Infor">
                        <Box
                          display="flex"
                          flexDirection="row"
                          alignItems="center"
                          sx={{ gap: 2 }}
                        >
                          <Typography>Created by: </Typography>
                          <Avatar
                            alt={selectedValuationDetail?.staff.id}
                            src={selectedValuationDetail?.staff.avatar}
                          />
                          <Typography>
                            {selectedValuationDetail?.staff.firstName +
                              " " +
                              selectedValuationDetail?.staff.lastName}
                          </Typography>
                        </Box>
                      </ValuationInforItem>
                      <ValuationInforItem title="Brief Comment">
                        {selectedValuationDetail?.comment}
                      </ValuationInforItem>
                      <ValuationInforItem title="Detail Comment">
                        <Box
                          component="div"
                          dangerouslySetInnerHTML={{
                            __html: selectedValuationDetail?.commentDetail,
                          }}
                        />
                      </ValuationInforItem>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClickClose}>Close</Button>
                  </DialogActions>
                </Dialog>
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
              {(assessState.current === "PENDING" ||
                assessState.current === "DOING" ||
                assessState.current === "ASSESSING") && (
                <Box>
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
                </Box>
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

      {detail.status === "CANCEL" && (
        <Box mt={5} textAlign="center">
          <Typography variant={"h4"} fontWeight={700} color="secondary.main">
            This diamond has been canceled
          </Typography>
          <Typography fontSize={20} mt={2}>
            {detail.cancelReason}
          </Typography>
        </Box>
      )}

      {assessState.current !== "CANCEL" &&
        assessState.current !== "PENDING" && (
          <DiamondValuationAssessment
            diamondInfor={diamondInfor}
            setDiamondInfor={setDiamondInfor}
            clarities={clarities}
            handleClarities={handleClarities}
          />
        )}

      {assessState.current !== "CANCEL" &&
        (assessState.current === "ASSESSED" ||
          assessState.current === "VALUATING" ||
          assessState.current === "VALUATED" ||
          assessState.current === "APPROVED") &&
        role === Role.MANAGER && (
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
