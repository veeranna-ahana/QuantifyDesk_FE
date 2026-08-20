// import axios from "axios";

// export const fetchEmployeesApi = async () => {
//   const response = await axios.post(
//     `${import.meta.env.VITE_API_BASE_URL}/hrms/getAllAhanaEmplist`
//   );
//   return response.data;
// };

// src/services/hrmsService.js
import axios from 'axios';

// Use Vite's environment variables
// VITE_API_BASE_URL should be 'http://localhost:7001' (without /api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7001';

export const hrmsService = {
  // Fetch all employees from HRMS
  getAllEmployees: async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/hrms/getAllAhanaEmplist`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching HRMS employees:', error);
      throw error;
    }
  },

  // Fetch specific employee details from HRMS
  getEmployeeDetails: async (empId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/hrms/getEmployeeDetails/${empId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching employee details:', error);
      throw error;
    }
  }
};