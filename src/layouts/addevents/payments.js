import React, { useState, useEffect } from "react";
import { TextField, Button, TableContainer, Paper, CircularProgress } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import PropTypes from "prop-types";
import api from "../api";
import MDButton from "components/MDButton";

const Payments = ({ eventId }) => {
  const [formData, setFormData] = useState({ convenienceFee: 0, gstPercentage: 0 });
  const [paymentList, setPaymentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const tableCellStyle = { border: "1px solid #ddd", padding: "8px" };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const fetchPaymentData = async () => {
    const token = localStorage.getItem("userToken"); // Retrieve token from storage

    try {
      const response = await api.get(`/charges/event/${eventId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure `data` is an array
      const paymentData = response.data?.data;

      const charges = Array.isArray(paymentData)
        ? paymentData
        : paymentData
        ? [paymentData] // Wrap single object in an array
        : [];

      setPaymentList(charges);
      console.log("Fetched payments:", charges);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      alert("Failed to fetch payment data");
    }
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);
    const token = localStorage.getItem("userToken");

    const eventData = {
      eventId: Number(eventId),
      convenienceFee: parseFloat(formData.convenienceFee),
      gstPercentage: parseInt(formData.gstPercentage, 10),
    };

    try {
      if (isEditing && editingPaymentId) {
        await api.put(`/charges/${editingPaymentId}`, eventData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Payment updated successfully");
      } else {
        await api.post("/charges", eventData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Payment created successfully");
      }
      await fetchPaymentData();
      setFormData({ convenienceFee: 0, gstPercentage: 0 });
      setIsEditing(false);
      setEditingPaymentId(null);
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (chargeId) => {
    const token = localStorage.getItem("userToken");
    try {
      await api.delete(`/charges/${chargeId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Payment deleted successfully");
      fetchPaymentData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment");
    }
  };

  const handleEditPayment = (chargeId) => {
    const paymentToEdit = paymentList.find((payment) => payment.chargeId === chargeId);
    if (paymentToEdit) {
      setFormData({
        convenienceFee: paymentToEdit.convenienceFee,
        gstPercentage: paymentToEdit.gstPercentage,
      });
      setIsEditing(true);
      setEditingPaymentId(chargeId);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchPaymentData();
    }
  }, [eventId]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <TextField
          label="GST"
          name="gstPercentage"
          type="number"
          value={formData.gstPercentage}
          onChange={handlePaymentInputChange}
          style={{ width: "30%", margin: "10px 25px", lineHeight: "44px" }}
        />
        <TextField
          label="Convenience Fee"
          name="convenienceFee"
          type="number"
          value={formData.convenienceFee}
          onChange={handlePaymentInputChange}
          style={{ width: "30%", margin: "10px 25px", lineHeight: "44px" }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#25266d", color: "#fff", margin: "10px" }}
          onClick={handlePaymentSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} style={{ color: "#fff" }} />
          ) : isEditing ? (
            "Update"
          ) : (
            "Submit"
          )}
        </Button>
      </div>
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
              <th style={tableCellStyle}>GST (%)</th>
              <th style={tableCellStyle}>Convenience Fee (%)</th>
              <th style={tableCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ textAlign: "center" }}>
            {paymentList.map((payment) => (
              <tr key={payment.chargeId}>
                <td style={tableCellStyle}>{payment.gstPercentage}</td>
                <td style={tableCellStyle}>{payment.convenienceFee}</td>
                <td style={tableCellStyle}>
                  <MDButton
                    style={{ marginRight: "10px" }}
                    variant="gradient"
                    color="info"
                    onClick={() => handleEditPayment(payment.chargeId)}
                  >
                    <CreateIcon />
                  </MDButton>
                  <MDButton
                    style={{ marginLeft: "10px" }}
                    variant="gradient"
                    color="error"
                    onClick={() => handleDeletePayment(payment.chargeId)}
                  >
                    <DeleteIcon />
                  </MDButton>
                </td>
              </tr>
            ))}
            {paymentList.length === 0 && (
              <tr>
                <td colSpan="3" style={tableCellStyle}>
                  No payments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableContainer>
    </div>
  );
};

Payments.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default Payments;
