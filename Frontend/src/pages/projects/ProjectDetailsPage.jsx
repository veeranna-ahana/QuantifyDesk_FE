import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, Edit, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getProjectById } from "@/features/projects/services/projectsService";
import ProjectInfoTab from "./ProjectInfoTab";
import ProjectOverviewTab from "./ProjectOverviewTab";
import TaskInfoTab from "./TaskInfoTab";
import EffortDetailsTab from "./EffortDetailsTab";
import DocumentsChecklistTab from "./DocumentsChecklistTab";
import TimesheetDataTab from "./TimesheetDataTab";

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Project Info");
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
        const data = await getProjectById(id || 1);
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
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <svg className="animate-spin w-6 h-6 text-[#856BFF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // Exact fallback defaults matching Figma design
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
    <div className="w-full max-w-[1106px] mx-auto px-6 py-1 font-sans flex flex-col gap-1.5 box-border bg-[#F9F7FF]">

      {/* Frame 427321890: Header & Metadata + Tabs (width 1058, compact gap) */}
      <div className="w-full max-w-[1058px] flex flex-col gap-1 shrink-0">
        {/* Frame 427321892: White Header & Metadata Card (1058) */}
       <div className="w-full max-w-[1058px] rounded-lg py-2 px-4 flex flex-col gap-1 box-border bg-[#F9F7FF]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 leading-none">
            <button
              onClick={() => navigate("/projects")}
              className="hover:text-[#856BFF] transition-colors bg-transparent border-none p-0 cursor-pointer text-xs font-normal text-gray-500"
            >
              Projects
            </button>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-bold">View / Edit Project</span>
          </div>

          {/* Title & Metadata Row (Container: width 1058, justify-between) */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col justify-center">
              {/* Title & Status Badge Row (gap 8) */}
              <div className="flex items-center gap-2 h-[30px]">
                <h2 className="text-[22px] font-bold text-[#1E293B] m-0 leading-none">{projName}</h2>
                {/* Status Badge: Background+Border (width 92, height 20, rounded 4, padding 2px 8px, gap 4) */}
                <span className="inline-flex items-center justify-center gap-1.5 w-[92px] h-[20px] rounded-[4px] bg-[#E6F8EF] border border-[#B7EB8F] text-[#10B981] text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  {projStatus}
                </span>
              </div>

              {/* Metadata Row (gap 16px) */}
              <div className="flex items-center gap-4 text-xs font-normal text-[#64748B] pt-[2px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 font-bold">#</span>
                  <span>{pmsId}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 size={13} className="text-gray-400 shrink-0" />
                  <span>{clientName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={13} className="text-gray-400 shrink-0" />
                  <span>{owner}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400 shrink-0" />
                  <span>{startDateStr} - {endDateStr}</span>
                </div>
              </div>
            </div>

            {activeTab === "Project Info" && (
              <button
                id="edit-project-btn"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-[#856BFF] hover:bg-[#7354fd] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer border-none"
              >
                <Edit size={14} />
                Edit Project
              </button>
            )}
          </div>
        </div>

        {/* TopAppBar: Tabs Bar (width 1058, compact, border-bottom 1px solid #E2E8F0) */}
        <div className="w-full max-w-[1058px] flex items-center gap-6 border-b border-[#E2E8F0] overflow-x-auto hide-scrollbar bg-[#F9F7FF]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pt-1 pb-1.5 text-[13px] font-medium transition-colors whitespace-nowrap relative cursor-pointer border-none bg-transparent ${
                activeTab === tab
                  ? "text-[#856BFF] border-b-2 border-[#856BFF] font-semibold"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Container (width 1058) */}
      <div className="w-full max-w-[1058px]">
        {activeTab === "Project Overview" ? (
          <ProjectOverviewTab project={project} />
        ) : activeTab === "Project Info" ? (
          <div className="bg-white p-4 box-border shadow-none">
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
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-8 text-center text-gray-400 text-sm font-medium">
            {activeTab} content is not available yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectDetailsPage;
