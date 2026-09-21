import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userUtilization, setUserUtilization] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard');
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load dashboard summary.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserUtilization = async () => {
      try {
        const res = await api.get('/dashboard/user-utilization?range=monthly');
        console.log("setUserUtilization",res.data);
        
        setUserUtilization(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSummary();
    fetchUserUtilization();
  }, []);

  if (loading) {
    return (
      <div className="legacy-page-loading">
        <div className="legacy-page-loading-text">Loading dashboard...</div>
      </div>
    );
  }

  if (!summary) {
    return <div className="legacy-dashboard-no-data">No data available.</div>;
  }

  const getUtilizationColor = (utilization) => {
    const util = parseFloat(utilization);
    if (util < 50) return '#ff4444'; // red
    if (util >= 50 && util <= 80) return '#ff8800'; // orange
    return '#44ff44'; // green
  };

  return (
    <div className="legacy-page">
      <div className="legacy-heading-block">
        <h2 className="legacy-heading">Dashboard Summary</h2>
        <div className="legacy-heading-underline"></div>
      </div>

      {/* Summary Cards */}
      <div className="legacy-dashboard-cards">
        <div className="legacy-dashboard-card">
          <div className="legacy-dashboard-icon">👥</div>
          <div className="legacy-dashboard-content">
            <div className="legacy-dashboard-label">Total Users</div>
            <div className="legacy-dashboard-value">{summary.total_users}</div>
          </div>
        </div>

        <div className="legacy-dashboard-card">
          <div className="legacy-dashboard-icon">📁</div>
          <div className="legacy-dashboard-content">
            <div className="legacy-dashboard-label">Total Projects</div>
            <div className="legacy-dashboard-value">{summary.total_projects}</div>
          </div>
        </div>

        <div className="legacy-dashboard-card">
          <div className="legacy-dashboard-icon">✅</div>
          <div className="legacy-dashboard-content">
            <div className="legacy-dashboard-label">Total Tasks</div>
            <div className="legacy-dashboard-value">{summary.total_tasks}</div>
          </div>
        </div>

        <div className="legacy-dashboard-card">
          <div className="legacy-dashboard-icon">⏱️</div>
          <div className="legacy-dashboard-content">
            <div className="legacy-dashboard-label">Total Hours</div>
            <div className="legacy-dashboard-value">{summary.total_hours}</div>
          </div>
        </div>
      </div>

      {/* User Utilization Section */}
           {/* User Utilization Section */}
      <div className="legacy-dashboard-section">
        <div className="legacy-heading-block">
          <h3 className="legacy-dashboard-subheading">User Utilization</h3>
          <div className="legacy-heading-underline"></div>
      </div>
        
        {userUtilization.length > 0 ? (
          <div className="legacy-table-card">
            <div className="legacy-dashboard-table">
              <table className="legacy-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Projects</th><th>Total Hours</th><th>Working Days</th><th>Capacity</th><th>Available Hours</th><th>Utilization %</th>
                  </tr>
                </thead>
                <tbody>
                  {userUtilization.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.name}</td>
                      <td>
                        {user.projects && user.projects.length > 0
                          ? user.projects.join(", ")
                          : (
                            <span className="legacy-table-muted">
                              No Projects
                            </span>
                          )}
                      </td>
                      <td>{user.total_hours}</td><td>{user.working_days}</td><td>{user.daily_capacity}</td><td>{user.available_hours}</td>
                      <td
                        style={{
                          backgroundColor: getUtilizationColor(user.utilization_percentage),
                        }}
                        className="legacy-dashboard-utilization"
                      >
                        {user.utilization_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="legacy-state">No utilization data available.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;