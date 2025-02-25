import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";
import { getDownloadURL, ref as loadImageRef } from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Margin, Resolution, usePDF } from "react-to-pdf";
import logo from "../../../assets/images/logo.png";
import { getValuationRequest } from "../../../services/api.js";
import { storage } from "../../../services/config/firebase.js";

import { formattedDate, formattedMoney } from "../../../utilities/formatter.js";
import { clarityCharacteristicConverter } from "../../../utilities/Status.jsx";
import UICircularIndeterminate from "../../UI/CircularIndeterminate.jsx";

const RecordScreenResult = () => {
  const { requestId } = useParams();

  // Image Links
  const [proportionImages, setProportionImages] = useState([]);
  const [clarityCharacteristicImages, setClarityCharacteristicImages] =
    useState([]);

  // PDF render
  const options = {
    // default is `save`
    filename: "ahi.pdf",
    method: "open",
    // default is Resolution.MEDIUM = 3, which should be enough, higher values
    // increases the image quality but also the size of the PDF, so be careful
    // using values higher than 10 when having multiple pages generated, it
    // might cause the page to crash or hang.
    resolution: Resolution.HIGH,
    page: {
      // margin is in MM, default is Margin.NONE = 0
      margin: Margin.SMALL,
      // default is 'A4'
      format: "letter",
      // default is 'portrait'
      orientation: "portrait",
    },
    canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: "image/png",
      qualityRatio: 1,
    },
    // Customize any value passed to the jsPDF instance and html2canvas
    // function. You probably will not need this and things can break,
    // so use with caution.
    overrides: {
      // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
      pdf: {
        compress: true,
      },
      // see https://html2canvas.hertzen.com/configuration for more options
      canvas: {
        useCORS: true,
      },
    },
  };
  const { toPDF, targetRef } = usePDF(options);

  const { data: request, isLoading: isValuationRequestLoading } = useQuery({
    queryKey: ["request", { requestId: requestId }],
    queryFn: () => getValuationRequest(requestId),
    select: (data) => {
      return {
        ...data,
        valuationRequestDetails: data?.valuationRequestDetails.filter(
          (item) => item.status === "APPROVED",
        ),
      };
    },
  });

  const loadImage = async (imagePath, setLink) => {
    const imageRef = loadImageRef(storage, imagePath);
    try {
      const url = await getDownloadURL(imageRef);
      setLink((prev) => [...prev, url]);
    } catch (error) {
      console.error("Error loading image by path:", error);
    }
  };
  const valuationRequestDetails = request?.valuationRequestDetails;

  useEffect(() => {
    if (proportionImages.length === 0 && valuationRequestDetails !== null) {
      for (let i = 0; i < valuationRequestDetails?.length; i++) {
        loadImage(
          valuationRequestDetails[i].diamondValuationNote.proportions,
          setProportionImages,
        );
      }
    }
    if (
      clarityCharacteristicImages.length === 0 &&
      valuationRequestDetails !== null
    ) {
      for (let i = 0; i < valuationRequestDetails?.length; i++) {
        loadImage(
          valuationRequestDetails[i].diamondValuationNote
            .clarityCharacteristicLink,
          setClarityCharacteristicImages,
        );
      }
    }
  }, [valuationRequestDetails]);

  const isValuated =
    request?.status === "COMPLETED" ||
    request?.status === "SEALED" ||
    request?.status === "FINISHED";
  if (!isValuated) {
    return (
      <Typography>
        This request is not valuated. Please back to valuate it
      </Typography>
    );
  }

  if (isValuationRequestLoading) {
    return <UICircularIndeterminate />;
  }
  return (
    <div>
      <div>
        <Stack direction="row" spacing={1}>
          <div
            onClick={() => {
              toPDF();
            }}
          >
            <IconButton color="primary" aria-label="download">
              <DownloadIcon />
            </IconButton>
          </div>
          <IconButton color="secondary" aria-label="upload">
            <FileUploadIcon />
          </IconButton>
          <IconButton color="primary" aria-label="view">
            <VisibilityIcon />
          </IconButton>
        </Stack>
      </div>
      <div ref={targetRef}>
        {valuationRequestDetails?.map((item, index) => (
          <main
            key={item.id}
            className="mt-24 flex w-full flex-col text-slate-800 h-[161vh]"
          >
            <div className="mb-2 flex flex-row items-center justify-center">
              <img src={logo} alt={"H&T Diamond"} className="h-20 w-auto" />
            </div>
            <h1 className="text-center text-2xl text-slate-800">H&T Diamond</h1>
            <p className="pt-1 text-center text-slate-400 h-[35px]">
              Valuation #{item.id}
            </p>
            <div className="flex-grow rounded-2xl rounded-t-none bg-white p-12 shadow-xl shadow-black/10">
              <div className="">
                {/*<div className="my-4 h-px bg-gray-300" />*/}
                <div>
                  <p className="mb-1 p-0">
                    <b>Diamond Attribute</b>
                  </p>
                  <div className="flex gap-10">
                    <div className="flex w-1/2">
                      <div className="w-1/2">
                        <p className="mb-1 p-0">Certificate Id</p>
                        <p className="mb-1 p-0">Certificate Date</p>
                        <p className="mb-1 p-0">Diamond Origin</p>
                        <p className="mb-1 p-0">Carat</p>
                        <p className="mb-1 p-0">Color</p>
                        <p className="mb-1 p-0">Clarity</p>
                        <p className="mb-1 p-0">Cut</p>
                        <p className="mb-1 p-0">Shape</p>
                        <p className="mb-1 p-0">Polish</p>
                        <p className="mb-1 p-0">Symmetry</p>
                        <p className="mb-1 p-0">Fluorescence</p>
                        <p className="mb-1 p-0">Clarity Characteristics</p>
                      </div>
                      <div className="w-1/2 text-right">
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.certificateId}
                        </p>
                        <p className="mb-1 p-0">
                          {formattedDate(
                            item.diamondValuationNote.certificateDate,
                          )}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.diamondOrigin}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.caratWeight}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.color}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.clarity}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.cut}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.shape}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.polish}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.symmetry}
                        </p>
                        <p className="mb-1 p-0">
                          {item.diamondValuationNote.fluorescence}
                        </p>
                        <p className="mb-1 p-0">
                          {clarityCharacteristicConverter(
                            item.diamondValuationNote.clarityCharacteristic,
                          )
                            .map((item) => item.label)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="w-1/2">
                      <div className="">
                        <img
                          src={proportionImages[index]}
                          alt={"Proportion"}
                          loading="lazy"
                          style={{
                            height: "auto",
                            width: "100%",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      {/*<div className="">*/}
                      {/*  <img*/}
                      {/*    src="https://stonealgo-cert.b-cdn.net/img/img_prop-53d827c57a7a0d79f823a43c226fca6b.jpg"*/}
                      {/*    alt="proportion"*/}
                      {/*    className="w-auto h-[150px]"*/}
                      {/*  />*/}
                      {/*</div>*/}
                    </div>
                  </div>
                </div>
                <div className="my-4 h-px bg-gray-300" />
                <div>
                  <div>
                    <img
                      src={clarityCharacteristicImages[index]}
                      alt={"Clarity Characteristic"}
                      loading="lazy"
                      style={{
                        height: "auto",
                        width: "70%",
                        objectFit: "cover",
                        cursor: "pointer",
                        margin: "0 auto",
                      }}
                    />
                    <Grid container spacing={0.5} justifyContent="center">
                      {clarityCharacteristicConverter(
                        item.diamondValuationNote.clarityCharacteristic,
                      ).map((clarity, index) => {
                        return (
                          <Grid key={clarity.code} item>
                            <Stack
                              direction="row"
                              sx={{
                                alignItems: "center",
                                height: 30,
                                gap: 0.5,
                                border: "1px solid #e0e0e0",
                                p: 1,
                              }}
                            >
                              <img
                                src={clarity.image}
                                alt={clarity.label}
                                style={{
                                  width: "auto",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                              <Typography sx={{ color: "gray" }}>
                                {clarity.label}
                              </Typography>
                            </Stack>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </div>

                  {/*
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ justifyContent: "space-evenly", mt: 1 }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        height: 30,
                        p: "2px",
                      }}
                    >
                      <img
                        src={CrystalImage}
                        alt="Crystal"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <Typography sx={{ color: "gray" }}>Crystal</Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", height: 30, p: "2px" }}
                    >
                      <img
                        src={FeatherImage}
                        alt="Feather"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <Typography sx={{ color: "gray", pl: 2 }}>
                        Feather
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", height: 30, p: "2px" }}
                    >
                      <img
                        src={NeedleImage}
                        alt="Needle"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <Typography sx={{ color: "gray", pl: 1 }}>
                        Needle
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", height: 30, p: "2px" }}
                    >
                      <img
                        src={PinpointImage}
                        alt="Pinpoint"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <Typography sx={{ color: "gray" }}>Pinpoint</Typography>
                    </Stack>
                  </Stack>
                  */}
                </div>

                <div className="my-4 h-px bg-gray-300" />
              </div>
              <div className="rounded-md bg-slate-100 px-6 py-2">
                <table className="w-full">
                  <tr className="font-bold text-slate-700">
                    <td className="py-4">Estimated Retail Replacement Value</td>
                    <td className="py-4">
                      {formattedMoney(item.valuationPrice)}
                    </td>
                  </tr>
                </table>
              </div>
              <hr className="my-6" />
              Diamonds are valued based on the 4Cs: Carat (weight), Clarity
              (clarity), Color, and Cut. This information helps determine the
              accurate value of your diamond. Please note that this value is for
              reference only and may change based on the market.
            </div>
          </main>
        ))}
      </div>
    </div>
  );
};

export default RecordScreenResult;
