// import { createSlice } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";

// const getInitialUser = () => {
//   try {
//     const stored = Cookies.get("user");
//     return stored ? JSON.parse(stored) : null;
//   } catch {
//     return null;
//   }
// };

// const getInitialEmployees = () => {
//   try {
//     const stored = localStorage.getItem("serviceDeliveryEmployees");
//     return stored ? JSON.parse(stored) : [];
//   } catch {
//     return [];
//   }
// };

// const initialState = {
//   user: getInitialUser(),
//   serviceDeliveryEmployees: getInitialEmployees(),
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     loginUser: (state, action) => {
//       const data = action.payload;
//       const serviceDeliveryEmployees = data.serviceDeliveryEmployees || [];

//       const userResult = Array.isArray(data.result) ? data.result[0] : data.result;

//       const user = {
//         userid: data.userid,
//         // id: data.id || userResult?.id, // ❌ Remove users.id
//         emp_id: userResult?.emp_id,        // ✅ Use emp_id from master.emp
//         emp_email: userResult?.emp_email,
//         emp_name: userResult?.emp_name,
//         emp_dept: userResult?.emp_dept,
//         emp_designation: userResult?.emp_designation,
//         role: userResult?.role,
//         departments: userResult?.departments,
//         role_id: userResult?.role_id,
//         association_id: userResult?.association_id,
//         status: userResult?.status,
//         u_id: userResult?.u_id,  // ✅ Store u_id from master.emp
//         roles: Array.isArray(data.result) ? data.result : [userResult],
//       };

//       if (user.role) {
//         localStorage.setItem("role", user.role);
//       }

//       if (data.accessToken) {
//         localStorage.setItem("token", data.accessToken);
//       }

//       // Store emp_id instead of user id
//       if (user.emp_id) {
//         localStorage.setItem("emp_id", user.emp_id);
//       }

//       // Store employees
//       if (serviceDeliveryEmployees.length > 0) {
//         localStorage.setItem(
//           "serviceDeliveryEmployees",
//           JSON.stringify(serviceDeliveryEmployees)
//         );
//       }

//       Cookies.set("user", JSON.stringify(user), {
//         expires: 7,
//         path: "/",
//       });

//       state.user = user;
//       state.serviceDeliveryEmployees = serviceDeliveryEmployees;
//     },

//     logoutUser: (state) => {
//       Cookies.remove("user");
//       localStorage.removeItem("token");
//       localStorage.removeItem("email");
//       localStorage.removeItem("emp_id");
//       localStorage.removeItem("UserID");
//       localStorage.removeItem("serviceDeliveryEmployees");

//       state.user = null;
//       state.serviceDeliveryEmployees = [];
//       window.close();
//     },
//   },
// });

// export const { loginUser, logoutUser } = authSlice.actions;
// export default authSlice.reducer;


// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const getInitialUser = () => {
  try {
    const stored = Cookies.get("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getInitialEmployees = () => {
  try {
    const stored = localStorage.getItem("serviceDeliveryEmployees");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  user: getInitialUser(),
  serviceDeliveryEmployees: getInitialEmployees(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const data = action.payload;
      const serviceDeliveryEmployees = data.serviceDeliveryEmployees || [];

      const userResult = Array.isArray(data.result) ? data.result[0] : data.result;

      const user = {
        userid: data.userid,
        emp_id: userResult?.emp_id,
        emp_email: userResult?.emp_email,
        emp_name: userResult?.emp_name,
        emp_dept: userResult?.emp_dept,
        emp_designation: userResult?.emp_designation,
        role: userResult?.role,
        departments: userResult?.departments,
        role_id: userResult?.role_id,
        association_id: userResult?.association_id,
        status: userResult?.status,
        u_id: userResult?.u_id,
        roles: Array.isArray(data.result) ? data.result : [userResult],
      };

      if (user.role) {
        localStorage.setItem("role", user.role);
      }

      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      if (user.emp_id) {
        localStorage.setItem("emp_id", user.emp_id);
      }

      // Store employees
      if (serviceDeliveryEmployees.length > 0) {
        localStorage.setItem(
          "serviceDeliveryEmployees",
          JSON.stringify(serviceDeliveryEmployees)
        );
      }

      Cookies.set("user", JSON.stringify(user), {
        expires: 7,
        path: "/",
      });

      state.user = user;
      state.serviceDeliveryEmployees = serviceDeliveryEmployees;
    },

    logoutUser: (state) => {
      Cookies.remove("user");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("emp_id");
      localStorage.removeItem("UserID");
      localStorage.removeItem("serviceDeliveryEmployees");

      state.user = null;
      state.serviceDeliveryEmployees = [];
      window.close();
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;