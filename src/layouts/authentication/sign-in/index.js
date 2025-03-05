import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import api from "../../api";
import logo from "assets/images/logo.png";

function Basic() {
  const [username, setUsername] = useState(""); // Update variable name for consistency
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // State for error message
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate(); // Initialize navigate hook

  // Handle sign-in with API integration
  const handleSignIn = async () => {
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true); // Set loading state
      setError(""); // Clear any previous errors

      const response = await api.post(`/admin/login`, {
        username: username,
        password: password,
      });

      if (response.data.status === "success") {
        const token = response.data.data.token;

        // Store the token in localStorage
        localStorage.setItem("userToken", token);

        // Navigate to the dashboard
        navigate("/works");
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Login failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            <img
              src={logo}
              alt="PIO Logo"
              style={{
                width: "190px",
                marginRight: "8px", // Add spacing between logo and text
              }}
            />
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={(e) => e.preventDefault()}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="User Name"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            {error && (
              <MDTypography color="error" variant="caption" display="block" mt={2}>
                {error}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
