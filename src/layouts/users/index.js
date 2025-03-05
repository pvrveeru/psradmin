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
import api from "../api";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [categories, setCategories] = useState([]); // List of categories
  const [formData, setFormData] = useState({ categories: "" }); // Form data
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state
  const [editingCategory, setEditingCategory] = useState(null); // Editing state
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("User not authenticated. Please log in.");
      navigate("/authentication/sign-in/");
      return;
    }

    const url = `/users`;

    try {
      setLoading(true);
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("raj", response.data.data);
      setCategories(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setFormData({
      userName: category?.userName || "",
      phoneNumber: category?.phoneNumber || "",
      deviceId: category?.deviceId || "",
      uniqueCategoryId: category?.uniqueCategoryId || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ categories: "", uniqueCategoryId: "" });
    setEditingCategory(null);
    setError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = useCallback(async () => {
    try {
      setLoading(true);
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

      if (editingCategory) {
        await api.put(
          `/users/${editingCategory.userId}`,
          {
            userName: formData.userName,
            phoneNumber: formData.phoneNumber,
            deviceId: formData.deviceId,
            uniqueCategoryId: formData.uniqueCategoryId,
          },
          { headers }
        );
      } else {
        const response = await api.post(
          "/users/add",
          {
            userName: formData.userName,
            phoneNumber: formData.phoneNumber,
            uniqueCategoryId: formData.uniqueCategoryId,
          },
          { headers }
        );
        setCategories([...categories, response.data.data]);
      }

      handleCloseDialog();
      fetchCategories(); // Fetch updated categories after edit/add
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, editingCategory, categories]);

  const handleDeleteCategory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        navigate("/authentication/sign-in/");
        return;
      }

      await api.delete(`/users/${categoryToDelete.userId}`, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(categories.filter((c) => c.userId !== categoryToDelete.userId));
      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

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
                      <h2>Users</h2>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => handleOpenDialog()}
                      >
                        Add User
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <TableContainer component={Paper} style={{ borderRadius: 0, boxShadow: "none" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <thead style={{ background: "#efefef", fontSize: "15px" }}>
                        <tr>
                          <th style={tableCellStyle}>User</th>
                          <th style={tableCellStyle}>Phone Number</th>
                          <th style={tableCellStyle}>Device Id</th>
                          <th style={tableCellStyle}>Create Date</th>
                          <th style={tableCellStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: "center" }}>
                        {Array.isArray(categories) &&
                          categories.map((category) => (
                            <tr key={category.userId}>
                              <td style={tableCellStyle}>{category.userName}</td>
                              <td style={tableCellStyle}>{category.phoneNumber}</td>
                              <td style={tableCellStyle}>{category.deviceId}</td>
                              <td style={tableCellStyle}>
                                {new Date(category.createdAt).toLocaleDateString()}
                              </td>
                              <td style={tableCellStyle}>
                                <MDButton
                                  style={{ marginRight: "10px" }}
                                  variant="gradient"
                                  color="info"
                                  onClick={() => handleOpenDialog(category)}
                                >
                                  <CreateIcon />
                                </MDButton>
                                <MDButton
                                  style={{ marginLeft: "10px" }}
                                  variant="gradient"
                                  color="error"
                                  onClick={() => {
                                    setIsDeleteConfirmOpen(true);
                                    setCategoryToDelete(category);
                                  }}
                                >
                                  <DeleteIcon />
                                </MDButton>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </TableContainer>
                )}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                  <DialogTitle
                    style={{
                      maxWidth: "500px", // Restricts maximum size
                      width: "500px", // Allows full width within the grid system
                    }}
                  >
                    {editingCategory ? "Edit User" : "Add User"}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      name="userName"
                      label="userName"
                      fullWidth
                      margin="normal"
                      value={formData.userName}
                      onChange={handleFormChange}
                    />
                    <TextField
                      name="phoneNumber"
                      label="Phone Number"
                      fullWidth
                      margin="normal"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                    />
                    <TextField
                      name="deviceId"
                      label="Device Id"
                      fullWidth
                      margin="normal"
                      value={formData.deviceId}
                      onChange={handleFormChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleFormSubmit} disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  </DialogActions>
                </Dialog>
                <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
                  <DialogTitle
                    style={{
                      maxWidth: "500px", // Restricts maximum size
                      width: "500px", // Allows full width within the grid system
                    }}
                  >
                    Confirm Deletion
                  </DialogTitle>
                  <DialogContent>
                    Are you sure you want to delete &quot;{categoryToDelete?.userName}&quot;?
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteCategory} color="error" disabled={loading}>
                      {loading ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogActions>
                </Dialog>
                {error && <p style={{ color: "red" }}>{error}</p>}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
};

export default Users;
