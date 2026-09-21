
import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchableSelect from '@/components/ui/SearchableSelect/SearchableSelect';
//const BASE_URL  = process.env.REACT_APP_API_BASE_URL;
const BASE_URL  = import.meta.env.VITE_API_BASE_URL;

const DailyUpdates = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [updates, setUpdates] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [date, setDate] = useState("");
  const [unitsCompleted, setUnitsCompleted] = useState("");
  const [hoursSpent, setHoursSpent] = useState("");

  const [selectedRole, setSelectedRole] = useState("");
const [roleTasks, setRoleTasks] = useState([]);
const [remarks, setRemarks] = useState("");

const [editId, setEditId] = useState(null);
const [editData, setEditData] = useState({});


const roleTaskMapping = {
  BA: [
    "BA-BRD",
    "BA-TDD",
    "BA-Requirements Sign Off"
  ],
  UI: [
    "UI Design / Figma",
    "UI Review",
    "UI Signoff"
  ],
  TL: [
    "TL-Code Review",
    "TL-Unit Testing",
    "TL-Assign Task",
    "TL-Peer Code Merge"
  ],
  "FE Dev": [
    "FEDev-UI Implementation",
    "FEDev-API Design",
    "FEDev-API Implementation",
    "FEDev-API Integration"
  ],
  "BE Dev": [
    "BEDev-DB Design",
    "BEDev-API Implementation",
    "BEDev-API Testing",
    "BEDev-UI Testing",
    "BEDev-Documentation",
    "BEDev-Design Review",
    "BEDev-Code Review",
    "BEDev-Release Notes (Each Build)"
  ],
  "Mobile/IOS Dev": [
    "Mobile API Integration"
  ],
  Tester: [
    "UAT Testing",
    "Test Cases Documentation Preparation",
    "Integration Testing",
    "Fault Tracker",
    "Traceability Matrix",
    "Aging Report",
    "QA Sign Off",
    "User Manual Preparation"
  ]
};

const handleEdit = (update) => {
  setEditId(update.id);
  setEditData({ ...update });
};

const handleUpdate = async () => {
  try {
    const cleanData = {
      ...editData,
      units_completed: parseInt(editData.units_completed, 10) || 0,
    };
    await axios.put(
      `${BASE_URL}/api/daily-updates/${editId}`,
      cleanData,
      { headers: getAuthHeaders() }
    );

    setEditId(null);
    fetchUpdates();
  } catch (err) {
    console.error(err);
    alert("Failed to update");
  }
};


  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // 🔹 Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/projects`,
          { headers: getAuthHeaders() }
        );
        setProjects(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  

  useEffect(() => {
    if (!selectedRole) {
      setRoleTasks([]);
      setSelectedTask("");
      return;
    }
  
    setRoleTasks(roleTaskMapping[selectedRole] || []);
    setSelectedTask("");
  }, [selectedRole]);
  
  const id = localStorage.getItem("UserID");
  console.log("id-",id);
  // 🔹 Fetch Updates (for logged-in user)
  const fetchUpdates = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/daily-updates?userId=${id}`,
        { headers: getAuthHeaders() }
      );
      setUpdates(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  // 🔹 Submit Daily Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTask || !date) {
      alert("Task and date required");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/daily-updates`,
        {
          project_id: selectedProject,
          role: selectedRole,
          task_name: selectedTask,
          user_id: id,
          date,
          units_completed: parseInt(unitsCompleted, 10) || 0,
          hours_spent: hoursSpent || 0,
          remarks: remarks || ""
        },
        { headers: getAuthHeaders() }
      );
      

      // Reset form
      setSelectedProject("");
      setSelectedTask("");
      setDate("");
      setUnitsCompleted("");
      setHoursSpent("");
      setSelectedRole("");
      setRemarks("");
      
      fetchUpdates();
    } catch (err) {
      console.error(err);
      alert("Failed to add update");
    }
  };

  // 🔹 Delete Update
  const handleDelete = async (updateId) => {
    if (!window.confirm("Are you sure you want to delete this update?")) {
      return;
    }

    try {
      await axios.delete(
        `${BASE_URL}/api/daily-updates/${updateId}`,
        { headers: getAuthHeaders() }
      );
      fetchUpdates();
    } catch (err) {
      console.error(err);
      alert("Failed to delete update");
    }
  };
console.log("updates",updates);

  return (
    <div className="legacy-page legacy-page--daily-update">
      <h2 className="legacy-heading">Daily Updates</h2>
      <form onSubmit={handleSubmit} className="legacy-form legacy-form--compact">
        <div className="legacy-form-row legacy-form-row--compact">
          <div className="legacy-form-group">
            <label className="legacy-form-label">Select Project</label>
            <SearchableSelect
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Select Project"
              options={projects.map(p => ({ value: String(p.id), label: p.name || p.project_name }))}
            />
          </div>
            <div className="legacy-form-group">
          <label className="legacy-form-label">Select Role</label>
  <SearchableSelect
    value={selectedRole}
    onChange={val => { setSelectedRole(val); }}
    placeholder="Select Role"
    disabled={!selectedProject}
    options={Object.keys(roleTaskMapping).map(role => ({ value: role, label: role }))}
  />
</div>


          <div className="legacy-form-group">
            <label className="legacy-form-label">Select Task</label>
            <SearchableSelect
              value={selectedTask}
              onChange={setSelectedTask}
              placeholder="Select Task"
              disabled={!selectedRole}
              options={roleTasks.map(task => ({ value: task, label: task }))}
            />

          </div>
        </div>

        <div className="legacy-form-row legacy-form-row--compact">
          <div className="legacy-form-group">
            <label className="legacy-form-label">Date (dd-mm-yyyy)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="legacy-form-input legacy-form-input--compact"
            />
          </div>

          <div className="legacy-form-group">
            <label className="legacy-form-label">Units Completed</label>
            <input
              type="number"
              placeholder="Units Completed"
              value={unitsCompleted}
              min="0"
              step="1"
              onKeyDown={(e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); }}
              onChange={(e) => setUnitsCompleted(e.target.value.replace(/\D/g, ''))}
              className="legacy-form-input legacy-form-input--compact"
            />
          </div>

          <div className="legacy-form-group">
            <label className="legacy-form-label">Hours Spent</label>
            <input
              type="number"
              placeholder="Hours Spent"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(e.target.value)}
              className="legacy-form-input legacy-form-input--compact"
              min="0"
              step="0.5"
            />
          </div>
            <div className="legacy-form-group">
          <label className="legacy-form-label">Remarks</label>
  <input
    type="text"
    placeholder="Enter Remarks"
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    className="legacy-form-input legacy-form-input--compact"
  />
</div>

        </div>

        <button type="submit" className="legacy-button-submit legacy-button-submit--compact">
          Add Update
        </button>
      </form>

      {/* My Updates Table */}
            {/* My Updates Table */}
      <div className="legacy-dashboard-section">
        <h3 className="legacy-dashboard-subheading">My Updates</h3>

        <div className="legacy-table-center">
          <div className="legacy-table-scroll legacy-table-scroll--daily legacy-table-daily-card">
            <table className="legacy-table">
              <thead className="legacy-table-head">
                <tr>
                  <th>Project</th><th>Role</th><th>Task</th><th>Date</th><th>Units</th><th>Hours</th><th>Remarks</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {editId === u.id ? (
                        <input
                          // value={editData.project_id}
                          value={editData.project_name}
                          onChange={(e) =>
                            setEditData({ ...editData, project_name: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.project_name
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          value={editData.role}
                          onChange={(e) =>
                            setEditData({ ...editData, role: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.role
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          value={editData.task_name}
                          onChange={(e) =>
                            setEditData({ ...editData, task_name: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.task_name
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          type="date"
                          value={editData.date?.split("T")[0]}
                          onChange={(e) =>
                            setEditData({ ...editData, date: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        formatDate(u.date)
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editData.units_completed}
                          onKeyDown={(e) => { if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') e.preventDefault(); }}
                          onChange={(e) =>
                            setEditData({ ...editData, units_completed: e.target.value.replace(/\D/g, '') })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.units_completed
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          type="number"
                          value={editData.hours_spent}
                          onChange={(e) =>
                            setEditData({ ...editData, hours_spent: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.hours_spent
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <input
                          value={editData.remarks || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, remarks: e.target.value })
                          }
                          className="legacy-form-input legacy-form-input--compact"
                        />
                      ) : (
                        u.remarks
                      )}
                    </td>

                    <td>
                      {editId === u.id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="legacy-action-button legacy-action-button--update"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="legacy-action-button legacy-action-button--delete"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(u)}
                            className="legacy-action-button legacy-action-button--edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="legacy-action-button legacy-action-button--delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyUpdates;