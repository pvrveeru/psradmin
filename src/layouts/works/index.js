import React, { useState, useEffect } from "react";
import {
  TableContainer,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Card from "@mui/material/Card";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import CreateIcon from "@mui/icons-material/Create";
import axios from "axios";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import "../styles.css";
import Grid from "@mui/material/Grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TextField from "@mui/material/TextField";
import api from "../api";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import moment from "moment";
import { format } from 'date-fns';
import dayjs from 'dayjs';

const Works = () => {
  const [events, setEvents] = useState([]);
  const [works, setWorks] = useState([]);
  const [rows, setRows] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page
  const [page, setPage] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState(0); // To store the total count of events
  const [selectedAssignor, setSelectedAssignor] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(""); // Selected user for filtering
  const [error, setError] = useState(""); // Error message
  // Fetch data from API

  const fetchEvents = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }
    const offset = page * rowsPerPage; // Calculate offset for pagination

    const url = `/assignor`;

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const event = response.data.data.Assignors;
      const totalRecords = response.data.data.totalNoOfRecords;

      setEvents(event);
      setTotalCount(totalRecords);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/authentication/sign-in/");
      return;
    }

    try {
      const response = await api.get("/users", {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.data); // Update users state with fetched data
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchWork = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/authentication/sign-in/");
      return;
    }

    const offset = page * rowsPerPage;
    let url = `/assignments?offset=${offset}&limit=${rowsPerPage}`;

    if (selectedAssignor) url += `&assignedBy=${selectedAssignor}`;
    if (startDate) url += `&startDate=${dayjs(startDate, "DD-MM-YYYY").format("YYYY-MM-DD")}`;
  if (endDate) url += `&endDate=${dayjs(endDate, "DD-MM-YYYY").format("YYYY-MM-DD")}`;
    if (selectedUser) url += `&userId=${selectedUser}`; // Include user filter

    try {
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      const work = response.data.data.result;
      const totalRecords = response.data.data.totalNoOfRecords;

      setWorks(work);
      setTotalCount(totalRecords);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  // Fetch events on page load and whenever page/rowsPerPage changes
  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchWork();
  }, [page, rowsPerPage, selectedAssignor, startDate, endDate, selectedUser]); // Added dependencies

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const handleSearch = () => {
    setPage(0);
    fetchWork();
  };

  const handleExportCSV = () => {
    if (works.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Define CSV headers based on table columns
    const csvData = works.map((work) => ({
      Date: work.createdAt
        ? format(new Date(work.createdAt), "dd-MM-yyyy hh:mm a")
        : "--",
      Assignor: work.assignedBy.assignor,
      "Employee Name": work.name,
      "Client Name": work.clientName,
      Activity: work.activity,
      SiteId: work.siteId,
      Latitude: work.latitude,
      Longitude: work.longitude,
      Remarks: work.remarks,
    }));

    // Convert JSON data to CSV format
    const csv = Papa.unparse(csvData);

    // Create a Blob and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "work_report.csv");
  };

  const handleClearSearch = () => {
    setSelectedAssignor("");
    setSelectedUser("");
    setStartDate(null);
    setEndDate(null);
    setPage(0);
    fetchWork();
  };

  const handleStartDateChange = (date) => {
    const formattedDate = date ? format(new Date(date), "dd-MM-yyyy") : null;
    setStartDate(formattedDate);
  };
  
  const handleEndDateChange = (date) => {
    const formattedDate = date ? format(new Date(date), "dd-MM-yyyy") : null;
    setEndDate(formattedDate);
  };

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleOpen = (images) => {
    setSelectedImages(images);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <DashboardLayout>
      <div className="hide-on-desktop">
        <DashboardNavbar />
      </div>
      <MDBox pt={3} pb={3}>
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2>Work Report</h2>
              </div>
            </MDTypography>
          </MDBox>
          <MDBox pt={3} px={2}>
            <Card style={{ backgroundColor: "#f6f0f0" }}>
              <MDBox p={3}>
                <Grid container spacing={2}>
                  <b style={{ lineHeight: "60px", marginLeft: "10px" }}>
                    Search by
                  </b>
                  <Grid item xs={12} sm={2} style={{ maxWidth: "17%" }}>
                    <Select
                      fullWidth
                      displayEmpty
                      variant="outlined"
                      style={{
                        border: "1px solid #ccc",
                        lineHeight: "40px",
                        boxShadow: "none",
                      }}
                      value={selectedAssignor}
                      onChange={(e) => setSelectedAssignor(e.target.value)} // Update state
                    >
                      <MenuItem value="">
                        <em>Select an Assignor</em>
                      </MenuItem>
                      {events.map((event) => (
                        <MenuItem
                          key={event.assignorId}
                          value={event.assignorId}
                        >
                          {event.assignor}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Select
                      fullWidth
                      displayEmpty
                      variant="outlined"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      style={{
                        border: "1px solid #ccc",
                        lineHeight: "40px",
                        boxShadow: "none",
                      }}
                    >
                      <MenuItem value="">
                        <em>Select User</em>
                      </MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.userId} value={user.userId}>
                          {user.userName}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  <Grid item xs={12} sm={2} className="customwidth">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={2} className="customwidth">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} sm={1} style={{ display: "flex" }}>
                    {/* <MDButton
                      variant="gradient"
                      color="info"
                      fullWidth
                      onClick={handleSearch}
                      style={{ marginRight: "10px" }}
                    >
                      Search
                    </MDButton> */}
                    <MDButton
                      variant="gradient"
                      color="info"
                      fullWidth
                      onClick={handleClearSearch}
                    >
                      Clear
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} sm={1} style={{ display: "flex" }}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      onClick={handleExportCSV}
                    >
                      Export
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </MDBox>
          <MDBox pt={3} px={2}>
            <MDBox>
              <>
                {/* <MDButton variant="gradient" color="success" onClick={handleExportCSV}>
                  Export CSV
                </MDButton> */}
                <MDBox display="flex" justifyContent="center">
                  <TableContainer component={Paper}>
                    {events?.length > 0 ? (
                      <>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "16px",
                            marginBottom: "20px",
                          }}
                        >
                          <thead
                            style={{ background: "#efefef", fontSize: "15px" }}
                          >
                            <tr>
                              <th style={tableCellStyle}>Date</th>
                              <th style={tableCellStyle}>Assigned By</th>
                              <th style={tableCellStyle}>Employee Name</th>
                              <th style={tableCellStyle}>Client Name</th>
                              <th style={tableCellStyle}>Site ID</th>
                              <th style={tableCellStyle}>Activity</th>
                              <th style={tableCellStyle}>Location</th>
                              <th style={tableCellStyle}>Remarks</th>
                            </tr>
                          </thead>
                          <tbody style={{ textAlign: "center" }}>
                            {Array.isArray(works) &&
                              works.map((work) => (
                                <tr key={work.assignmentId}>
                                  <td style={tableCellStyle}>
                                    {work.createdAt
                                      ? format(
                                          new Date(work.createdAt),
                                          "dd-MM-yyyy hh:mm a"
                                        )
                                      : "--"}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {work.assignedBy.assignor}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {work.name || "N/A"}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {work.clientName || "N/A"}
                                  </td>
                                  <td
                                    style={tableCellStyle}
                                    onClick={() =>
                                      handleOpen(work.galleryImages)
                                    }
                                  >
                                    {work.siteId}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {work.activity}
                                  </td>
                                  <td style={tableCellStyle}>
                                    {work.latitude} - {work.longitude}
                                  </td>
                                  <td style={tableCellStyle}>{work.remarks}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <TablePagination
                          rowsPerPageOptions={[10, 25, 50, 100]}
                          component="div"
                          count={totalCount}
                          rowsPerPage={rowsPerPage}
                          page={page}
                          onPageChange={(event, newPage) => setPage(newPage)}
                          onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                        <FormControl
                          variant="outlined"
                          sx={{
                            minWidth: 120,
                            //position: "absolute",
                            marginTop: "-50px",
                            marginLeft: "10px",
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
                        No Wrok data available
                      </p>
                    )}
                  </TableContainer>
                </MDBox>
              </>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          style={{
            maxWidth: "500px", // Restricts maximum size
            width: "500px", // Allows full width within the grid system
          }}
        >
          Site Images
        </DialogTitle>
        <DialogContent>
          {selectedImages.length > 0 ? (
            selectedImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Gallery ${index}`}
                width="100%"
                style={{ marginBottom: "10px" }}
              />
            ))
          ) : (
            <>No images available</>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Works;
