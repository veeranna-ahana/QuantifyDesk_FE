
import React, { useEffect, useState } from 'react';
import axios from 'axios';
//const BASE_URL  = process.env.REACT_APP_API_BASE_URL;
const BASE_URL  = import.meta.env.VITE_API_BASE_URL;
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get('{BASE_URL}/api/users', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
console.log("result",res.data);

        setUsers(res.data || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="legacy-page">
      {/* Modern Heading */}
      <div className="legacy-heading-block">
        <h2 className="legacy-heading">Users</h2>
        <div className="legacy-heading-underline"></div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="legacy-state">Loading users...</div>
      ) : !users.length ? (
        <div className="legacy-state">No users found</div>
      ) : (
        <div className="legacy-table-card">
          <div className="legacy-table-scroll legacy-table-scroll--users">
            <table className="legacy-table">
              <thead className="legacy-table-head">
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Projects</th><th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td><td>{u.name}</td><td>{u.email}</td>
                    <td>
                        {u.projects && u.projects.length > 0
                          ? u.projects
                          : (
                            <span className="legacy-table-muted">
                              No Projects
                            </span>
                          )}
                      </td>
                    <td>{u.role}</td>
                    
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

export default Users;