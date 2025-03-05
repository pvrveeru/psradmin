import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TablePagination } from "@mui/material";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { saveAs } from "file-saver";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import CircularProgress from "@mui/material/CircularProgress";
import { TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useNavigate } from "react-router-dom";
import MDButton from "components/MDButton";
import api from "../api";
import { debounce } from "lodash";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import "../styles.css"; // Import the CSS file
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { EventRepeat } from "@mui/icons-material";
// Extend dayjs with required plugins
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.extend(advancedFormat);

function FinanceReports() {
  const [startDate, setStartDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [endDate, setEndDate] = useState(dayjs()); // Current date
  const [totalRepots, setTotalReports] = useState(0); // Added to track total bookings
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const navigate = useNavigate();

  const [isEventIdDisabled, setIsEventIdDisabled] = useState(false);
  const [isDateDisabled, setIsDateDisabled] = useState(false);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/authentication/sign-in/");
        return;
      }

      const url = `/events/dropdown?sortBy=createdAt&sortOrder=asc&limit=100&offset=0`;

      try {
        const response = await api.get(url, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Full API Response:", response.data);

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

    let url = "";

    if (selectedEventId) {
      // Search by event ID
      url = `/payment-details/financeReports?eventId=${selectedEventId}&sortBy=createdAt&sortOrder=asc&limit=10&offset=0`;
    } else if (startDate && endDate) {
      // Search by date range
      const formattedStartDate = startDate.format("YYYY-MM-DD");
      const formattedEndDate = endDate.format("YYYY-MM-DD");
      url = `/payment-details/financeReports?startDate=${formattedStartDate}&endDate=${formattedEndDate}&sortBy=createdAt&sortOrder=asc&limit=10&offset=0`;
    } else {
      console.error("Please select either an event or a date range.");
      return;
    }

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`, // Token applied to all requests
        },
      });

      const { events, totalNoOfRecords } = response.data.data;
      setTableData(events); // Update table data
      setTotalReports(totalNoOfRecords); // Update total bookings count
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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

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
                  <h2>Finance Reports</h2>
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
                <MDBox mt={3}>
                  <>
                    <MDBox mt={2} display="flex" justifyContent="center">
                      <TableContainer
                        component={Paper}
                        style={{ borderRadius: "0px", boxShadow: "none" }}
                      >
                        {tableData?.length > 0 ? (
                          <>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "16px",
                              }}
                            >
                              <thead style={{ background: "#efefef", fontSize: "14px" }}>
                                <tr>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event ID
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Name
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Date
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Tickets
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Enrolments
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Payments
                                  </th>
                                </tr>
                              </thead>
                              <tbody style={{ fontSize: "15px" }}>
                                {tableData.map((event) => (
                                  <tr key={event.eventId}>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {event.eventId}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {event.title}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {new Date(event.eventDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {event.totalCapacity}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {Array.isArray(event.seatingDetails) ? (
                                        <ul style={{ listStyle: "none" }}>
                                          {event.seatingDetails.map((detail, index) => (
                                            <li key={index}>
                                              {detail.zoneName} - {detail.ticketsBooked}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        "N/A"
                                      )}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {event.eventPayments}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <TablePagination
                              rowsPerPageOptions={[10, 25, 50, 100]}
                              component="div"
                              count={totalRepots}
                              rowsPerPage={rowsPerPage}
                              page={page}
                              onPageChange={(event, newPage) => setPage(newPage)}
                              onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                            <FormControl
                              variant="outlined"
                              sx={{
                                minWidth: 120,
                                position: "absolute",
                                marginTop: "-30px",
                              }}
                            >
                              <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
                              <Select
                                labelId="rows-per-page-label"
                                value={rowsPerPage}
                                onChange={handleChangeRowsPerPage}
                                label="Rows per page"
                                style={{ height: "36px", fontSize: "16px" }}
                              >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                              </Select>
                            </FormControl>
                          </>
                        ) : (
                          <p style={{ textAlign: "center", margin: "20px 0" }}>
                            No finance data available
                          </p>
                        )}
                      </TableContainer>
                    </MDBox>
                  </>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default FinanceReports;
