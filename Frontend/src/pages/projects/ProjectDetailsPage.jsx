import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Edit, Folder, User, Check } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getProjectById } from "@/features/projects/services/projectsService";
import ProjectInfoTab from "./ProjectInfoTab";
import TaskInfoTab from "./TaskInfoTab";
import EffortDetailsTab from "./EffortDetailsTab";
import DocumentsChecklistTab from "./DocumentsChecklistTab";
import TimesheetDataTab from "./TimesheetDataTab";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Project Info");
  const [isEditing, setIsEditing] = useState(false);
  const [currentFormData, setCurrentFormData] = useState(null);

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

  const handleSave = async (updatedFields) => {
    const dataToSave = updatedFields || currentFormData;
    if (!dataToSave) return;
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem("token") || "";
      if (BASE_URL && project?.id) {
        try {
          await axios.put(
            `${BASE_URL}/api/projects/${project.id}`,
            {
              name: project.project_name || project.projectName || project.name,
              projectType: dataToSave.projectType,
              nbdId: dataToSave.nbdId,
              o2dId: dataToSave.o2dId,
              projectCode: dataToSave.projectCode,
              subCategory: dataToSave.subCategory,
              description: dataToSave.description,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (apiErr) {
          console.warn("Backend update API failed or unavailable, updated locally:", apiErr);
        }
      }

      setProject((prev) => ({
        ...prev,
        project_type: dataToSave.projectType,
        projectType: dataToSave.projectType,
        nbd_id: dataToSave.nbdId,
        nbdId: dataToSave.nbdId,
        o2d_id: dataToSave.o2dId,
        o2dId: dataToSave.o2dId,
        project_code: dataToSave.projectCode,
        projectCode: dataToSave.projectCode,
        sub_category: dataToSave.subCategory,
        subCategory: dataToSave.subCategory,
        description: dataToSave.description,
      }));

      toast.success("Project updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to update project.");
    }
  };

  const handleNext = (nextTab, updatedFields) => {
    if (updatedFields) {
      setCurrentFormData((prev) => ({ ...prev, ...updatedFields }));
      setProject((prev) => ({
        ...prev,
        project_type: updatedFields.projectType ?? prev?.project_type,
        projectType: updatedFields.projectType ?? prev?.projectType,
        nbd_id: updatedFields.nbdId ?? prev?.nbd_id,
        nbdId: updatedFields.nbdId ?? prev?.nbdId,
        o2d_id: updatedFields.o2dId ?? prev?.o2d_id,
        o2dId: updatedFields.o2dId ?? prev?.o2dId,
        project_code: updatedFields.projectCode ?? prev?.project_code,
        projectCode: updatedFields.projectCode ?? prev?.projectCode,
        sub_category: updatedFields.subCategory ?? prev?.sub_category,
        subCategory: updatedFields.subCategory ?? prev?.subCategory,
        description: updatedFields.description ?? prev?.description,
      }));
    }
    setActiveTab(nextTab);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

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
    <div className="min-h-full bg-[#FAF8FF] p-2 font-sans">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-1">
        <button onClick={() => navigate("/projects")} className="hover:text-[#6D4AFF] transition-colors">
          Projects
        </button>
        <span className="text-gray-400">›</span>
        <span className="text-gray-700">View / Edit Project</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-1">
        <div>
          <div className="flex items-center ">
            <h1 className="text-2xl font-extrabold text-gray-900 m-0">{projName}</h1>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
              {projStatus}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">#</span>
              {pmsId}
            </div>
            <div className="flex items-center gap-1">
              <Folder size={14} className="text-gray-400" />
              {clientName}
            </div>
            <div className="flex items-center gap-1">
              <User size={14} className="text-gray-400" />
              {owner}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              {startDateStr} - {endDateStr}
            </div>
          </div>
        </div>

        {/* Action Button: Edit Project (shown in View mode on Project Info tab only) */}
        {!isEditing && activeTab === "Project Info" && (
          <button
            id="edit-project-btn"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#856BFF] hover:bg-[#7354fd] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer border-none"
          >
            <Edit size={16} />
            Edit Project
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-3 overflow-x-auto mb-2.5 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-semibold transition-colors whitespace-nowrap relative ${activeTab === tab
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
      {activeTab === "Project Info" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-90">
          <ProjectInfoTab
            project={project}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            onNext={(data) => handleNext("Task Info", data)}
            onFormChange={setCurrentFormData}
          />
        </div>
      ) : activeTab === "Task Info" ? (
        <TaskInfoTab
          project={project}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onNext={() => handleNext("Effort Details")}
        />
      ) : activeTab === "Effort Details" ? (
        <EffortDetailsTab
          project={project}
          isEditing={isEditing}
          onCancel={handleCancel}
          onNext={() => handleNext("Documents Checklist")}
        />
      ) : activeTab === "Documents Checklist" ? (
        <DocumentsChecklistTab
          project={project}
          isEditing={isEditing}
          onCancel={handleCancel}
          onSave={() => handleSave(currentFormData)}
        />
      ) : activeTab === "Timesheet Data" ? (
        <TimesheetDataTab project={project} isEditing={isEditing} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm font-medium">
          {activeTab} content is not available yet.
        </div>
      )}

    </div>
  );
};

export default ProjectDetailsPage;
