const { query, masterQuery } = require("../config/db");
const { createNotification } = require("./notification.controller");

const resolveLocalUserId = async (empId, empName, empEmail) => {
  // 1. Try to match by emp_id in local users
  if (empId) {
    const rows = await query("SELECT id FROM users WHERE emp_id = ?", [empId]);
    if (rows.length > 0) return rows[0].id;
  }

  // 2. Try to match by email
  if (empEmail) {
    const rows = await query("SELECT id FROM users WHERE email = ?", [empEmail]);
    if (rows.length > 0) {
      // Self-heal: update emp_id
      if (empId) {
        await query("UPDATE users SET emp_id = ? WHERE id = ?", [empId, rows[0].id]);
      }
      return rows[0].id;
    }
  }

  // 3. Try to match by cleaning name (ignore salutations, spaces, punctuation)
  if (empName) {
    const clean = (n) => {
      if (!n) return "";
      return n
        .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
    };
    const targetCleaned = clean(empName);
    
    const allUsers = await query("SELECT id, name, email FROM users");
    for (const u of allUsers) {
      if (clean(u.name) === targetCleaned) {
        // Self-heal: update emp_id
        if (empId) {
          await query("UPDATE users SET emp_id = ? WHERE id = ?", [empId, u.id]);
        }
        return u.id;
      }
    }
  }

  return null;
};

// GET /api/assignments/catalog
const getCatalog = async (req, res, next) => {
  try {
    const rows = await query(`SELECT id, role, task_name, unit_type, notes FROM role_task_catalog ORDER BY role, id`);
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.role]) grouped[row.role] = [];
      grouped[row.role].push(row);
    }
    return res.status(200).json({ flat: rows, grouped });
  } catch (err) { return next(err); }
};

// GET /api/assignments/effort-estimates/:projectId
// Fetches role-level effort data from effort_estimates table
const getEffortEstimates = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const rows = await query(
      `SELECT 
         id, project_id, role,
         effort_days, effort_hrs,
         buffer_days, buffer_hrs,
         total_hrs, units, unit_label
       FROM effort_estimates
       WHERE project_id = ?
       ORDER BY role`,
      [projectId]
    );
    // Key by role for easy frontend lookup
    const byRole = {};
    for (const row of rows) {
      byRole[row.role] = row;
    }
    return res.status(200).json({ estimates: rows, byRole });
  } catch (err) { return next(err); }
};

// GET /api/assignments/task-loads/:projectId
// Now includes estimated_days and estimated_hours per task
const getTaskLoads = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const rows = await query(
  `SELECT
      ptl.id,
      ptl.project_id,
      ptl.role,
      ptl.task_name,
      ptl.planned_units,
      ptl.estimated_days,
      ptl.estimated_hours,

      ee.effort_days,
      ee.effort_hrs,

      rtc.unit_type,
      rtc.notes

   FROM project_task_loads ptl

   LEFT JOIN role_task_catalog rtc
     ON ptl.role = rtc.role
    AND ptl.task_name = rtc.task_name

   LEFT JOIN effort_estimates ee
     ON ee.project_id = ptl.project_id
    AND ee.role = ptl.role

   WHERE ptl.project_id = ?

   ORDER BY ptl.role, ptl.task_name`,
  [projectId]
);
    const total = rows.reduce((s, r) => s + Number(r.planned_units), 0);
    // const totalEstHours = rows.reduce((s, r) => s + Number(r.estimated_hours || 0), 0);
    const totalEstHours = rows.reduce((s, r) => s + Number(r.effort_hrs || 0), 0);
    return res.status(200).json({ 
      loads: rows, 
      total_load: total,
      total_estimated_hours: totalEstHours
    });
  } catch (err) { return next(err); }
};

// POST /api/assignments/task-loads (single upsert)
// Now supports estimated_days and estimated_hours
const upsertTaskLoad = async (req, res, next) => {
  try {
    const { project_id, role, task_name, planned_units } = req.body;

    if (!project_id || !role || !task_name) {
      return res.status(400).json({
        message: "project_id, role, task_name required"
      });
    }

    await query(
      `INSERT INTO project_task_loads
       (project_id, role, task_name, planned_units)
       VALUES (?, ?, ?, ?)

       ON DUPLICATE KEY UPDATE
       planned_units = VALUES(planned_units)`,
      [
        project_id,
        role,
        task_name,
        planned_units || 0
      ]
    );

    return res.status(200).json({
      message: "Saved"
    });

  } catch (err) {
    return next(err);
  }
};

// POST /api/assignments/task-loads/bulk
// Now supports estimated_days and estimated_hours per task
const bulkUpsertTaskLoads = async (req, res, next) => {
  try {
    const { project_id, loads } = req.body;

    if (!project_id || !Array.isArray(loads)) {
      return res.status(400).json({
        message: "project_id and loads[] required"
      });
    }

    for (const load of loads) {
      // await query(
      //   `INSERT INTO project_task_loads
      //    (project_id, role, task_name, planned_units)
      //    VALUES (?, ?, ?, ?)

      //    ON DUPLICATE KEY UPDATE
      //    planned_units = VALUES(planned_units)`,
      //   [
      //     project_id,
      //     load.role,
      //     load.task_name,
      //     load.planned_units || 0
      //   ]
      // );
    await query(
  `INSERT INTO project_task_loads
   (
     project_id,
     role,
     task_name,
     planned_units,
     estimated_days,
     estimated_hours
   )
   VALUES (?, ?, ?, ?, ?, ?)

   ON DUPLICATE KEY UPDATE
   planned_units   = VALUES(planned_units),
   estimated_days = VALUES(estimated_days),
   estimated_hours = VALUES(estimated_hours)`,
  [
    project_id,
    load.role,
    load.task_name,
    load.planned_units || 0,
    load.estimated_days || 0,
    load.estimated_hours || 0
  ]
);
    }

    const rows = await query(
      `SELECT
          ptl.*,
          rtc.unit_type

       FROM project_task_loads ptl

       LEFT JOIN role_task_catalog rtc
         ON ptl.role = rtc.role
        AND ptl.task_name = rtc.task_name

       WHERE ptl.project_id = ?`,
      [project_id]
    );

    return res.status(200).json({
      loads: rows,
      total_load: rows.reduce(
        (s, r) => s + Number(r.planned_units),
        0
      )
    });

  } catch (err) {
    return next(err);
  }
};

// GET /api/assignments/summary/:projectId
const getProjectSummary = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const [rows, effortEst] = await Promise.all([
      query(
        `SELECT
            ptl.role,
            ptl.task_name,
            ptl.planned_units,
      
            ee.effort_days,
            ee.effort_hrs,
      
            rtc.unit_type,
      
            COALESCE(SUM(a.units_assigned), 0) AS total_assigned,
      
            COALESCE(SUM(ap_t.units_completed), 0) AS total_completed,
      
            GREATEST(
              ptl.planned_units -
              COALESCE(SUM(a.units_assigned), 0),
              0
            ) AS unassigned,
      
            GREATEST(
              COALESCE(SUM(a.units_assigned), 0) -
              COALESCE(SUM(ap_t.units_completed), 0),
              0
            ) AS pending
      
         FROM project_task_loads ptl
      
         LEFT JOIN effort_estimates ee
           ON ee.project_id = ptl.project_id
          AND ee.role = ptl.role
      
         LEFT JOIN role_task_catalog rtc
           ON ptl.role = rtc.role
          AND ptl.task_name = rtc.task_name
      
         LEFT JOIN assignments a
           ON a.project_id = ptl.project_id
          AND a.role = ptl.role
          AND a.task_name = ptl.task_name
      
         LEFT JOIN (
            SELECT
              assignment_id,
              SUM(units_completed) AS units_completed
            FROM assignment_progress
            GROUP BY assignment_id
         ) ap_t
           ON ap_t.assignment_id = a.id
      
         WHERE ptl.project_id = ?
      
         GROUP BY
            ptl.role,
            ptl.task_name,
            ptl.planned_units,
            ee.effort_days,
            ee.effort_hrs,
            rtc.unit_type
      
         ORDER BY
            ptl.role,
            ptl.task_name`,
        [projectId]
      ),
      query(
        `SELECT COALESCE(SUM(effort_days), 0) AS total_days, COALESCE(SUM(effort_hrs), 0) AS total_hours
         FROM effort_estimates
         WHERE project_id = ?`,
        [projectId]
      )
    ]);

    const totalEffortDays = Number(effortEst[0]?.total_days || 0);
    const totalEffortHours = Number(effortEst[0]?.total_hours || 0);

    const totals = {
      total_planned: rows.reduce(
        (s, r) => s + Number(r.planned_units),
        0
      ),
    
      total_effort_days: totalEffortDays,
    
      total_effort_hours: totalEffortHours,
    
      total_assigned: rows.reduce(
        (s, r) => s + Number(r.total_assigned),
        0
      ),
    
      total_completed: rows.reduce(
        (s, r) => s + Number(r.total_completed),
        0
      ),
    
      total_pending: rows.reduce(
        (s, r) => s + Number(r.pending),
        0
      )
    };
    return res.status(200).json({ rows, totals });
  } catch (err) { return next(err); }
};

// GET /api/assignments?projectId= (UPDATED: Uses master.emp)
const getAssignmentsByProject = async (req, res, next) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({
        message: "projectId required"
      });
    }

    const rows = await query(
      `SELECT 
          a.id,
          a.project_id,
          p.project_name,
          a.user_id,
          a.emp_id,
          e.emp_name AS user_name,  -- ✅ From master.emp
          a.role,
          a.task_name,
          a.units_assigned,

          ee.effort_days,
          ee.effort_hrs,
          ee.buffer_days,
          ee.buffer_hrs,
          ee.total_hrs,
          ee.units,
          ee.unit_label

       FROM assignments a

       LEFT JOIN master.emp e      -- ✅ Replaced users table
         ON a.emp_id = e.emp_id

       LEFT JOIN projects p
         ON a.project_id = p.id

       LEFT JOIN effort_estimates ee
         ON ee.project_id = a.project_id
         AND ee.role = a.role

       WHERE a.project_id = ?

       ORDER BY a.role, e.emp_name`,
      [projectId]
    );

    return res.status(200).json(rows);

  } catch (err) {
    return next(err);
  }
};
// POST /api/assignments
const addAssignment = async (req, res, next) => {
  try {
    const { 
      project_id, 
      user_id,
      emp_id,
      role, 
      task_name, 
      units_assigned,
      estimated_hours,
      estimated_days
    } = req.body;
    
    // ─── Validation ──────────────────────────────────────────────
    if (!project_id || !role || !task_name) {
      return res.status(400).json({ 
        message: "project_id, role, task_name required" 
      });
    }

    if (!user_id && !emp_id) {
      return res.status(400).json({
        message: "Either user_id or emp_id is required"
      });
    }

    // ─── Get employee details ──────────────────────────────────
    let finalEmpId = emp_id;
    let finalUserId = null;

    if (user_id && !emp_id) {
      // user_id can be emp_id or local users.id
      const empResult = await masterQuery(
        `SELECT u_id, emp_id, emp_name, emp_email FROM emp WHERE emp_id = ? AND flag = 'Active'`,
        [user_id]
      );
      
      if (empResult.length > 0) {
        finalEmpId = empResult[0].emp_id;
        finalUserId = await resolveLocalUserId(finalEmpId, empResult[0].emp_name, empResult[0].emp_email);
      } else {
        // Try local users table (maybe user_id is a local users.id)
        const userResult = await query(
          `SELECT emp_id, name, email FROM users WHERE id = ?`,
          [user_id]
        );
        if (userResult.length > 0) {
          finalEmpId = userResult[0].emp_id;
          finalUserId = user_id;
          
          // If local user has no emp_id, let's try to resolve it from master.emp by name/email
          if (!finalEmpId) {
            const empInfo = await masterQuery(
              `SELECT emp_id FROM emp WHERE emp_name = ? OR emp_email = ? AND flag = 'Active'`,
              [userResult[0].name, userResult[0].email]
            );
            if (empInfo.length > 0) {
              finalEmpId = empInfo[0].emp_id;
              // Self-heal: update users table
              await query("UPDATE users SET emp_id = ? WHERE id = ?", [finalEmpId, finalUserId]);
            }
          }
        } else {
          return res.status(400).json({
            message: "User not found in system"
          });
        }
      }
    } else if (emp_id && !user_id) {
      const empResult = await masterQuery(
        `SELECT u_id, emp_id, emp_name, emp_email FROM emp WHERE emp_id = ? AND flag = 'Active'`,
        [emp_id]
      );
      if (empResult.length > 0) {
        finalEmpId = empResult[0].emp_id;
        finalUserId = await resolveLocalUserId(finalEmpId, empResult[0].emp_name, empResult[0].emp_email);
      } else {
        return res.status(400).json({
          message: "Employee not found in master.emp"
        });
      }
    }

    if (!finalUserId) {
      return res.status(400).json({
        message: "User account not found in main database. Please contact an admin."
      });
    }

    // ─── ✅ REMOVED duplicate check ────────────────────────────
    // Allow multiple assignments for same employee with different roles/tasks

    // ─── VALIDATION: Check if assignment exceeds task limits ────
    const taskLoad = await query(
      `SELECT 
         planned_units, 
         estimated_days, 
         estimated_hours 
       FROM project_task_loads 
       WHERE project_id = ? AND role = ? AND task_name = ?`,
      [project_id, role, task_name]
    );

    if (taskLoad.length === 0) {
      return res.status(400).json({
        message: `No task load found for ${role} - ${task_name}. Please define task load first.`
      });
    }

    const plannedUnits = Number(taskLoad[0].planned_units) || 0;
    const plannedDays = Number(taskLoad[0].estimated_days) || 0;
    const plannedHours = Number(taskLoad[0].estimated_hours) || 0;

    // Get currently assigned totals for this task (across all employees)
    const assignedTotals = await query(
      `SELECT 
         SUM(units_assigned) as total_units,
         SUM(estimated_days) as total_days,
         SUM(estimated_hours) as total_hours
       FROM assignments 
       WHERE project_id = ? AND role = ? AND task_name = ?`,
      [project_id, role, task_name]
    );

    const currentUnits = Number(assignedTotals[0]?.total_units || 0);
    const currentDays = Number(assignedTotals[0]?.total_days || 0);
    const currentHours = Number(assignedTotals[0]?.total_hours || 0);

    const newUnits = Number(units_assigned || 0);
    const newDays = Number(estimated_days || 0);
    const newHours = Number(estimated_hours || 0);

    // Check if any limit would be exceeded
    const errors = [];
    let wouldExceed = false;

    if ((currentUnits + newUnits) > plannedUnits) {
      errors.push({
        field: 'units',
        message: `Cannot assign ${newUnits} units. Total would exceed planned units (${plannedUnits}). Remaining: ${plannedUnits - currentUnits}`,
        planned: plannedUnits,
        assigned: currentUnits,
        requested: newUnits,
        remaining: plannedUnits - currentUnits
      });
      wouldExceed = true;
    }

    if ((currentDays + newDays) > plannedDays) {
      errors.push({
        field: 'days',
        message: `Cannot assign ${newDays} days. Total would exceed planned days (${plannedDays}). Remaining: ${plannedDays - currentDays}`,
        planned: plannedDays,
        assigned: currentDays,
        requested: newDays,
        remaining: plannedDays - currentDays
      });
      wouldExceed = true;
    }

    if ((currentHours + newHours) > plannedHours) {
      errors.push({
        field: 'hours',
        message: `Cannot assign ${newHours} hours. Total would exceed planned hours (${plannedHours}). Remaining: ${plannedHours - currentHours}`,
        planned: plannedHours,
        assigned: currentHours,
        requested: newHours,
        remaining: plannedHours - currentHours
      });
      wouldExceed = true;
    }

    if (wouldExceed) {
      return res.status(400).json({
        success: false,
        message: 'Assignment would exceed task limits',
        errors: errors
      });
    }

    // ─── Get employee name for notification ──────────────────────
    const empInfo = await masterQuery(
      `SELECT emp_name FROM emp WHERE emp_id = ?`,
      [finalEmpId]
    );
    const employeeName = empInfo.length > 0 ? empInfo[0].emp_name : 'Employee';

    // ─── Insert assignment ──────────────────────────────────────
    const result = await query(
      `INSERT INTO assignments 
       (project_id, user_id, emp_id, role, task_name, units_assigned, estimated_days, estimated_hours) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [project_id, finalUserId, finalEmpId, role, task_name, newUnits, newDays, newHours]
    );

    // ─── Fetch the created assignment ──────────────────────────
    const rows = await query(
      `SELECT
          a.*,
          e.emp_name AS user_name,
          p.project_name,
          ee.effort_days,
          ee.effort_hrs,
          ee.buffer_days,
          ee.buffer_hrs,
          ee.total_hrs,
          ee.units,
          ee.unit_label
       FROM assignments a
       LEFT JOIN master.emp e ON a.emp_id = e.emp_id
       LEFT JOIN projects p ON a.project_id = p.id
       LEFT JOIN effort_estimates ee ON ee.project_id = a.project_id AND ee.role = a.role
       WHERE a.id = ?`,
      [result.insertId]
    );

    const assignment = rows[0];

    // ─── Create Notification ────────────────────────────────────
    try {
      await createNotification({
        user_id: finalUserId,
        type: 'assignment_created',
        title: `New assignment on ${assignment.project_name}`,
        message: `You (${employeeName}) have been assigned ${newUnits} unit(s) of "${task_name}" (${role}) on "${assignment.project_name}". (${newDays} days, ${newHours} hours)`,
      });
    } catch (notifErr) {
      console.warn('⚠️ Notification creation failed:', notifErr.message);
      // Don't fail the assignment if notification fails
    }

    // ─── Return response ────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment,
      remaining: {
        units: plannedUnits - (currentUnits + newUnits),
        days: plannedDays - (currentDays + newDays),
        hours: plannedHours - (currentHours + newHours)
      }
    });

  } catch (err) { 
    console.error('❌ addAssignment error:', err);
    return next(err); 
  }
};

// PUT /api/assignments/:id (UPDATED: Uses emp_id)
const updateAssignment = async (req, res, next) => {
  try {
    const { role, task_name, units_assigned, emp_id, user_id } = req.body;
    
    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (task_name) {
      updateFields.push('task_name = ?');
      updateValues.push(task_name);
    }
    if (units_assigned !== undefined) {
      updateFields.push('units_assigned = ?');
      updateValues.push(units_assigned);
    }
    if (emp_id) {
      updateFields.push('emp_id = ?');
      updateValues.push(emp_id);
    }
    if (user_id) {
      updateFields.push('user_id = ?');
      updateValues.push(user_id);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        message: "No fields to update"
      });
    }
    
    updateValues.push(req.params.id);
    
    await query(
      `UPDATE assignments SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({ message: "Updated" });
  } catch (err) { next(err); }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res, next) => {
  try {
    await query(`DELETE FROM assignments WHERE id=?`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
};

module.exports = {
  getCatalog,
  getEffortEstimates,
  getTaskLoads,
  upsertTaskLoad,
  bulkUpsertTaskLoads,
  getProjectSummary,
  getAssignmentsByProject,
  addAssignment,
  updateAssignment,
  deleteAssignment,
};