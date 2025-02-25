import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { login } from "../../redux/authSlice.js";
import { clearMessage } from "../../redux/messageSlide.js";
import Role from "../../utilities/Role.js";
import UICircularIndeterminate from "../UI/CircularIndeterminate.jsx";
import ForgotPasswordDialog from "./ForgotPassword.jsx"; // Import the Forgot Password dialog component

export default function AuthSignIn() {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { message } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearMessage());
  }, [dispatch]);

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleLogin = async (formValue) => {
    const { username, password } = formValue;
    setLoading(true);
    const response = await dispatch(login({ username, password }));
    const user = response.payload.user;
    if (user) {
      let roleBasedLink = "";
      switch (user?.account.role) {
        case Role.ADMIN:
          roleBasedLink = "/";
          break;
        case Role.MANAGER:
          roleBasedLink = "/";
          break;
        case Role.CONSULTANT:
          roleBasedLink = "/requests";
          break;
        case Role.VALUATION:
          roleBasedLink = "/valuations";
          break;
        default:
          roleBasedLink = "/";
          break;
      }
      navigate(`${roleBasedLink}`, { replace: true });
    } else {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleLogin,
  });

  const handleForgotPasswordClick = () => {
    setForgotPasswordOpen(true); // Open the Forgot Password dialog
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            fullWidth
            id="username"
            type="text"
            name="username"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {loading && <UICircularIndeterminate color={"secondary"} />}
            Sign In
          </Button>
          {/*<Grid container>*/}
          {/*  <Grid item xs>*/}
          {/*    <Link href="#" variant="body2" onClick={handleForgotPasswordClick}>*/}
          {/*      Forgot password?*/}
          {/*    </Link>*/}
          {/*  </Grid>*/}
          {/*</Grid>*/}
        </Box>
        {message && <Typography color={"secondary"}>{message}</Typography>}
      </Box>
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Container>
  );
}
