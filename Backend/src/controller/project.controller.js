const { query, projectCodeQuery } = require('../config/db');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects
// Body: { name, clientName, description, nbdId, o2dId, projectCode,
//         subCategory, startDate, endDate, status }
// ─────────────────────────────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const {
      name,
      clientName,
      description,
      nbdId,
      o2dId,
      projectCode,
      subCategory,
      startDate,
      endDate,
      status,
      projectType,
      teamLead,
    } = req.body;

    if (!name || !clientName) {
      return res.status(400).json({
        message: 'Project name and client name are required',
      });
    }

    // ─── Check for duplicates BEFORE insert ──────────────────────────────
    const duplicateErrors = [];
    const duplicateDetails = [];

    // Check project_name
    const nameCheck = await query(
      'SELECT id, project_name FROM projects WHERE project_name = ?',
      [name]
    );
    if (nameCheck.length > 0) {
      duplicateErrors.push(`Project name "${name}" is already in use`);
      duplicateDetails.push({
        id: nameCheck[0].id,
        project_name: nameCheck[0].project_name,
      });
    }

    // Check nbd_id (if provided)
    if (nbdId) {
      const nbdCheck = await query(
        'SELECT id, nbd_id FROM projects WHERE nbd_id = ?',
        [nbdId]
      );
      if (nbdCheck.length > 0) {
        duplicateErrors.push(`NBD ID "${nbdId}" is already in use`);
        duplicateDetails.push({
          id: nbdCheck[0].id,
          nbd_id: nbdCheck[0].nbd_id,
        });
      }
    }

    // Check project_code (if provided)
    if (projectCode) {
      const codeCheck = await query(
        'SELECT id, project_code FROM projects WHERE project_code = ?',
        [projectCode]
      );
      if (codeCheck.length > 0) {
        duplicateErrors.push(`Project code "${projectCode}" is already in use`);
        duplicateDetails.push({
          id: codeCheck[0].id,
          project_code: codeCheck[0].project_code,
        });
      }
    }

    // If any duplicates found, return error
    if (duplicateErrors.length > 0) {
      return res.status(409).json({
        message: 'Duplicate entry found',
        errors: duplicateErrors,
        details: duplicateDetails,
      });
    }

    // ─── Insert new project ────────────────────────────────────────────────
    const sql = `
      INSERT INTO projects
        (project_name, client_name, description, nbd_id, o2d_id,
         project_code, sub_category, start_date, end_date, status, project_type, team_lead)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      clientName,
      description || null,
      nbdId || null,
      o2dId || null,
      projectCode || null,
      subCategory || null,
      startDate || null,
      endDate || null,
      status || 'New',
      projectType || null,
      teamLead || null,
    ];

    const result = await query(sql, params);

    // Return the full newly-created row
    const rows = await query(
      `SELECT id, project_name, client_name, description, nbd_id, o2d_id,
              project_code, sub_category, start_date, end_date, status, project_type, team_lead
       FROM projects WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    // Handle any unexpected MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      // This is a fallback in case the unique constraint catches something
      return res.status(409).json({
        message: 'Duplicate entry found',
        errors: ['A project with this name, NBD ID, or project code already exists'],
        details: [],
      });
    }
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects
// Returns all projects ordered by id ASC
// ─────────────────────────────────────────────────────────────────────────────
const getAllProjects = async (req, res, next) => {
  try {
    const sql = `
  SELECT
    p.id,
    p.project_name,
    p.client_name,
    p.description,
    p.nbd_id,
    p.o2d_id,
    p.project_code,
    p.sub_category,
    p.start_date,
    p.end_date,
    p.status,
    p.project_type,
    p.team_lead,
    p.create_cr,
    COALESCE(SUM(e.total_hrs), 0) AS total_effort_hours,
    COALESCE(SUM(e.effort_days + e.buffer_days), 0) AS total_effort_days

  FROM projects p

  LEFT JOIN effort_estimates e
    ON e.project_id = p.id

  GROUP BY
    p.id,
    p.project_name,
    p.client_name,
    p.description,
    p.nbd_id,
    p.o2d_id,
    p.project_code,
    p.sub_category,
    p.start_date,
    p.end_date,
    p.status,
    p.project_type,
    p.team_lead,
    p.create_cr

  ORDER BY p.id ASC
`;
    const projects = await query(sql);
    return res.status(200).json(projects);
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/:projectId/effort
// Returns all effort-estimate rows for a project (empty array if none yet)
// ─────────────────────────────────────────────────────────────────────────────
const getEffortEstimate = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const rows = await query(
      `SELECT id, project_id, role, effort_days, effort_hrs,
              buffer_days, buffer_hrs, total_hrs, units, unit_label
       FROM effort_estimates
       WHERE project_id = ?
       ORDER BY id ASC`,
      [projectId]
    );

    // Also return totals for convenience
    const totals = rows.reduce(
      (acc, r) => ({
        effort_days: acc.effort_days + Number(r.effort_days),
        effort_hrs:  acc.effort_hrs  + Number(r.effort_hrs),
        buffer_days: acc.buffer_days + Number(r.buffer_days),
        buffer_hrs:  acc.buffer_hrs  + Number(r.buffer_hrs),
        total_hrs:   acc.total_hrs   + Number(r.total_hrs),
      }),
      { effort_days: 0, effort_hrs: 0, buffer_days: 0, buffer_hrs: 0, total_hrs: 0 }
    );

    return res.status(200).json({ rows, totals });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/projects/:projectId/effort/bulk
// Body: { rows: [ { role, effort_days, buffer_days, units, unit_label }, … ] }
// Upserts all rows in one call (INSERT … ON DUPLICATE KEY UPDATE).
// The backend recalculates hrs and total_hrs from days so the frontend
// doesn't need to send derived values.
// ─────────────────────────────────────────────────────────────────────────────
const upsertEffortEstimate = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { rows }      = req.body;

    if (!projectId || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'projectId and rows[] are required' });
    }

    const HOURS_PER_DAY = 8;

    for (const r of rows) {
      const effortDays = parseFloat(r.effort_days) || 0;
      const bufferDays = parseFloat(r.buffer_days) || 0;
      const effortHrs  = effortDays * HOURS_PER_DAY;
      const bufferHrs  = bufferDays * HOURS_PER_DAY;
      const totalHrs   = effortHrs + bufferHrs;

      await query(
        `INSERT INTO effort_estimates
           (project_id, role, effort_days, effort_hrs,
            buffer_days, buffer_hrs, total_hrs, units, unit_label)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           effort_days = VALUES(effort_days),
           effort_hrs  = VALUES(effort_hrs),
           buffer_days = VALUES(buffer_days),
           buffer_hrs  = VALUES(buffer_hrs),
           total_hrs   = VALUES(total_hrs),
           units       = VALUES(units),
           unit_label  = VALUES(unit_label),
           updated_at  = CURRENT_TIMESTAMP`,
        [
          projectId,
          r.role,
          effortDays,
          effortHrs,
          bufferDays,
          bufferHrs,
          totalHrs,
          r.units     || null,
          r.unit_label || null,
        ]
      );
    }

    // Return the freshly-saved data
    const saved = await query(
      `SELECT id, project_id, role, effort_days, effort_hrs,
              buffer_days, buffer_hrs, total_hrs, units, unit_label
       FROM effort_estimates WHERE project_id = ? ORDER BY id ASC`,
      [projectId]
    );

    const totals = saved.reduce(
      (acc, r) => ({
        effort_days: acc.effort_days + Number(r.effort_days),
        effort_hrs:  acc.effort_hrs  + Number(r.effort_hrs),
        buffer_days: acc.buffer_days + Number(r.buffer_days),
        buffer_hrs:  acc.buffer_hrs  + Number(r.buffer_hrs),
        total_hrs:   acc.total_hrs   + Number(r.total_hrs),
      }),
      { effort_days: 0, effort_hrs: 0, buffer_days: 0, buffer_hrs: 0, total_hrs: 0 }
    );

    return res.status(200).json({ message: 'Saved', rows: saved, totals });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/projects/:projectId/effort
// Wipes all effort rows for a project (useful for a "Reset" button)
// ─────────────────────────────────────────────────────────────────────────────
const deleteEffortEstimate = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    await query('DELETE FROM effort_estimates WHERE project_id = ?', [projectId]);
    return res.status(200).json({ message: 'Effort estimate cleared' });
  } catch (err) {
    return next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/projects/:id
// Body: { name, clientName, description, nbdId, o2dId, projectCode,
//         subCategory, startDate, endDate, status, projectType }
// ─────────────────────────────────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      clientName,
      description,
      nbdId,
      o2dId,
      projectCode,
      subCategory,
      startDate,
      endDate,
      status,
      projectType,
      teamLead,
      createCr,
    } = req.body;

    // Check if project exists
    const projectExists = await query('SELECT id FROM projects WHERE id = ?', [id]);
    if (!projectExists.length) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const current = (await query('SELECT * FROM projects WHERE id = ?', [id]))[0];

    // Prepare updated values
    const updatedName = name !== undefined ? name : current.project_name;
    const updatedClientName = clientName !== undefined ? clientName : current.client_name;
    const updatedDescription = description !== undefined ? description : current.description;
    const updatedNbdId = nbdId !== undefined ? nbdId : current.nbd_id;
    const updatedO2dId = o2dId !== undefined ? o2dId : current.o2d_id;
    const updatedProjectCode = projectCode !== undefined ? projectCode : current.project_code;
    const updatedSubCategory = subCategory !== undefined ? subCategory : current.sub_category;
    const updatedStartDate = startDate !== undefined ? startDate : current.start_date;
    const updatedEndDate = endDate !== undefined ? endDate : current.end_date;
    const updatedStatus = status !== undefined ? status : current.status;
    const updatedProjectType = projectType !== undefined ? projectType : current.project_type;
    const updatedTeamLead = teamLead !== undefined ? teamLead : current.team_lead;
    const updatedCreateCr = createCr !== undefined ? createCr : current.create_cr;

    // ─── Check for duplicates (excluding current project) ────────────────
    const duplicateErrors = [];
    const duplicateDetails = [];

    // Check project_name
    if (updatedName && updatedName !== current.project_name) {
      const nameCheck = await query(
        'SELECT id, project_name FROM projects WHERE project_name = ? AND id != ?',
        [updatedName, id]
      );
      if (nameCheck.length > 0) {
        duplicateErrors.push(`Project name "${updatedName}" is already in use`);
        duplicateDetails.push({
          id: nameCheck[0].id,
          project_name: nameCheck[0].project_name,
        });
      }
    }

    // Check nbd_id
    if (updatedNbdId && updatedNbdId !== current.nbd_id) {
      const nbdCheck = await query(
        'SELECT id, nbd_id FROM projects WHERE nbd_id = ? AND id != ?',
        [updatedNbdId, id]
      );
      if (nbdCheck.length > 0) {
        duplicateErrors.push(`NBD ID "${updatedNbdId}" is already in use`);
        duplicateDetails.push({
          id: nbdCheck[0].id,
          nbd_id: nbdCheck[0].nbd_id,
        });
      }
    }

    // Check project_code
    if (updatedProjectCode && updatedProjectCode !== current.project_code) {
      const codeCheck = await query(
        'SELECT id, project_code FROM projects WHERE project_code = ? AND id != ?',
        [updatedProjectCode, id]
      );
      if (codeCheck.length > 0) {
        duplicateErrors.push(`Project code "${updatedProjectCode}" is already in use`);
        duplicateDetails.push({
          id: codeCheck[0].id,
          project_code: codeCheck[0].project_code,
        });
      }
    }

    // If any duplicates found, return error
    if (duplicateErrors.length > 0) {
      return res.status(409).json({
        message: 'Duplicate entry found',
        errors: duplicateErrors,
        details: duplicateDetails,
      });
    }

    // ─── Update project ────────────────────────────────────────────────────
    const updateSql = `
      UPDATE projects
      SET
        project_name = ?,
        client_name = ?,
        description = ?,
        nbd_id = ?,
        o2d_id = ?,
        project_code = ?,
        sub_category = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        project_type = ?,
        team_lead = ?,
        create_cr = ?
      WHERE id = ?
    `;

    await query(updateSql, [
      updatedName,
      updatedClientName,
      updatedDescription,
      updatedNbdId,
      updatedO2dId,
      updatedProjectCode,
      updatedSubCategory,
      updatedStartDate,
      updatedEndDate,
      updatedStatus,
      updatedProjectType,
      updatedTeamLead,
      updatedCreateCr,
      id,
    ]);

    const updatedRows = await query(
      `SELECT id, project_name, client_name, description, nbd_id, o2d_id,
              project_code, sub_category, start_date, end_date, status, 
              project_type, team_lead, create_cr
       FROM projects WHERE id = ?`,
      [id]
    );

    return res.status(200).json(updatedRows[0]);
  } catch (err) {
    // Handle any unexpected MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Duplicate entry found',
        errors: ['A project with this name, NBD ID, or project code already exists'],
        details: [],
      });
    }
    return next(err);
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/projects/customers (or /api/customers)
// Returns deduplicated list of customers from project_codes table (or projects fallback)
// ─────────────────────────────────────────────────────────────────────────────
const getCustomers = async (req, res, next) => {
  try {
    let rows = [];

    // Attempt 1: Query projectCodePool for project_codes_import table
    try {
      rows = await projectCodeQuery(
        `SELECT DISTINCT customer_name 
         FROM project_codes_import 
         WHERE customer_name IS NOT NULL AND TRIM(customer_name) != '' 
         ORDER BY customer_name ASC`
      );
    } catch (e1) {
      // Attempt 2: Query projectCodePool for project_codes table
      try {
        rows = await projectCodeQuery(
          `SELECT DISTINCT customer_name 
           FROM project_codes 
           WHERE customer_name IS NOT NULL AND TRIM(customer_name) != '' 
           ORDER BY customer_name ASC`
        );
      } catch (e2) {
        // Attempt 3: Query quantifyPool for project_codes_db.project_codes_import
        try {
          rows = await query(
            `SELECT DISTINCT customer_name 
             FROM project_codes_db.project_codes_import 
             WHERE customer_name IS NOT NULL AND TRIM(customer_name) != '' 
             ORDER BY customer_name ASC`
          );
        } catch (e3) {
          // Attempt 4: Query quantifyPool for project_codes_db.project_codes
          try {
            rows = await query(
              `SELECT DISTINCT customer_name 
               FROM project_codes_db.project_codes 
               WHERE customer_name IS NOT NULL AND TRIM(customer_name) != '' 
               ORDER BY customer_name ASC`
            );
          } catch (e4) {
            // Attempt 5: Query quantifyPool for project_codes_import
            try {
              rows = await query(
                `SELECT DISTINCT customer_name 
                 FROM project_codes_import 
                 WHERE customer_name IS NOT NULL AND TRIM(customer_name) != '' 
                 ORDER BY customer_name ASC`
              );
            } catch (e5) {
              // Attempt 6: Query quantifyPool projects table client_name as fallback
              try {
                rows = await query(
                  `SELECT DISTINCT client_name AS customer_name 
                   FROM projects 
                   WHERE client_name IS NOT NULL AND TRIM(client_name) != '' 
                   ORDER BY client_name ASC`
                );
              } catch (e6) {
                console.error("All customer fetch queries failed:", e6.message);
              }
            }
          }
        }
      }
    }

    const customerNames = (rows || [])
      .map(r => r.customer_name || r.client_name)
      .filter(name => name && name.trim());
      
    const uniqueCustomers = [...new Set(customerNames)].sort();

    const formatted = uniqueCustomers.map((name, idx) => ({
      id: idx + 1,
      customer_name: name,
      name: name,
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getEffortEstimate,
  upsertEffortEstimate,
  deleteEffortEstimate,
  updateProject,
  getCustomers,
};