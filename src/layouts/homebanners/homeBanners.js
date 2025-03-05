import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  TableContainer,
  Grid,
  Card,
  Paper,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { CircularProgress, CardMedia, CardActions } from "@mui/material";
import api from "../api";

const HomeBanners = () => {
  const [selectedFiles, setSelectedFiles] = useState([]); // To store selected files
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // To store fetched images

  const inputStyle = { margin: "10px", width: "100%" };

  // Fetch gallery images when the component mounts
  const fetchImages = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const url = `/uploads/bannerImages`;

    setLoading(true);
    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API Response:", response.data); // Log the full response to debug
      if (response.status === 200) {
        // Check if 'images' exists and is an array
        if (Array.isArray(response.data.images)) {
          setImages(response.data.images); // Set the fetched images
        } else {
          console.warn("Images data is not an array or is missing.");
          setImages([]); // Fallback to an empty array
        }
      } else {
        console.error("Failed to fetch images", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); // Get all selected files
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }

    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file, file.name);
    });

    const requestOptions = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    setLoading(true);
    try {
      const response = await api.post(`/uploads/bannerImages`, formData, requestOptions);
      if (response.status === 200) {
        alert("Images uploaded successfully.");
        await fetchImages();
        setImages((prevImages) => [
          ...prevImages,
          ...(Array.isArray(response.data.images) ? response.data.images : []),
        ]);
      } else {
        console.error("Failed to upload images", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    setLoading(true);
    const fileName = url.split("/").pop();

    try {
      const response = await api.delete(`/uploads/bannerImages/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert("Image deleted successfully.");
        setImages((prevImages) => prevImages.filter((image) => image !== url));
      } else {
        console.error("Failed to delete image", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={9}>
                      <h2>Home Banners</h2>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <TextField
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    style={inputStyle}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ accept: "image/*", multiple: true }} // Enable multiple file selection
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#25266d", color: "#fff" }}
                    onClick={handleFileUpload}
                    disabled={loading || selectedFiles.length === 0}
                  >
                    {loading ? (
                      <CircularProgress size={24} style={{ color: "#fff" }} />
                    ) : (
                      "Upload Images"
                    )}
                  </Button>
                </div>
                {/* Uploaded images list */}
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    {images.length > 0 ? (
                      images.map((url, index) => (
                        <Card
                          key={index}
                          style={{ width: "200px", position: "relative", marginBottom: "20px" }}
                        >
                          <CardMedia
                            component="img"
                            height="140"
                            image={url} // Use the image URL
                            alt={`Image ${index + 1}`}
                          />
                          <CardActions style={{ justifyContent: "center" }}>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteImage(url)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </Card>
                      ))
                    ) : (
                      <p>No images uploaded yet.</p>
                    )}
                  </div>
                </div>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default HomeBanners;
