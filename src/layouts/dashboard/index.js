import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { saveAs } from "file-saver";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDButton from "components/MDButton";
import api from "../api";
import "../styles.css"; // Import the CSS file
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rows, setRows] = useState([]);
  const [rdata, setRdata] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [encodedFlightNumber, setEncodedFlightNumber] = useState(""); // New state for encoded flight number
  const [isEventIdDisabled, setIsEventIdDisabled] = useState(false);
  const [isDateDisabled, setIsDateDisabled] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [events, setEvents] = useState([]);

  const [summaryData, setSummaryData] = useState({
    totalBookings: 0,
    users: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/authentication/sign-in/");
        return;
      }

      const url = `/assignor`;

      try {
        const response = await api.get(url, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });

        const eventData = response.data.data;
        if (Array.isArray(eventData)) {
          setEvents(eventData);
          console.log("Events State after setting:", eventData);
        } else {
          console.error("Data format is not an array:", eventData);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
    setIsDateDisabled(false);
    setStartDate();
    setEndDate();
  }, []);

  const handleSelectChange = (event) => {
    setSelectedEventId(event.target.value);
    if (event.target.value) {
      setIsDateDisabled(true);
      setStartDate(null);
      setEndDate(null);
    } else {
      setIsDateDisabled(false);
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      setIsEventIdDisabled(true);
      setSelectedEventId("");
    } else {
      setIsEventIdDisabled(false);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (date) {
      setIsEventIdDisabled(true);
      setSelectedEventId("");
    } else {
      setIsEventIdDisabled(false);
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const headers = {
      Accept: "*/*",
      Authorization: `Bearer ${token}`,
    };

    try {
      let url = "";
      if (selectedEventId) {
        url = `/admin/getSummaryData?eventId=${selectedEventId}&sortBy=createdAt&sortOrder=asc&limit=10&offset=0`;
      } else if (startDate && endDate) {
        const formattedStartDate = startDate.format("YYYY-MM-DD");
        const formattedEndDate = endDate.format("YYYY-MM-DD");
        url = `/admin/getSummaryData?startDate=${formattedStartDate}&endDate=${formattedEndDate}&sortBy=createdAt&sortOrder=asc&limit=10&offset=0`;
      } else {
        console.error("Please select either an event or a date range.");
        return;
      }

      const response = await api.get(url, { headers });

      if (response.data && response.data.data) {
        setSummaryData(response.data.data);
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleClearSearch = () => {
    setSelectedEventId(""); // Reset the selected event
    setStartDate(null); // Clear the start date
    setEndDate(null); // Clear the end date
    setTableData([]); // Clear the table data (optional, if you want to clear the results)
    setIsEventIdDisabled();
    setEndDate();
    setStartDate();
  };

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
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
                <h2>Dashboard Reports</h2>
              </MDTypography>
            </MDBox>
            <MDBox pt={3} px={2}>
              <Card style={{ backgroundColor: "#f6f0f0" }}>
                <MDBox p={3}>
                  <Grid container spacing={2}>
                    <b style={{ lineHeight: "60px", marginLeft: "10px" }}>Search by</b>
                    <Grid item xs={12} sm={2}>
                      <Select
                        fullWidth
                        displayEmpty
                        variant="outlined"
                        value={selectedEventId}
                        onChange={handleSelectChange}
                        disabled={isEventIdDisabled}
                        style={{
                          border: "1px solid #ccc",
                          lineHeight: "40px",
                          boxShadow: "none",
                        }}
                        defaultValue=""
                      >
                        <MenuItem value="">
                          <em>Select an Event</em>
                        </MenuItem>
                        {events.map((event) => (
                          <MenuItem key={event.eventId} value={event.eventId}>
                            {event.title}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          renderInput={(params) => <TextField fullWidth {...params} />}
                          disabled={isDateDisabled}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={handleEndDateChange}
                          renderInput={(params) => <TextField fullWidth {...params} />}
                          disabled={isDateDisabled}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={1} style={{ display: "flex" }}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={handleSearch}
                        style={{ marginRight: "10px" }}
                      >
                        Search
                      </MDButton>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={handleClearSearch}
                      >
                        Clear
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </MDBox>
          </Card>
        </Grid>
        <Grid item xs={12} py={5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="weekend"
                  title="Bookings"
                  count={summaryData.totalBookings}
                  percentage={{
                    color: "success",
                    amount: "+55%", // Adjust as needed or calculate dynamically
                    label: "than last week",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Today's Users"
                  count={summaryData.users}
                  percentage={{
                    color: "success",
                    amount: "+3%", // Adjust as needed or calculate dynamically
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Revenue"
                  count={`$${summaryData.totalRevenue}`}
                  percentage={{
                    color: "success",
                    amount: "+1%", // Adjust as needed or calculate dynamically
                    label: "than yesterday",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
