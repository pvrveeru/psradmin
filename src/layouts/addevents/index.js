//event create page

import React, { useState, useEffect } from "react";
import {
  TextField,
  Grid,
  Card,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Accordion,
  TableContainer,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import "../styles.css"; // Custom styles
import api from "../api";
import Seating from "./seating";
import Upload from "./upload";
import Payments from "./payments";

const AddEvents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId || null;
  //const { eventId } = useParams();
  const [thumbUrl, setThumbUrl] = useState(""); // Add state for thumbUrl
  const [layoutImageUrl, setLayoutImageUrl] = useState(""); // Add state for thumbUrl
  const [galleryImages, setgalleryImages] = useState(""); // Add state for thumbUrl

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    uniqueEventId: "",
    startDate: "",
    endDate: "",
    eventDate: "",
    duration: "",
    ageLimit: "",
    location: "",
    city: "",
    state: "",
    artistName: "",
    language: "",
    description: "",
    brief: "",
    latitude: "",
    longitude: "",
    totalCapacity: "",
    tnc: "",
    maxTicketAllowed: "",
    status: "",
    stage: "",
    layoutStatus: "",
    musicType: "",
    isPopular: false,
    isFeatured: false,
    isManual: false,
  });

  const [loading, setLoading] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    console.log(name, checked, Boolean(checked)); // Logs the name, checked value, and its boolean conversion
    setFormData({ ...formData, [name]: checked });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "thubImage") {
      setFormData({ ...formData, thubImage: files[0] });
    } else if (name === "multiIMages") {
      setFormData({ ...formData, multiIMages: Array.from(files) });
    }
  };

  const validateForm = () => {
    const requiredFields = ["title", "startDate", "endDate", "categoryId"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the ${field} field.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("userToken"); // Retrieve token from storage
    setLoading(true);

    try {
      const response = await api.post("/events", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Ensure correct content type
        },
      });

      alert("Event created successfully");
      navigate("/events");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEventTypes = async () => {
      const token = localStorage.getItem("userToken"); // Retrieve token from storage
      try {
        const response = await api.get("/event-category", {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });
        console.log("Event types data:", response.data); // Check the format of the response

        // Extract categories from the nested response
        const categories = response.data?.data?.categories;

        if (Array.isArray(categories)) {
          setEventTypes(categories); // Set categories if it's a valid array
        } else {
          console.error("Event types data is not an array:", response.data);
          setEventTypes([]); // Fallback to an empty array if invalid
        }
      } catch (error) {
        console.error("Error fetching event types:", error);
        setEventTypes([]); // Fallback to an empty array on error
      }
    };

    fetchEventTypes();
  }, []);

  useEffect(() => {
    if (eventId) {
      const fetchEventData = async () => {
        const token = localStorage.getItem("userToken"); // Retrieve token from storage
        try {
          const response = await api.get(`/events/${eventId}`, {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the headers
            },
          });
          const data = response.data.data;
          console.log(data);
          setFormData({
            categoryId: data.categoryId?.categoryId || "", // Set the category name here
            title: data.title || "",
            uniqueEventId: data.uniqueEventId || "",
            stage: data.stage || "",
            layoutStatus: data.layoutStatus || "",
            musicType: data.musicType || "",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            eventDate: data.eventDate || "",
            duration: data.duration || "",
            ageLimit: data.ageLimit || "",
            location: data.location || "",
            city: data.city || "",
            state: data.state || "",
            artistName: data.artistName || "",
            language: data.language || "",
            description: data.description || "",
            brief: data.brief || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            maxTicketAllowed: data.maxTicketAllowed || "",
            totalCapacity: data.totalCapacity || "",
            tnc: data.tnc || "",
            status: data.status || "",
            isPopular: data.isPopular || false,
            isFeatured: data.isFeatured || false,
            isManual: data.isManual || false,
          });
          setThumbUrl(data.thumbUrl || ""); // Set thumbUrl separately
          setLayoutImageUrl(data.layoutImageUrl || "");
          setgalleryImages(data.galleryImages || []);
        } catch (error) {
          console.error("Error fetching event data:", error);
        }
      };

      fetchEventData();
    }
  }, [eventId]);

  const updateEvent = async () => {
    const token = localStorage.getItem("userToken"); // Retrieve token from storage
    setLoading(true);

    try {
      await api.put(`/events/${eventId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      });
      alert("Event updated successfully");
      //navigate("/events");
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "45%", margin: "10px 25px", lineHeight: "44px" };
  const inputZone = { width: "30%", margin: "10px 25px", lineHeight: "44px" };
  const selectStyle = { width: "45%", margin: "10px 25px", padding: "10px", height: "45px" };
  const fullWidthInputStyle = { width: "94%", margin: "10px 25px" };
  const cancelButton = { backgroundColor: "#ef3f2c", color: "#fff", margin: "10px" };
  const submitButton = { backgroundColor: "#25266d", color: "#fff", margin: "10px" };

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card style={{ paddingBottom: "20px" }}>
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
                    <Grid item xs={12}>
                      <h2>Add Events</h2>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <Accordion style={{ border: "1px solid #ddd" }} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Event Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDBox>
                      <MDBox style={{ display: "flex" }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isPopular}
                              onChange={handleCheckboxChange}
                              name="isPopular"
                            />
                          }
                          label="Popular Event"
                          style={inputStyle}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isFeatured}
                              onChange={handleCheckboxChange}
                              name="isFeatured"
                            />
                          }
                          label="Featured Event"
                          style={inputStyle}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.isManual}
                              onChange={handleCheckboxChange}
                              name="isManual"
                            />
                          }
                          label="Manual Ticket"
                          style={inputStyle}
                        />
                      </MDBox>
                      <h3>Event Info</h3>
                      <hr></hr>
                      <Select
                        name="categoryId"
                        style={inputStyle}
                        value={formData.categoryId || ""} // Ensure it defaults to an empty string
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            [event.target.name]: event.target.value, // Correctly updates categoryId
                          }))
                        }
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Event Category
                        </MenuItem>
                        {eventTypes && Array.isArray(eventTypes) && eventTypes.length > 0 ? (
                          eventTypes.map((category) => (
                            <MenuItem key={category.categoryId} value={category.categoryId}>
                              {category.categoryName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No Event Types Available</MenuItem>
                        )}
                      </Select>

                      <TextField
                        name="title"
                        label="Event Name"
                        style={inputStyle}
                        value={formData.title}
                        onChange={handleInputChange}
                      />
                      <TextField
                        name="uniqueEventId"
                        label="Unique Event ID"
                        style={inputStyle}
                        value={formData.uniqueEventId}
                        onChange={handleInputChange}
                      />
                      <h3>Event Date</h3>
                      <hr></hr>
                      <TextField
                        name="startDate"
                        label="Event Start Date"
                        type="text"
                        style={inputStyle}
                        placeholder="yyyy-MM-DD HH:MM"
                        value={formData.startDate ? formData.startDate.slice(0, 16) : ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        name="endDate"
                        label="Event End Date"
                        //type="datetime-local"
                        type="text"
                        style={inputStyle}
                        placeholder="yyyy-MM-DD HH:MM"
                        value={formData.endDate ? formData.endDate.slice(0, 16) : ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />

                      <TextField
                        name="eventDate"
                        label="Event Date"
                        //type="date"
                        type="text"
                        placeholder="yyyy-MM-DD"
                        style={inputStyle}
                        value={formData.eventDate ? formData.eventDate.slice(0, 10) : ""}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                      />
                      <Select
                        name="duration"
                        style={selectStyle}
                        value={formData.duration || ""} // Default to empty string
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Duration
                        </MenuItem>
                        <MenuItem value="1 hour">1 hour</MenuItem>
                        <MenuItem value="2 hours">2 hours</MenuItem>
                        <MenuItem value="3 hours">3 hours</MenuItem>
                        <MenuItem value="Half day">Half day</MenuItem>
                        <MenuItem value="Full day">Full day</MenuItem>
                      </Select>

                      <h3>Event Stage Info</h3>
                      <hr></hr>

                      <Select
                        name="stage"
                        style={selectStyle}
                        value={formData.stage}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Stage
                        </MenuItem>
                        <MenuItem value="Outdoor">Outdoor</MenuItem>
                        <MenuItem value="Indoor">Indoor</MenuItem>
                      </Select>

                      <Select
                        name="layoutStatus"
                        style={selectStyle}
                        value={formData.layoutStatus}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Event Layout Status
                        </MenuItem>
                        <MenuItem value="Seated">Seated</MenuItem>
                        <MenuItem value="Standing">Standing</MenuItem>
                        <MenuItem value="Seated Standing">Seated & Standing</MenuItem>
                        <MenuItem value="Run">Run</MenuItem>
                      </Select>

                      <Select
                        name="ageLimit"
                        style={selectStyle}
                        value={formData.ageLimit || ""} // Default to empty string
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Age Limit
                        </MenuItem>
                        <MenuItem value="All Ages">All Ages</MenuItem>
                        <MenuItem value="18+">5+</MenuItem>
                        <MenuItem value="18+">10+</MenuItem>
                        <MenuItem value="18+">18+</MenuItem>
                        <MenuItem value="21+">21+</MenuItem>
                        <MenuItem value="No Limit">No Limit</MenuItem>
                      </Select>

                      <TextField
                        name="totalCapacity"
                        label="No Tickets"
                        style={inputStyle}
                        value={formData.totalCapacity}
                        onChange={handleInputChange}
                      />

                      <TextField
                        name="maxTicketAllowed"
                        label="Max Allowed"
                        style={inputStyle}
                        value={formData.maxTicketAllowed}
                        onChange={handleInputChange}
                      />

                      <h3>Event Venue Info</h3>
                      <hr></hr>

                      <TextField
                        name="location"
                        label="Event Venue"
                        style={inputStyle}
                        value={formData.location}
                        onChange={handleInputChange}
                      />
                      <Select
                        name="city"
                        style={selectStyle}
                        value={formData.city}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select City
                        </MenuItem>
                        <MenuItem value="Visakhapatnam">Visakhapatnam</MenuItem>
                        <MenuItem value="Vijayawada">Vijayawada</MenuItem>
                        <MenuItem value="Tirupati">Tirupati</MenuItem>
                        <MenuItem value="Anantapur">Anantapur</MenuItem>
                        <MenuItem value="Amaravati">Amaravati</MenuItem>
                        <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                        <MenuItem value="Warangal">Warangal</MenuItem>
                        <MenuItem value="Bengaluru">Bengaluru</MenuItem>
                        <MenuItem value="Mysuru">Mysuru</MenuItem>
                        <MenuItem value="Mangaluru">Mangaluru</MenuItem>
                        <MenuItem value="Chennai">Chennai</MenuItem>
                        <MenuItem value="Kochi">Kochi</MenuItem>
                        <MenuItem value="Pune">Pune</MenuItem>
                        <MenuItem value="Mumbai">Mumbai</MenuItem>
                      </Select>
                      <Select
                        name="state"
                        style={selectStyle}
                        value={formData.state}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select State
                        </MenuItem>
                        <MenuItem value="Andhra Pradesh">Andhra Pradesh</MenuItem>
                        <MenuItem value="Telangana">Telangana</MenuItem>
                        <MenuItem value="Karnataka">Karnataka</MenuItem>
                        <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
                        <MenuItem value="Kerala">Kerala</MenuItem>
                        <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                      </Select>
                      <TextField
                        name="latitude"
                        label="Event Latitude"
                        style={inputStyle}
                        value={formData.latitude}
                        onChange={handleInputChange}
                      />
                      <TextField
                        name="longitude"
                        label="Event Longitude"
                        style={inputStyle}
                        value={formData.longitude}
                        onChange={handleInputChange}
                      />
                      <a
                        href="https://www.gps-coordinates.net/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "inline-block", marginTop: "15px", marginLeft: "25px" }}
                      >
                        Get latitude / longitude
                      </a>
                      <h3>Event Type Info</h3>
                      <hr></hr>

                      <TextField
                        name="artistName"
                        label="Artist Name"
                        style={inputStyle}
                        value={formData.artistName}
                        onChange={handleInputChange}
                      />
                      <Select
                        name="musicType"
                        style={selectStyle}
                        value={formData.musicType}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Music Type
                        </MenuItem>
                        <MenuItem value="Electronic Dance">Electronic Dance</MenuItem>
                        <MenuItem value="Rock">Rock</MenuItem>
                        <MenuItem value="Jazz">Jazz</MenuItem>
                        <MenuItem value="Dubstep">Dubstep</MenuItem>
                        <MenuItem value="Rhythm and Blues">Rhythm and Blues</MenuItem>
                        <MenuItem value="Techno">Techno</MenuItem>
                        <MenuItem value="Country">Country</MenuItem>
                        <MenuItem value="Electro">Electro</MenuItem>
                        <MenuItem value="Indie Rock">Indie Rock</MenuItem>
                        <MenuItem value="Pop">Pop</MenuItem>
                        <MenuItem value="Hip Hop">Hip Hop</MenuItem>
                        <MenuItem value="Classical">Classical</MenuItem>
                        <MenuItem value="Folk">Folk</MenuItem>
                        <MenuItem value="Disco">Disco</MenuItem>
                        <MenuItem value="Romantic">Romantic</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                        <MenuItem value="Metal">Metal</MenuItem>
                        <MenuItem value="Fusion">Fusion</MenuItem>
                        <MenuItem value="Instrumental">Instrumental</MenuItem>
                        <MenuItem value="Regional">Regional</MenuItem>
                        <MenuItem value="Hollywood">Hollywood</MenuItem>
                        <MenuItem value="Bollywood">Bollywood</MenuItem>
                        <MenuItem value="Tollywood">Tollywood</MenuItem>
                        <MenuItem value="Mollywood">Mollywood</MenuItem>
                        <MenuItem value="Sandalwood">Sandalwood</MenuItem>
                        <MenuItem value="Kollywood">Kollywood</MenuItem>
                        <MenuItem value="EDM">EDM</MenuItem>
                      </Select>
                      <Select
                        name="language"
                        style={selectStyle}
                        value={formData.language}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Select Language
                        </MenuItem>
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="Telugu">Telugu</MenuItem>
                        <MenuItem value="Tamil">Tamil</MenuItem>
                        <MenuItem value="Kannada">Kannada</MenuItem>
                        <MenuItem value="Malayalam">Malayalam</MenuItem>
                        <MenuItem value="Marathi">Marathi</MenuItem>
                        <MenuItem value="Bengali">Bengali</MenuItem>
                        <MenuItem value="Punjabi">Punjabi</MenuItem>
                      </Select>
                      <h3>Event Description</h3>
                      <hr></hr>
                      <TextField
                        name="description"
                        label="Event Full Info"
                        style={fullWidthInputStyle}
                        value={formData.description}
                        multiline
                        rows={4}
                        onChange={handleInputChange}
                      />
                      <TextField
                        name="brief"
                        label="Event Short Info"
                        style={fullWidthInputStyle}
                        value={formData.brief}
                        multiline
                        rows={3}
                        onChange={handleInputChange}
                      />
                      <TextField
                        name="tnc"
                        label="Terms and Conditions"
                        style={fullWidthInputStyle}
                        value={formData.tnc}
                        multiline
                        rows={3}
                        onChange={handleInputChange}
                      />

                      <Select
                        name="status"
                        style={selectStyle}
                        value={formData.status}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Event Status
                        </MenuItem>
                        <MenuItem value="Draft">Draft</MenuItem>
                        <MenuItem value="Published">Published</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                      <MDBox
                        style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}
                      >
                        <Button
                          variant="contained"
                          style={cancelButton}
                          onClick={() => navigate("/events")}
                        >
                          Cancel
                        </Button>
                        {eventId ? (
                          <Button
                            variant="contained"
                            style={submitButton}
                            onClick={updateEvent}
                            disabled={loading}
                          >
                            {loading ? "Updating..." : "Update"}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            style={submitButton}
                            onClick={handleSubmit}
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit"}
                          </Button>
                        )}
                      </MDBox>
                    </MDBox>
                  </AccordionDetails>
                </Accordion>
              </MDBox>
              {eventId && (
                <MDBox pt={3} px={2}>
                  <Accordion style={{ border: "1px solid #ddd" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Event Seating Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Seating eventId={eventId} />
                    </AccordionDetails>
                  </Accordion>
                </MDBox>
              )}

              {eventId && (
                <MDBox pt={3} px={2}>
                  <Accordion style={{ border: "1px solid #ddd" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Event Images</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Upload
                        eventId={eventId}
                        thumbUrl={thumbUrl}
                        layoutImageUrl={layoutImageUrl}
                        galleryImages={galleryImages}
                      />
                    </AccordionDetails>
                  </Accordion>
                </MDBox>
              )}
              {eventId && (
                <MDBox pt={3} px={2}>
                  <Accordion style={{ border: "1px solid #ddd" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Event Payments</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Payments eventId={eventId} />
                    </AccordionDetails>
                  </Accordion>
                </MDBox>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default AddEvents;
