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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[#475467] text-[13px] font-semibold">
              <th className={`py-3.5 px-6 font-semibold text-left ${isEditing ? 'w-[22%]' : 'w-[25%]'}`}>Role</th>
              <th className={`py-3.5 px-4 font-semibold text-center ${isEditing ? 'w-[13%]' : 'w-[15%]'}`}>Effort(Days)</th>
              <th className={`py-3.5 px-4 font-semibold text-center ${isEditing ? 'w-[12%]' : 'w-[15%]'}`}>In Hrs</th>
              <th className={`py-3.5 px-4 font-semibold text-center ${isEditing ? 'w-[13%]' : 'w-[15%]'}`}>Buffer(Days)</th>
              <th className={`py-3.5 px-4 font-semibold text-center ${isEditing ? 'w-[12%]' : 'w-[15%]'}`}>In Hrs</th>
              <th className={`py-3.5 px-4 font-semibold text-center ${isEditing ? 'w-[12%]' : 'w-[15%]'}`}>Total Hrs</th>
              {isEditing && (
                <th className="py-3.5 px-4 font-semibold text-center w-[16%]">Action</th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 text-sm">
            {effortGroups.map((group) => (
              <React.Fragment key={group.id}>
                {/* Role Group Header Row */}
                <tr className="bg-white border-y border-gray-100">
                  <td className="py-3 px-6 font-bold text-gray-900 text-[14px]">
                    {group.roleCategory}
                  </td>
                  <td colSpan={isEditing ? 5 : 5}></td>
                  {/* + Add Member button in Action column (Edit mode only) */}
                  {isEditing && (
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleStartAddMember(group.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#856BFF] hover:text-[#7354fd] cursor-pointer bg-transparent border-none transition-colors"
                      >
                        <UserPlus size={14} className="text-[#856BFF]" />
                        <span>+ Add Member</span>
                      </button>
                    </td>
                  )}
                </tr>

                {/* Inline Add Member Row (Edit mode only) */}
                {isEditing && addingGroupId === group.id && (
                  <tr className="bg-[#FAF8FF]/60 border-b border-purple-100 animate-in fade-in duration-150">
                    {/* Role Dropdown */}
                    <td className="py-2.5 px-6">
                      <div className="relative inline-block w-full max-w-[180px]">
                        <select
                          value={newMemberData.name}
                          onChange={(e) =>
                            setNewMemberData({ ...newMemberData, name: e.target.value })
                          }
                          className="w-full appearance-none px-3 py-1.5 text-xs text-gray-700 bg-white border border-[#CBD5E1] rounded-lg outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] cursor-pointer font-medium"
                        >
                          <option value="" disabled>
                            Add Member
                          </option>
                          {AVAILABLE_MEMBERS.map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                      </div>
                    </td>

                    {/* Effort(Days) Input Box */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center items-center">
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
                          className="w-14 h-8 text-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-white outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF]"
                        />
                      </div>
                    </td>

                    {/* Effort In Hrs */}
                    <td className="py-2.5 px-4 text-center text-[#475467] text-xs font-normal">
                      {newMemberData.effortDays ? `${Number(newMemberData.effortDays) * 8} hrs` : '000 hrs'}
                    </td>

                    {/* Buffer(Days) Input Box */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center items-center">
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
                          className="w-14 h-8 text-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-white outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF]"
                        />
                      </div>
                    </td>

                    {/* Buffer In Hrs */}
                    <td className="py-2.5 px-4 text-center text-[#475467] text-xs font-normal">
                      {newMemberData.bufferDays ? `${Number(newMemberData.bufferDays) * 8} hrs` : '00 hrs'}
                    </td>

                    {/* Total Hrs */}
                    <td className="py-2.5 px-4 text-center text-[#475467] text-xs font-normal">
                      {(Number(newMemberData.effortDays) || 0) * 8 + (Number(newMemberData.bufferDays) || 0) * 8} hrs
                    </td>

                    {/* Actions: Cancel (X) & Save (Check) */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Red Cancel Button */}
                        <button
                          type="button"
                          title="Cancel"
                          onClick={handleCancelAddMember}
                          className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
                        >
                          <XCircle size={19} />
                        </button>

                        {/* Dark Blue/Green Confirm Button */}
                        <button
                          type="button"
                          title="Add Member"
                          onClick={() => handleConfirmAddMember(group.id)}
                          className="text-[#0F172A] hover:text-[#856BFF] transition-colors p-1 cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
                        >
                          <CheckCircle2 size={19} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Group Members Rows */}
                {group.members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[#F9FAFB] transition-colors border-b border-gray-50"
                  >
                    {/* Member Name */}
                    <td className="py-3 px-6 text-gray-800 font-normal">
                      {member.name}
                    </td>

                    {/* Effort(Days) Box: Input in Edit mode, styled read box in View mode */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={member.effortDays}
                            onChange={(e) =>
                              handleValueChange(group.id, member.id, 'effortDays', e.target.value.replace(/\D/g, ''))
                            }
                            className="w-14 h-8 text-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white focus:bg-white focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] outline-none transition-all cursor-text"
                          />
                        ) : (
                          <div className="w-14 h-8 flex items-center justify-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-[#F8FAFC]">
                            {member.effortDays}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Effort In Hrs */}
                    <td className="py-3 px-4 text-center text-[#475467] font-normal">
                      {member.effortHrs} hrs
                    </td>

                    {/* Buffer(Days) Box: Input in Edit mode, styled read box in View mode */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            value={member.bufferDays}
                            onChange={(e) =>
                              handleValueChange(group.id, member.id, 'bufferDays', e.target.value.replace(/\D/g, ''))
                            }
                            className="w-14 h-8 text-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white focus:bg-white focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] outline-none transition-all cursor-text"
                          />
                        ) : (
                          <div className="w-14 h-8 flex items-center justify-center text-sm font-medium text-[#475467] rounded-md border border-[#CBD5E1] bg-[#F8FAFC]">
                            {member.bufferDays}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Buffer In Hrs */}
                    <td className="py-3 px-4 text-center text-[#475467] font-normal">
                      {member.bufferHrs} hrs
                    </td>

                    {/* Total Hrs */}
                    <td className="py-3 px-4 text-center text-[#475467] font-normal">
                      {member.totalHrs} hrs
                    </td>

                    {/* Action Column (Edit mode only) */}
                    {isEditing && (
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            title="Edit member"
                            onClick={() => toast.success(`Editing ${member.name}'s effort values.`)}
                            className="p-1 rounded hover:bg-purple-50 text-[#856BFF] transition-colors cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            title="Remove member"
                            onClick={() => handleDeleteMember(group.id, member.id, member.name)}
                            className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none inline-flex items-center justify-center"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* TOTAL Row */}
            <tr className="bg-[#EEF2F6] border-t-2 border-gray-200 text-gray-900 font-bold text-sm">
              <td className="py-3.5 px-6 font-bold tracking-wide">TOTAL</td>
              <td className="py-3.5 px-4 text-center font-bold">{DEFAULT_TOTALS.effortDaysHrs}</td>
              <td className="py-3.5 px-4 text-center font-bold">{DEFAULT_TOTALS.effortHrs}</td>
              <td className="py-3.5 px-4 text-center font-bold">{DEFAULT_TOTALS.bufferDaysHrs}</td>
              <td className="py-3.5 px-4 text-center font-bold">{DEFAULT_TOTALS.bufferHrs}</td>
              <td className="py-3.5 px-4 text-center font-bold">{isEditing ? '' : '270 hrs'}</td>
              {isEditing && <td className="py-3.5 px-4"></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Actions (Edit mode only matching Attachment 5) */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 px-6 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            id="effort-details-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
          <button
            type="button"
            id="effort-details-next-btn"
            onClick={onNext}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer border-none"
          >
            <span>Next:</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default EffortDetailsTab;
