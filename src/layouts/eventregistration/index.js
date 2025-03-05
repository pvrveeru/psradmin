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

function EventRegistration() {
  const [startDate, setStartDate] = useState(dayjs());
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0); // Added to track total bookings
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

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
  }, []);

  const handleSelectChange = (event) => {
    setSelectedEventId(event.target.value);
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const url = `/bookings?eventId=${selectedEventId}&search=${searchQuery}&sortBy=createdAt&sortOrder=asc&limit=${rowsPerPage}&offset=${
      page * rowsPerPage
    }`;

    if (!selectedEventId) return;
    setLoading(true);
    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      // Extracting bookings and total records
      const bookings = response.data.data.bookings;
      const totalNoOfRecords = response.data.data.totalNoOfRecords;

      setRows(bookings); // Update rows state with the bookings array
      setTotalBookings(totalNoOfRecords); // Update total bookings count
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRowsPerPageChange = (e) => setRowsPerPage(e.target.value);

  const handleSearch = debounce(() => {
    setPage(0); // Reset to the first page
    fetchBookings();
  }, 300); // Debounce search requests

  useEffect(() => {
    fetchBookings();
  }, [page, rowsPerPage]);

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
                  <h2>Event Registered Users</h2>
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

                      <Grid item xs={12} sm={1}>
                        <MDButton variant="gradient" color="info" fullWidth onClick={handleSearch}>
                          Search
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
                        {rows?.length > 0 ? (
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
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Phone Number
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Email Id
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Name
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Event Date
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Payment Date
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Payment Amount
                                  </th>
                                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    Transaction Id
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row) => (
                                  <tr key={row.bookingId}>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.bookingId}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.contactPersonFirstName} {row.contactPersonLastName}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.contactPersonPhone}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.contactPersonEmail}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.event.title}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {dayjs(row.event.event_date).format("DD-MM-YYYY")}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {dayjs(row.bookingDate).format("DD-MM-YYYY HH:mm:ss")}
                                    </td>
                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                      {row.paymentStatus}
                                    </td>
                                    <td
                                      style={{
                                        border: "1px solid #ddd",
                                        padding: "8px",
                                        cursor: "pointer",
                                        color: "blue",
                                      }}
                                      onClick={() => handleOpenDialog(row)}
                                    >
                                      {row.transactionId}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <TablePagination
                              rowsPerPageOptions={[10, 25, 50, 100]}
                              component="div"
                              count={totalBookings}
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
                            No Event Registration data available
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

export default EventRegistration;
