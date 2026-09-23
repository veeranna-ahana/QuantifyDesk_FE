import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  UserPlus,
  ArrowRight,
  ChevronDown,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './EffortDetailsTab.css';

// Initial dataset strictly matching the reference UI/UX mockup
const INITIAL_EFFORT_GROUPS = [
  {
    id: 'grp-ba',
    roleCategory: 'BA',
    members: [
      { id: 'ba-1', name: 'Navith', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 120 },
      { id: 'ba-2', name: 'Kusum', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 120 },
    ],
  },
  {
    id: 'grp-fe',
    roleCategory: 'FE Dev',
    members: [
      { id: 'fe-1', name: 'Soumya', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 120 },
      { id: 'fe-2', name: 'Ranjitha', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 120 },
    ],
  },
  {
    id: 'grp-be',
    roleCategory: 'BE Dev',
    members: [
      { id: 'be-1', name: 'Ankit', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 20 },
    ],
  },
  {
    id: 'grp-uiux',
    roleCategory: 'UI/UX',
    members: [
      { id: 'uiux-1', name: 'Devanshi', effortDays: 0, effortHrs: 100, bufferDays: 0, bufferHrs: 20, totalHrs: 20 },
    ],
  },
];

// Available members pool for dropdown
const AVAILABLE_MEMBERS = [
  'Rahul Sharma',
  'Priya Nair',
  'Amit Patel',
  'Sneha Rao',
  'Vikas Gupta',
  'Pooja Hegde',
  'Suresh Raina',
  'Karthik N',
  'Mohan Raj',
  'Rohan Verma',
  'Meera Iyer',
];

// Project summary total values matching the reference design
const DEFAULT_TOTALS = {
  effortDaysHrs: '1,200 hrs',
  effortHrs: '1,050 hrs',
  bufferDaysHrs: '780 hrs',
  bufferHrs: '270 hrs',
};

const EffortDetailsTab = ({ project, isEditing = false, onNext, onCancel }) => {
  const [effortGroups, setEffortGroups] = useState(INITIAL_EFFORT_GROUPS);

  // State for active inline "+ Add Member" row
  const [addingGroupId, setAddingGroupId] = useState(null);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    effortDays: 0,
    bufferDays: 0,
  });

  // Start adding member under a specific group
  const handleStartAddMember = (groupId) => {
    setAddingGroupId(groupId);
    setNewMemberData({
      name: '',
      effortDays: 0,
      bufferDays: 0,
    });
  };

  // Cancel inline adding
  const handleCancelAddMember = () => {
    setAddingGroupId(null);
    setNewMemberData({
      name: '',
      effortDays: 0,
      bufferDays: 0,
    });
  };

  // Confirm inline adding
  const handleConfirmAddMember = (groupId) => {
    if (!newMemberData.name || newMemberData.name.trim() === '') {
      toast.error('Please select a member to add.');
      return;
    }

    const effortDaysNum = Number(newMemberData.effortDays) || 0;
    const bufferDaysNum = Number(newMemberData.bufferDays) || 0;
    const effortHrs = effortDaysNum * 8 || 100;
    const bufferHrs = bufferDaysNum * 8 || 20;
    const totalHrs = effortHrs + bufferHrs;

    const newMember = {
      id: `${groupId}-${Date.now()}`,
      name: newMemberData.name,
      effortDays: effortDaysNum,
      effortHrs,
      bufferDays: bufferDaysNum,
      bufferHrs,
      totalHrs,
    };

    setEffortGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: [...group.members, newMember],
        };
      })
    );

    toast.success(`Member ${newMember.name} added successfully!`);
    handleCancelAddMember();
  };

  // Update member field (Effort Days or Buffer Days)
  const handleValueChange = (groupId, memberId, field, value) => {
    setEffortGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: group.members.map((member) => {
            if (member.id !== memberId) return member;
            const numericVal = value === '' ? 0 : Number(value);
            const updated = { ...member, [field]: numericVal };
            // Recalculate hours
            if (field === 'effortDays') {
              updated.effortHrs = numericVal * 8 || 100;
            } else if (field === 'bufferDays') {
              updated.bufferHrs = numericVal * 8 || 20;
            }
            updated.totalHrs = (updated.effortHrs || 0) + (updated.bufferHrs || 0);
            return updated;
          }),
        };
      })
    );
  };

  // Delete member from group
  const handleDeleteMember = (groupId, memberId, memberName) => {
    setEffortGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          members: group.members.filter((m) => m.id !== memberId),
        };
      })
    );
    toast.success(`Member ${memberName || ''} removed.`);
  };

  return (
    <div className="effort-details-shell">
      <div className="effort-details-table-wrap">
        <table className="effort-details-table">
          <thead>
            <tr>
              <th >Role</th>
              <th style={{ width: isEditing ? '13%' : '15%' }}>Effort(Days)</th>
              <th style={{ width: isEditing ? '12%' : '15%' }}>In Hrs</th>
              <th style={{ width: isEditing ? '13%' : '15%' }}>Buffer(Days)</th>
              <th style={{ width: isEditing ? '12%' : '15%' }}>In Hrs</th>
              <th style={{ width: isEditing ? '12%' : '15%' }}>Total Hrs</th>
              {isEditing && <th style={{ width: '16%' }}>Action</th>}
            </tr>
          </thead>

          <tbody>
            {effortGroups.map((group) => (
              <React.Fragment key={group.id}>
                <tr className="effort-details-role-row">
                  <td>{group.roleCategory}</td>
                  <td colSpan={isEditing ? 5 : 5} className="effort-details-role-spacer"></td>
                  {isEditing && (
                    <td className="effort-details-role-action">
                      <button
                        type="button"
                        onClick={() => handleStartAddMember(group.id)}
                        className="effort-details-add-member"
                      >
                        <UserPlus size={14} />
                        <span>+ Add Member</span>
                      </button>
                    </td>
                  )}
                </tr>

                {isEditing && addingGroupId === group.id && (
                  <tr className="effort-details-pending-row">
                    <td>
                      <div className="effort-details-select-wrap">
                        <select
                          value={newMemberData.name}
                          onChange={(e) => setNewMemberData({ ...newMemberData, name: e.target.value })}
                          className="effort-details-select"
                        >
                          <option value="" disabled>Add Member</option>
                          {AVAILABLE_MEMBERS.map((name) => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                        <span className="effort-details-select-chevron"><ChevronDown size={14} /></span>
                      </div>
                    </td>

                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newMemberData.effortDays}
                        onChange={(e) =>
                          setNewMemberData({
                            ...newMemberData,
                            effortDays: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="effort-details-input"
                      />
                    </td>

                    <td className="effort-details-value">
                      {newMemberData.effortDays ? `${Number(newMemberData.effortDays) * 8} hrs` : '000 hrs'}
                    </td>

                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newMemberData.bufferDays}
                        onChange={(e) =>
                          setNewMemberData({
                            ...newMemberData,
                            bufferDays: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        className="effort-details-input"
                      />
                    </td>

                    <td className="effort-details-value">
                      {newMemberData.bufferDays ? `${Number(newMemberData.bufferDays) * 8} hrs` : '00 hrs'}
                    </td>

                    <td className="effort-details-value">
                      {(Number(newMemberData.effortDays) || 0) * 8 + (Number(newMemberData.bufferDays) || 0) * 8} hrs
                    </td>

                    <td>
                      <div className="effort-details-action-cell">
                        <button
                          type="button"
                          title="Cancel"
                          onClick={handleCancelAddMember}
                          className="effort-details-icon-btn effort-details-icon-btn--danger"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          type="button"
                          title="Add Member"
                          onClick={() => handleConfirmAddMember(group.id)}
                          className="effort-details-icon-btn"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {group.members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className="effort-details-member-name">{member.name}</span>
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={member.effortDays}
                          onChange={(e) =>
                            handleValueChange(group.id, member.id, 'effortDays', e.target.value.replace(/\D/g, ''))
                          }
                          className="effort-details-input"
                        />
                      ) : (
                        <span className="effort-details-read-box">{member.effortDays}</span>
                      )}
                    </td>

                    <td className="effort-details-value">{member.effortHrs} hrs</td>

                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          inputMode="numeric"
                          value={member.bufferDays}
                          onChange={(e) =>
                            handleValueChange(group.id, member.id, 'bufferDays', e.target.value.replace(/\D/g, ''))
                          }
                          className="effort-details-input"
                        />
                      ) : (
                        <span className="effort-details-read-box">{member.bufferDays}</span>
                      )}
                    </td>

                    <td className="effort-details-value">{member.bufferHrs} hrs</td>
                    <td className="effort-details-value">{member.totalHrs} hrs</td>

                    {isEditing && (
                      <td>
                        <div className="effort-details-action-cell">
                          <button
                            type="button"
                            title="Edit member"
                            onClick={() => toast.success(`Editing ${member.name}'s effort values.`)}
                            className="effort-details-icon-btn"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            title="Remove member"
                            onClick={() => handleDeleteMember(group.id, member.id, member.name)}
                            className="effort-details-icon-btn effort-details-icon-btn--danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            <tr className="effort-details-total-row">
              <td>TOTAL</td>
              <td>{DEFAULT_TOTALS.effortDaysHrs}</td>
              <td>{DEFAULT_TOTALS.effortHrs}</td>
              <td>{DEFAULT_TOTALS.bufferDaysHrs}</td>
              <td>{DEFAULT_TOTALS.bufferHrs}</td>
              <td>{isEditing ? '' : '270 hrs'}</td>
              {isEditing && <td></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="effort-details-footer">
          <button
            type="button"
            id="effort-details-cancel-btn"
            onClick={onCancel}
            className="effort-details-footer-btn effort-details-footer-btn--secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            id="effort-details-next-btn"
            onClick={onNext}
            className="effort-details-footer-btn effort-details-footer-btn--primary"
          >
            <span>Next:</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EffortDetailsTab;
