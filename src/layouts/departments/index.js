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
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const Departments = () => {
  const [formData, setFormData] = useState({
    departments: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);

  const handleOpenDialog = (flight = null) => {
    setEditingFlight(flight);
    if (flight) {
      setFormData({
        departments: flight.departments || "",
      });
    } else {
      setFormData({
        departments: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleFormSubmit = useCallback(() => {
    // Implement form submit logic here
    handleCloseDialog();
  }, [formData, editingFlight]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={9}>
                      <h2>Departments</h2>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => handleOpenDialog()}
                      >
                        Add Departments
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                <TableContainer
                  component={Paper}
                  style={{ borderRadius: "0px", boxShadow: "none" }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px" }}>
                    <thead style={{ background: "#efefef", fontSize: "15px" }}>
                      <tr>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Departments</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ textAlign: "center" }}>
                      <tr>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                          Sample Departments
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                          <MDButton
                            variant="gradient"
                            color="info"
                            onClick={() => handleOpenDialog()}
                          >
                            <CreateIcon sx={{ fontSize: "30px !important" }} />
                          </MDButton>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </TableContainer>
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                  <DialogTitle
                    style={{
                      maxWidth: "500px", // Restricts maximum size
                      width: "500px", // Allows full width within the grid system
                    }}
                  >
                    {editingFlight ? "Edit Departments" : "Add Departments"}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      name="departments"
                      label="Departments"
                      fullWidth
                      margin="normal"
                      value={formData.departments}
                      onChange={handleFormChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleFormSubmit}>Submit</Button>
                  </DialogActions>
                </Dialog>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default Departments;
