// src/pages/projects/TimesheetDataTab.jsx
import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const INITIAL_TIMESHEET_DATA = [
  {
    id: 1,
    empId: 'EMP-1042',
    empName: 'Devanshi Shah',
    designation: 'Sr. Business Analyst',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'BRD Walkthrough & Traceability Matrix',
    hoursSpent: '8.0 hrs',
    fromDate: '01 Aug 2024',
    toDate: '01 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '02 Aug 2024',
    approvedOn: '03 Aug 2024',
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
    empId: 'EMP-1033',
    empName: 'Amit Patel',
    designation: 'UI/UX Designer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Responsive Mockup Alignment & Review',
    hoursSpent: '4.0 hrs',
    fromDate: '10 Aug 2024',
    toDate: '10 Aug 2024',
    approvalStatus: 'Submitted',
    approvedBy: 'Sarah Jenkins',
    submittedOn: '11 Aug 2024',
    approvedOn: '12 Aug 2024',
  },
  {
    id: 6,
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
    id: 7,
    empId: 'EMP-1062',
    empName: 'Navith K',
    designation: 'Technical Architect',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Microservices & Database Topology Review',
    hoursSpent: '8.0 hrs',
    fromDate: '14 Aug 2024',
    toDate: '14 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '15 Aug 2024',
    approvedOn: '16 Aug 2024',
  },
  {
    id: 8,
    empId: 'EMP-1070',
    empName: 'Soumya Sen',
    designation: 'Frontend Engineer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'State Management & Form Validation',
    hoursSpent: '7.0 hrs',
    fromDate: '16 Aug 2024',
    toDate: '16 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'Rahul Sharma',
    submittedOn: '17 Aug 2024',
    approvedOn: '18 Aug 2024',
  },
  {
    id: 9,
    empId: 'EMP-1082',
    empName: 'Ankit Verma',
    designation: 'Backend Engineer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Auth Token Middleware & API Optimization',
    hoursSpent: '8.0 hrs',
    fromDate: '18 Aug 2024',
    toDate: '18 Aug 2024',
    approvalStatus: 'Approved',
    approvedBy: 'John Smith',
    submittedOn: '19 Aug 2024',
    approvedOn: '20 Aug 2024',
  },
  {
    id: 10,
    empId: 'EMP-1095',
    empName: 'Ranjitha M',
    designation: 'Frontend Engineer',
    projectCode: 'PRJ-FMS-01',
    projectName: 'FMS',
    catCode: 'CAT-BFSI-01',
    category: 'Enterprise Solutions',
    taskDescription: 'Component Unit Testing & Accessibility',
    hoursSpent: '6.5 hrs',
    fromDate: '20 Aug 2024',
    toDate: '20 Aug 2024',
    approvalStatus: 'Submitted',
    approvedBy: 'Rahul Sharma',
    submittedOn: '21 Aug 2024',
    approvedOn: '—',
  },
];

const TimesheetDataTab = ({ project }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return INITIAL_TIMESHEET_DATA.filter((row) => {
      const matchesSearch =
        searchTerm === '' ||
        row.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.empId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || row.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalRecords = 145; // Matching design "Showing 1-10 of 145 records"

  return (
    <div className="space-y-3 font-sans">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search and Filter */}
        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-64 sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#856BFF] focus:ring-1 focus:ring-[#856BFF] transition-all shadow-sm"
            />
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8CEFD] text-[#856BFF] text-xs font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-sm cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                {['All', 'Approved', 'Submitted'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                      statusFilter === st
                        ? 'text-[#856BFF] font-semibold bg-purple-50/50'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{st}</span>
                    {statusFilter === st && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#856BFF]"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Total Hours Badge */}
          <div className="px-3 py-1 bg-gray-100 text-gray-800 text-[11px] font-semibold rounded-lg">
            Total Hours: <span className="font-bold">780 hrs</span>
          </div>

          {/* Approved Hours Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved: <span className="font-bold">690 hrs</span>
          </div>

          {/* Pending Hours Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending: <span className="font-bold">90 hrs</span>
          </div>
        </div>
      </div>

      {/* Main Table Card (Full View with Horizontal Scroll) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-200 text-[#475467] text-[11px] font-semibold">
                <th className="py-2 px-3 whitespace-nowrap">EMP ID</th>
                <th className="py-2 px-3 whitespace-nowrap">Emp Name</th>
                <th className="py-2 px-3 whitespace-nowrap">Designation</th>
                <th className="py-2 px-3 whitespace-nowrap">Project Code</th>
                <th className="py-2 px-3 whitespace-nowrap">Project Name</th>
                <th className="py-2 px-3 whitespace-nowrap">Cat. Code</th>
                <th className="py-2 px-3 whitespace-nowrap">Category</th>
                <th className="py-2 px-3 min-w-[200px]">Task Description</th>
                <th className="py-2 px-3 whitespace-nowrap">Hours Spent</th>
                <th className="py-2 px-3 whitespace-nowrap">From Date</th>
                <th className="py-2 px-3 whitespace-nowrap">To Date</th>
                <th className="py-2 px-3 whitespace-nowrap">Approval Status</th>
                <th className="py-2 px-3 whitespace-nowrap">Approved By</th>
                <th className="py-2 px-3 whitespace-nowrap">Submitted On</th>
                <th className="py-2 px-3 whitespace-nowrap">Approved On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11.5px] text-gray-700">
              {filteredData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="py-1.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                    {row.empId}
                  </td>
                  <td className="py-1.5 px-3 font-medium text-gray-900 whitespace-nowrap">
                    {row.empName}
                  </td>
                  <td className="py-1.5 px-3 text-gray-600 whitespace-nowrap">
                    {row.designation}
                  </td>
                  <td className="py-1.5 px-3 text-gray-600 whitespace-nowrap">
                    {row.projectCode}
                  </td>
                  <td className="py-1.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                    {row.projectName}
                  </td>
                  <td className="py-1.5 px-3 text-gray-500 whitespace-nowrap">
                    {row.catCode}
                  </td>
                  <td className="py-1.5 px-3 text-gray-700 whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="py-1.5 px-3 text-gray-800 font-normal">
                    {row.taskDescription}
                  </td>
                  <td className="py-1.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                    {row.hoursSpent}
                  </td>
                  <td className="py-1.5 px-3 text-gray-600 whitespace-nowrap">
                    {row.fromDate}
                  </td>
                  <td className="py-1.5 px-3 text-gray-600 whitespace-nowrap">
                    {row.toDate}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    {row.approvalStatus === 'Approved' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#F0EDFF] text-[#6D4AFF] border border-[#D8CEFD]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#856BFF]"></span>
                        Submitted
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-gray-700 whitespace-nowrap">
                    {row.approvedBy}
                  </td>
                  <td className="py-1.5 px-3 text-gray-500 whitespace-nowrap">
                    {row.submittedOn}
                  </td>
                  <td className="py-1.5 px-3 text-gray-500 whitespace-nowrap">
                    {row.approvedOn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-2.5 bg-white border-t border-gray-100 gap-3 text-xs">
          <div className="text-gray-500 font-medium">
            Showing 1-{filteredData.length} of {totalRecords} records
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>

            {[1, 2, 3].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 flex items-center justify-center rounded font-semibold text-xs transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#856BFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <span className="px-1 text-gray-400 font-bold">...</span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimesheetDataTab;
