import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Edit, Folder, User } from "lucide-react";
import { getProjectById } from "@/features/projects/services/projectsService";
import ProjectInfoTab from "./ProjectInfoTab";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Project Info");

  const tabs = [
    "Project Overview",
    "Project Info",
    "Task Info",
    "Effort Details",
    "Documents Checklist",
    "Timesheet Data",
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchProject = async () => {
      try {
        setLoading(true);
        // Using getProjectById from the service (which has mock data)
        const data = await getProjectById(id);
        if (isMounted) setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProject();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <svg className="animate-spin w-6 h-6 text-[#856BFF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // Fallback defaults for displaying metadata based on the design
  const projName = project?.project_name || project?.projectName || project?.name || "FMS";
  const projStatus = project?.status || "Completed";
  const pmsId = project?.pms_id || project?.pmsId || "PMS-9021";
  const clientName = project?.client_name || project?.customer || "Ahana IT";
  const owner = project?.team_lead || project?.owner || "Sarah J.";
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };
  const startDt = project?.start_date || project?.startDate;
  const endDt = project?.end_date || project?.endDate;
  const startDateStr = startDt ? formatDate(startDt) : "Aug 01, 2024";
  const endDateStr = endDt ? formatDate(endDt) : "Oct 15, 2024";

  return (
    <div className="min-h-full bg-[#FAF8FF] p-6 font-sans" style={{ zoom: "0.9" }}>
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-4">
        <button onClick={() => navigate("/projects")} className="hover:text-[#6D4AFF] transition-colors">
          Projects
        </button>
        <span className="text-gray-400">›</span>
        <span className="text-gray-700">View / Edit Project</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">{projName}</h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              {projStatus}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-bold">#</span>
              {pmsId}
            </div>
            <div className="flex items-center gap-1.5">
              <Folder size={14} className="text-gray-400" />
              {clientName}
            </div>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              {owner}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {startDateStr} - {endDateStr}
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={() => navigate('/projects/edit', { state: { project } })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
        >
          <Edit size={16} />
          Edit Project
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6 overflow-x-auto mb-6 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-semibold transition-colors whitespace-nowrap relative ${
              activeTab === tab
                ? "text-[#856BFF]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#856BFF] rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {activeTab === "Project Info" ? (
          <ProjectInfoTab project={project} />
        ) : (
          <div className="p-10 text-center text-gray-400 text-sm font-medium">
            {activeTab} content is not available yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectDetailsPage;
