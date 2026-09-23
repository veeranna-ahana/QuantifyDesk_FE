// src/pages/projects/TimesheetDataTab.jsx
import React, { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

const ROWS = [
  {
    empId: 'EMP-1042',
    empName: 'Devanshi Shah',
    designation: 'Sr. Business Analyst',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'BRD Walkthrough & Traceability Matr',
    hoursSpent: '8.0 hrs',
    fromDate: '01 Aug 2024',
    toDate: '01 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '02 Aug 2024',
    approvedOn: '03 Aug 2024',
  },
  {
    empId: 'EMP-1088',
    empName: 'Rahul Sharma',
    designation: 'Lead Frontend Dev',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'UI Development & React Components',
    hoursSpent: '7.5 hrs',
    fromDate: '02 Aug 2024',
    toDate: '02 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'Sarah Jenkins',
    submittedOn: '03 Aug 2024',
    approvedOn: '04 Aug 2024',
  },
  {
    empId: 'EMP-0945',
    empName: 'Priya Nair',
    designation: 'QA Lead',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Automation Test Scripts & Signoff',
    hoursSpent: '8.0 hrs',
    fromDate: '08 Aug 2024',
    toDate: '08 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '09 Aug 2024',
    approvedOn: '10 Aug 2024',
  },
  {
    empId: 'EMP-0945',
    empName: 'Priyak Nair',
    designation: 'QA Lead',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Automation Test Scripts & Signoff',
    hoursSpent: '8.0 hrs',
    fromDate: '08 Aug 2024',
    toDate: '08 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '09 Aug 2024',
    approvedOn: '10 Aug 2024',
  },
  {
    empId: 'EMP-1033',
    empName: 'Amit Patel',
    designation: 'UI/UX Designer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Responsive Mockup Alignment & Rev',
    hoursSpent: '4.0 hrs',
    fromDate: '10 Aug 2024',
    toDate: '10 Aug 2024',
    approvalStatus: 'Submitted',
    approvedBy: 'Sarah Jenkins',
    submittedOn: '11 Aug 2024',
    approvedOn: '12 Aug 2024',
  },
  {
    empId: 'EMP-1055',
    empName: 'Kusum G G',
    designation: 'Business Analyst',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Functional Requirements Mapping',
    hoursSpent: '8.0 hrs',
    fromDate: '12 Aug 2024',
    toDate: '12 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'Sarah Jenkins',
    submittedOn: '13 Aug 2024',
    approvedOn: '14 Aug 2024',
  },
  {
    empId: 'EMP-1062',
    empName: 'Navith K',
    designation: 'Technical Architect',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Microservices & Database Topology',
    hoursSpent: '8.0 hrs',
    fromDate: '14 Aug 2024',
    toDate: '14 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '15 Aug 2024',
    approvedOn: '16 Aug 2024',
  },
  {
    empId: 'EMP-1070',
    empName: 'Soumya Sen',
    designation: 'Frontend Engineer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'State Management & Form Validatio',
    hoursSpent: '7.0 hrs',
    fromDate: '16 Aug 2024',
    toDate: '16 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'Rahul Sharma',
    submittedOn: '17 Aug 2024',
    approvedOn: '18 Aug 2024',
  },
];

const COLUMNS = [
  'Emp Id',
  'Emp Name',
  'Designation',
  'Project Code',
  'Project Name',
  'Cat. Code',
  'Category',
  'Hours Spent',
  'From Date',
  'To Date',
  'Approval Status',
  'Approved By',
  'Submitted On',
  'Approved On',
  'Task Description',
];

const TimesheetDataTab = () => {
  const [selectedEmployee, setSelectedEmployee] = useState('');

  return (
    <div className="w-full bg-[#f7f4ff] p-0 font-sans text-[#1f2937]">
      <div
        className="overflow-hidden bg-[#f8f7fb] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: 10,
        }}
      >
        <div className="flex w-full max-w-[1053px] items-end justify-between bg-white px-4 py-2" style={{ height: 66 }}>
          <div className="flex h-[50px] w-[495px] items-end gap-[24px]">
            <div className="flex h-[50px] w-[146px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[146px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Select Employee
              </label>
              <div
                className="box-border flex items-center justify-center rounded-[4px] border border-[#E2E8F0] bg-white"
                style={{
                  boxSizing: 'border-box',
                  width: 146,
                  height: 34,
                  padding: 8,
                  gap: 50,
                }}
              >
                <div className="flex items-center justify-between" style={{ width: 121, height: 16, gap: 16 }}>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 89, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    Select Employee
                  </span>
                  <ChevronDown size={16} strokeWidth={1.5} className="text-[#c3c6d6]" />
                </div>
              </div>
            </div>

            <div className="flex h-[50px] w-[199px] flex-col items-start gap-[2px]">
              <label className="flex h-[14px] w-[199px] items-center text-[12px] font-semibold leading-[14px] text-[#545f72]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                Date Range
              </label>
              <div
                className="box-border flex items-center rounded-[4px] border border-[#E2E8F0] bg-white"
                style={{
                  boxSizing: 'border-box',
                  width: 199,
                  height: 34,
                  padding: 8,
                  gap: 50,
                }}
              >
                <div className="flex items-center" style={{ width: 189, height: 16, gap: 16 }}>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 61, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    Select Date
                  </span>
                  <span className="text-[12px] font-normal leading-[14px] text-[#c3c6d6]">→</span>
                  <span className="flex items-center text-[12px] font-normal leading-[14px] text-[#94A3B8]" style={{ width: 48, height: 14, fontFamily: 'Roboto, sans-serif' }}>
                    End Date
                  </span>
                  <CalendarDays size={16} strokeWidth={1.5} className="ml-auto shrink-0 text-[#c3c6d6]" />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="flex h-[34px] w-[80px] items-center justify-center rounded-[4px] bg-[#856BFF] text-[14px] font-semibold leading-[16px] tracking-[0.6px] text-white shadow-[0_2px_8px_rgba(133,107,255,0.22)] transition-colors hover:bg-[#7458F5]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Apply
            </button>
          </div>

          <div className="flex h-[30px] w-[443px] items-center gap-[10px] whitespace-nowrap" style={{ paddingRight: 238.07 }}>
            <div className="box-border flex h-[30px] w-[152px] items-center justify-center gap-[6px] rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#64748B]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#64748B]" style={{ fontFamily: 'Roboto, sans-serif' }}>Total Hours:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#0F172A]" style={{ fontFamily: 'Roboto, sans-serif' }}>780 hrs</span>
            </div>

            <div className="box-border flex h-[30px] w-[141px] items-center justify-center gap-[6px] rounded-[8px] border border-[#A7F3D0] bg-[#ECFDF5] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#10B981]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#047857]" style={{ fontFamily: 'Roboto, sans-serif' }}>Approved:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#065F46]" style={{ fontFamily: 'Roboto, sans-serif' }}>690 hrs</span>
            </div>

            <div className="box-border flex h-[30px] w-[127px] items-center justify-center gap-[6px] rounded-[8px] border border-[#FDE68A] bg-[#FFFBEB] px-[12px]">
              <span className="h-[8px] w-[8px] rounded-full bg-[#F59E0B]" />
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#B45309]" style={{ fontFamily: 'Roboto, sans-serif' }}>Pending:</span>
              <span className="flex h-[16px] items-center text-[12px] leading-[16px] text-[#92400E]" style={{ fontFamily: 'Roboto, sans-serif' }}>90 hrs</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#EFF4FF] text-[12px] font-medium tracking-[0.5px] text-[#475569]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="border-b border-[#dfe3ea] px-4 py-3 whitespace-nowrap text-left"
                    style={{ minWidth: column.includes('Task Description') ? 220 : undefined }}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#2c3240]">
              {ROWS.map((row, index) => (
                <tr
                  key={`${row.empId}-${index}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#f8f9fc]'}
                >
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-bold text-[#1f2937]">{row.empId}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-medium text-[#1f2937]">{row.empName}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.designation}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-semibold text-[#1f2937]">{row.projectCode}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 font-bold text-[#1f2937]">{row.projectName}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.catCode}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#475467]">{row.category}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.hoursSpent}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.fromDate}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.toDate}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvalStatus}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvedBy}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.submittedOn}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.approvedOn}</td>
                  <td className="border-b border-[#e8edf5] px-4 py-4 text-[#374151]">{row.taskDescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#e5e7eb] bg-white px-4 py-3 text-[12px] text-[#64748b]">
          <div className="font-medium text-[#64748b]">Showing 1-10 of 145 records</div>
          <div className="flex items-center gap-2">
            <button className="flex h-7 w-7 items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc]">&lt;</button>
            <button className="flex h-7 w-7 items-center justify-center rounded bg-[#856BFF] text-[12px] font-semibold text-white">1</button>
            <button className="flex h-7 w-7 items-center justify-center rounded text-[#475467] hover:bg-[#f3f4f6]">2</button>
            <button className="flex h-7 w-7 items-center justify-center rounded text-[#475467] hover:bg-[#f3f4f6]">3</button>
            <span className="px-1 text-[#9ca3af]">...</span>
            <button className="flex h-7 w-7 items-center justify-center rounded border border-[#d9dee8] bg-white text-[#64748b] hover:bg-[#f8fafc]">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetDataTab;
