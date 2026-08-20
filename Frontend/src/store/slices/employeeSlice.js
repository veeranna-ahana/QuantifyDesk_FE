// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchEmployeesApi } from "../../api/hrmsApi";

// export const fetchEmployees = createAsyncThunk(
//   "employees/fetchEmployees",
//   async (_, { rejectWithValue }) => {
//     try {
//       const data = await fetchEmployeesApi();
//       return data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Error fetching employees");
//     }
//   }
// );

// const employeeSlice = createSlice({
//   name: "employees",
//   initialState: {
//     list: [],
//     departments: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {},

//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchEmployees.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchEmployees.fulfilled, (state, action) => {
//         state.loading = false;
//         state.list = action.payload.data || action.payload;
        
//         const employees = action.payload.data || action.payload;
//         state.departments = [...new Set(
//           employees.map(emp => emp.Name_of_Department).filter(dept => dept && dept.trim()).sort()
//         )];
//       })
//       .addCase(fetchEmployees.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default employeeSlice.reducer;


// src/store/slices/employeeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hrmsService } from '../../api/hrmsApi';

// Async thunk to fetch HRMS employees
export const fetchHrmsEmployees = createAsyncThunk(
  'employees/fetchHrmsEmployees',
  async (_, { rejectWithValue }) => {
    console.log('🔵 fetchHrmsEmployees called');
    try {
      const response = await hrmsService.getAllEmployees();
      console.log('🔵 Response received:', response);
      
      // Handle different response structures
      let employeesData = [];
      
      if (response.success && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (Array.isArray(response)) {
        employeesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        employeesData = response.data;
      } else if (response.data && response.data[0] && response.data[0].rows) {
        // Handle the specific structure from your backend
        employeesData = response.data[0].rows;
      } else if (response.data && response.data.data && response.data.data[0] && response.data.data[0].rows) {
        // Alternative nested structure
        employeesData = response.data.data[0].rows;
      }
      
      console.log('🔵 Processed employees:', employeesData);
      console.log('🔵 Employee count:', employeesData.length);
      
      if (employeesData.length === 0) {
        console.warn('⚠️ No employees found in the response');
      }
      
      return employeesData;
    } catch (error) {
      console.error('🔴 Error in fetchHrmsEmployees:', error);
      return rejectWithValue(error.message || 'Failed to fetch employees');
    }
  }
);

// Async thunk to fetch single employee details
export const fetchEmployeeDetails = createAsyncThunk(
  'employees/fetchEmployeeDetails',
  async (empId, { rejectWithValue }) => {
    try {
      const response = await hrmsService.getEmployeeDetails(empId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  employees: [],          // HRMS employees
  serviceDeliveryEmployees: [], // Legacy service delivery employees (keep for backward compatibility)
  loading: false,
  error: null,
  selectedEmployee: null,
  employeeMap: {},        // Quick lookup by Employee_ID
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearEmployees: (state) => {
      state.employees = [];
      state.employeeMap = {};
    },
    setServiceDeliveryEmployees: (state, action) => {
      state.serviceDeliveryEmployees = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetEmployeeState: (state) => {
      state.employees = [];
      state.employeeMap = {};
      state.loading = false;
      state.error = null;
      state.selectedEmployee = null;
      state.serviceDeliveryEmployees = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all employees
      .addCase(fetchHrmsEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('🔄 fetchHrmsEmployees pending...');
      })
      .addCase(fetchHrmsEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
        // Create a map for quick lookup
        state.employeeMap = action.payload.reduce((acc, emp) => {
          acc[emp.Employee_ID] = emp;
          return acc;
        }, {});
        console.log('✅ fetchHrmsEmployees fulfilled. Employees:', state.employees.length);
      })
      .addCase(fetchHrmsEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch employees';
        console.error('❌ fetchHrmsEmployees rejected:', state.error);
      })
      // Fetch single employee
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEmployee = action.payload;
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch employee details';
      });
  },
});

export const { 
  clearEmployees, 
  setServiceDeliveryEmployees,
  clearError,
  resetEmployeeState 
} = employeeSlice.actions;

// Selectors
export const selectAllEmployees = (state) => state.employees.employees;
export const selectEmployeesLoading = (state) => state.employees.loading;
export const selectEmployeesError = (state) => state.employees.error;
export const selectEmployeeMap = (state) => state.employees.employeeMap;
export const selectServiceDeliveryEmployees = (state) => state.employees.serviceDeliveryEmployees;

export default employeeSlice.reducer;