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

const Categories = () => {
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

    const url = `/assignor`;

    try {
      setLoading(true);
      const response = await api.get(url, {
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.data.Assignors);
      setCategories(response.data.data.Assignors || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category = null) => {
    setEditingCategory(category);
    setFormData({
      assignor: category?.assignor || "",
      uniqueassignorId: category?.uniqueassignorId || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ categories: "", uniqueassignorId: "" });
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
          `/assignor/${editingCategory.assignorId}`,
          {
            assignor: formData.assignor,
            uniqueassignorId: formData.uniqueassignorId,
          },
          { headers }
        );
      } else {
        const response = await api.post(
          "/assignor",
          {
            assignor: formData.assignor,
            uniqueassignorId: formData.uniqueassignorId,
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

      if (!categoryToDelete || !categoryToDelete.assignorId) {
        setError("Invalid category selection. Please try again.");
        return;
      }

      console.log("Deleting category:", categoryToDelete);

      const response = await api.delete(
        `/assignor/${categoryToDelete.assignorId}`,
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response:", response.data);

      // Update state to remove the deleted category
      setCategories((prevCategories) =>
        prevCategories.filter(
          (c) => c.assignorId !== categoryToDelete.assignorId
        )
      );

      setIsDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error(
        "Error deleting category:",
        err.response?.data || err.message
      );
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
                      <h2>Categories</h2>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <MDButton
                        variant="gradient"
                        color="success"
                        fullWidth
                        onClick={() => handleOpenDialog()}
                      >
                        Add Assigned
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2}>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <TableContainer
                    component={Paper}
                    style={{ borderRadius: 0, boxShadow: "none" }}
                  >
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
                          <th style={tableCellStyle}>Assigned</th>
                          <th style={tableCellStyle}>Create Date</th>
                          <th style={tableCellStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ textAlign: "center" }}>
                        {Array.isArray(categories) &&
                          categories.map((category) => (
                            <tr key={category.assignorId}>
                              <td style={tableCellStyle}>
                                {category.assignor}
                              </td>
                              <td style={tableCellStyle}>
                                {new Date(
                                  category.createdAt
                                ).toLocaleDateString()}
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
                    {editingCategory ? "Edit Assigned" : "Add Assigned"}
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      name="assignor"
                      label="Assigned Name"
                      fullWidth
                      margin="normal"
                      value={formData.assignor}
                      onChange={handleFormChange}
                    />
                  </DialogContent>
                  <DialogActions>
                    <MDButton
                      style={{ marginRight: "10px" }}
                      variant="gradient"
                      color="error"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </MDButton>
                    <MDButton
                      style={{ marginRight: "10px" }}
                      variant="gradient"
                      color="info"
                      onClick={handleFormSubmit}
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </MDButton>
                  </DialogActions>
                </Dialog>
                <Dialog
                  open={isDeleteConfirmOpen}
                  onClose={() => setIsDeleteConfirmOpen(false)}
                >
                  <DialogTitle
                    style={{
                      maxWidth: "500px", // Restricts maximum size
                      width: "500px", // Allows full width within the grid system
                    }}
                  >
                    Confirm Deletion
                  </DialogTitle>
                  <DialogContent>
                    Are you sure you want to delete &quot;
                    {categoryToDelete?.assignor}&quot;?
                  </DialogContent>
                  <DialogActions>
                    <MDButton
                      style={{ marginRight: "10px" }}
                      variant="gradient"
                      color="error"
                      onClick={() => setIsDeleteConfirmOpen(false)}
                    >
                      Cancel
                    </MDButton>
                    <MDButton
                      style={{ marginRight: "10px" }}
                      variant="gradient"
                      color="info"
                      onClick={handleDeleteCategory}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </MDButton>
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

export default Categories;
