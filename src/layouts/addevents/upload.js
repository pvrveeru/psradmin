import React, { useState, useEffect } from "react";
import { TextField, Button, CircularProgress, Card, CardMedia, CardActions } from "@mui/material";
import PropTypes from "prop-types";
import api from "../api";
import LayoutImage from "./layoutImage";
import Gallery from "./gallery";

const Upload = ({ eventId, thumbUrl, layoutImageUrl, galleryImages }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // Store all uploaded image URLs

  const inputStyle = { margin: "10px", width: "100%" };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const fetchImages = async () => {
    const token = localStorage.getItem("userToken"); // Retrieve token from storage
    setLoading(true);
    try {
      const response = await api.get(`/uploads/event/thumbnail/${eventId}`, {
        headers: {
          Accept: "application/json",
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

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const token = localStorage.getItem("userToken"); // Retrieve token from storage
    const formData = new FormData();
    formData.append("image", selectedFile, selectedFile.name);

    const requestOptions = {
      headers: {
        "Content-Type": "multipart/form-data", // Make sure to set the content type for file upload
        Authorization: `Bearer ${token}`,
      },
    };

    setLoading(true);
    try {
      const response = await api.post(
        `/uploads/event/thumbnail/${eventId}`,
        formData,
        requestOptions
      );
      if (response.status === 200) {
        alert("Images uploaded successfully.");
        await fetchImages();
        // Append newly uploaded images to the existing ones
        setImages((prevImages) => [
          ...prevImages,
          ...(Array.isArray(response.data.images) ? response.data.images : []),
        ]);
      } else {
        console.error("Failed to upload images", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
      //alert(`Failed to upload image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (url) => {
    setLoading(true);
    const fileName = url.split("/").pop(); // This will get the last part of the URL (the file name)
    const token = localStorage.getItem("userToken"); // Retrieve token from storage
    try {
      const response = await api.delete(`/uploads/event/thumbnail/${eventId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        alert("Image deleted successfully.");
        await fetchImages();
        setImages((prevImages) => prevImages.filter((image) => image !== url)); // Remove deleted image locally
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
    if (eventId) {
      fetchImages();
    }
  }, [eventId]);

  return (
    <div>
      {/* File upload section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3>Upload thumbnail</h3>
        <TextField
          name="thumbnail"
          type="file"
          accept="image/*"
          style={inputStyle}
          InputLabelProps={{ shrink: true }}
          inputProps={{ accept: "image/*" }}
          onChange={handleFileChange}
        />
        <Button
          variant="contained"
          style={{ backgroundColor: "#25266d", color: "#fff" }}
          onClick={handleFileUpload}
          disabled={loading || !selectedFile}
        >
          {loading ? <CircularProgress size={24} style={{ color: "#fff" }} /> : "Upload Image"}
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
      <LayoutImage eventId={eventId} thumbUrl={thumbUrl} layoutImageUrl={layoutImageUrl} />
      <Gallery
        eventId={eventId}
        thumbUrl={thumbUrl}
        layoutImageUrl={layoutImageUrl}
        galleryImages={galleryImages}
      />
    </div>
  );
};

Upload.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  thumbUrl: PropTypes.string, // Accept thumbUrl as a prop
  layoutImageUrl: PropTypes.string, // Accept thumbUrl as a prop
  galleryImages: PropTypes.arrayOf(PropTypes.string), // Expect an array of strings (URLs)
};

export default Upload;
