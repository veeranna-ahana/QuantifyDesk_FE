
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import SearchableSelect from '@/components/ui/SearchableSelect/SearchableSelect';
//const BASE_URL  = process.env.REACT_APP_API_BASE_URL;
const BASE_URL  = import.meta.env.VITE_API_BASE_URL;

const Tasks = () => {
  const serviceDeliveryEmployees = useSelector(
    (state) => state.auth.serviceDeliveryEmployees
  );
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [taskName, setTaskName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  // 🔥 Fetch projects & users on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const headers = getAuthHeaders();

        const [projectsRes, usersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/projects`, { headers }),
          axios.get(`${BASE_URL}/api/users`, { headers }),
        ]);

        setProjects(projectsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error(err);
        setProjects([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTasks = async () => {
    if (!selectedProject) {
      setTasks([]);
      return;
    }
  
    try {
      const headers = getAuthHeaders();
  
      const res = await axios.get(
        `${BASE_URL}/api/tasks?projectId=${selectedProject}`,
        { headers }
      );
  
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);
  

  // 🔥 Create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
  
    if (!taskName || !selectedProject || !selectedUserId) {
      alert("Please fill all required fields");
      return;
    }
  
    try {
      setCreating(true);
  
      const headers = getAuthHeaders();
  
      await axios.post(
        `${BASE_URL}/api/tasks`,
        {
          project_id: selectedProject,
          assigned_user_id: selectedUserId,
          task_name: taskName,
          planned_units: 0,
        },
        { headers }
      );
  
      setTaskName('');
      setSelectedUserId('');
  
      // re-fetch tasks
      fetchTasks();
  
    } catch (err) {
      console.error(err);
      alert('Failed to create task');
    } finally {
      setCreating(false);
    }
  };
  

  return (
    <div className="legacy-page">
      {/* Modern Heading */}
      <div className="legacy-heading-block">
        <h2 className="legacy-heading">Tasks</h2>
        <div className="legacy-heading-underline"></div>
      </div>

      {/* Modern Form */}
      <form onSubmit={handleCreateTask} className="legacy-form">
        <div className="legacy-form-row">
          <div className="legacy-form-group">
            <label className="legacy-form-label">Task Name</label>
            <input
              type="text"
              placeholder="Enter task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="legacy-form-input"
            />
          </div>

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
            <label className="legacy-form-label">Select User</label>
            <SearchableSelect
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Select User"
              options={serviceDeliveryEmployees.map(emp => ({ value: String(emp.employee_id), label: emp.emp_name }))}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={creating} 
          className="legacy-button-submit"
        >
          {creating ? 'Creating...' : 'Add Task'}
        </button>
      </form>

      {/* Tasks Table */}
      {loading ? (
        <div className="legacy-state">Loading tasks...</div>
      ) : !tasks.length ? (
        <div className="legacy-state">No tasks found. Select a project to view tasks.</div>
      ) : (
        <div className="legacy-table-card">
          <div className="legacy-table-scroll">
            <table className="legacy-table">
              <thead className="legacy-table-head">
                <tr>
                  <th>ID</th><th>Project ID</th><th>Assigned User ID</th><th>Title</th><th>Planned Units</th><th>Status</th><th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td><td>{t.project_id}</td><td>{t.assigned_user_id}</td><td>{t.task_name || t.title}</td><td>{t.planned_units || 0}</td>
                    <td>
                      <span style={{
                        backgroundColor: t.status === 'COMPLETED' ? '#44ff44' : 
                                       t.status === 'IN_PROGRESS' ? '#ff8800' : '#ff4444',
                      }}>
                      className="legacy-table-badge"
                        {t.status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;