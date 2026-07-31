import React, { useState, useEffect } from 'react';
import { Upload, Table, Select, Spin, message } from 'antd';
import {
    FileExcelOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TeamOutlined,
    ReloadOutlined,
    InboxOutlined,
    FolderOpenOutlined,
    WarningOutlined,
    EyeInvisibleOutlined,
     UploadOutlined  
} from '@ant-design/icons';
import { uploadTimesheet, getBatchDetails, getBatches } from '../api/timesheet.api';

const { Option } = Select;
const { Dragger } = Upload;

const ReconciliationUpload = ({ onUploadSuccess }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [batchDetails, setBatchDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [projectStatusData, setProjectStatusData] = useState([]);
    const [expandedProject, setExpandedProject] = useState(null);
    const [allBatches, setAllBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState(null);
    const [loadingBatches, setLoadingBatches] = useState(false);

    useEffect(() => {
        fetchAllBatches();
    }, []);

    const fetchAllBatches = async () => {
        setLoadingBatches(true);
        try {
            const response = await getBatches();
            const batches = response.data || [];
            setAllBatches(batches);
            if (batches.length > 0) {
                const latestWithData = batches.find(b => b.total_entries > 0);
                const batchToSelect = latestWithData || batches[0];
                setSelectedBatchId(batchToSelect.id);
                await fetchBatchDetails(batchToSelect.id);
            }
        } catch (err) {
            console.error('Failed to fetch batches:', err);
        } finally {
            setLoadingBatches(false);
        }
    };

    const fetchBatchDetails = async (batchId) => {
        setLoadingDetails(true);
        try {
            const details = await getBatchDetails(batchId);
            setBatchDetails(details);
            buildProjectStatusData(details);
        } catch (err) {
            console.error('Failed to fetch batch details:', err);
        } finally {
            setLoadingDetails(false);
        }
    };

    const buildProjectStatusData = (details) => {
        if (!details?.entries || details.entries.length === 0) {
            setProjectStatusData([]);
            return;
        }
        const projectMap = new Map();
        details.entries.forEach(entry => {
            const projectCode = entry.project_code || entry.original_project_code;
            if (!projectCode) return;
            if (!projectMap.has(projectCode)) {
                projectMap.set(projectCode, {
                    project_code: projectCode,
                    project_name: entry.original_project_name || projectCode,
                    project_exists: entry.project_found === 1 && !!entry.project_id,
                    total_hours: 0,
                    employee_count: new Set(),
                    entry_count: 0,
                    employee_details: []
                });
            }
            const project = projectMap.get(projectCode);
            project.total_hours += parseFloat(entry.hours || 0);

            // ✅ Updated: Use emp_id from master.emp instead of user_id
            const empId = entry.emp_id || entry.original_emp_code;
            if (empId) {
                project.employee_count.add(empId);
                project.employee_details.push({
                    emp_id: empId,
                    name: entry.employee_name || 'Unknown', // Now from master.emp
                    hours: parseFloat(entry.hours || 0)
                });
            }
            project.entry_count += 1;
        });

        const data = Array.from(projectMap.values()).map(p => {
            const empMap = new Map();
            p.employee_details.forEach(emp => {
                if (empMap.has(emp.emp_id)) {
                    empMap.get(emp.emp_id).hours += emp.hours;
                } else {
                    empMap.set(emp.emp_id, { ...emp });
                }
            });
            p.employee_details = Array.from(empMap.values());
            p.employee_count = p.employee_details.length;
            return p;
        });

        data.sort((a, b) => {
            if (a.project_exists === b.project_exists) return a.project_code.localeCompare(b.project_code);
            return a.project_exists ? 1 : -1;
        });
        setProjectStatusData(data);
    };

    const handleBatchChange = async (batchId) => {
        setSelectedBatchId(batchId);
        setUploadResult(null);
        await fetchBatchDetails(batchId);
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select a file first');
            return;
        }
        const file = fileList[0].originFileObj || fileList[0];
        if (!file) {
            message.error('Invalid file selected');
            return;
        }
        setUploading(true);
        setUploadResult(null);
        setProjectStatusData([]);
        try {
            const response = await uploadTimesheet(file);
            setUploadResult(response);
            const duplicateCount = response.data?.duplicate_entries || 0;
            if (duplicateCount > 0) {
                message.warning(`${duplicateCount} duplicate entries were skipped`);
            } else {
                message.success('Timesheet uploaded successfully!');
            }
            await fetchAllBatches();
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Upload failed';
            message.error(errorMsg);
            setUploadResult(null);
        } finally {
            setUploading(false);
            setFileList([]);
        }
    };

    const uploadProps = {
        onRemove: () => setFileList([]),
        beforeUpload: (file) => {
            const isValid =
                file.type === 'application/vnd.ms-excel' ||
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xls') ||
                file.name.endsWith('.xlsx');
            if (!isValid) {
                message.error('Please upload Excel files only (.xls, .xlsx)');
                return false;
            }
            setFileList([file]);
            return false;
        },
        fileList,
        maxCount: 1,
        showUploadList: false,
    };

   const projectStatusColumns = [
    {
        title: 'Project Code',
        dataIndex: 'project_code',
        key: 'project_code',
        width: 190,
        render: (text) => (
            <span className="inline-block font-mono text-xs font-semibold text-[#856BFF] bg-[#EDEDF8] border border-[#856BFF]/20 px-2.5 py-1 rounded-md">
                {text || 'N/A'}
            </span>
        ),
    },
    {
        title: 'Project Name',
        dataIndex: 'project_name',
        key: 'project_name',
        render: (text, record) => (
            <span className="text-sm font-semibold text-gray-800">{text || record.project_code || 'Unknown'}</span>
        ),
    },
    {
        title: 'Status',
        key: 'status',
        width: 150,
        render: (_, record) =>
            record.project_exists ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
                    <CheckCircleOutlined /> Validated
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#BA1A1A]">
                    <CloseCircleOutlined /> Not Found — Create
                </span>
            ),
    },
    {
        title: <div className="text-center leading-tight">Total<br />Hours</div>,
        dataIndex: 'total_hours',
        key: 'total_hours',
        align: 'center',
        width: 110,
        render: (hours) => (
            <span className="text-sm font-bold text-gray-900">
                {hours?.toFixed(1) || '0'} <span className="font-normal text-gray-400 text-xs">hrs</span>
            </span>
        ),
    },
    {
        title: 'Employees',
        dataIndex: 'employee_count',
        key: 'employee_count',
        align: 'center',
        width: 100,
        render: (count) => (
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#856BFF]/10 text-[#856BFF] text-xs font-bold">
                {count || 0}
            </span>
        ),
    },
    {
        title: 'Action',
        key: 'actions',
        align: 'center',
        width: 130,
        render: (_, record) => (
            <button
                onClick={() =>
                    setExpandedProject(
                        expandedProject === record.project_code ? null : record.project_code
                    )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#856BFF] hover:text-[#7259e6]"
            >
                {expandedProject === record.project_code ? (
                    <>
                        <EyeInvisibleOutlined /> Hide
                    </>
                ) : (
                    <>
                        <TeamOutlined /> Employees
                    </>
                )}
            </button>
        ),
    },
];

const expandedRowRender = (record) => {
    if (!record.employee_details || record.employee_details.length === 0) {
        return <div className="text-sm text-gray-400 px-4 py-3">No employee details available</div>;
    }
    return (
        <div className="bg-[#F5F5FA] rounded-lg p-4">
            <div className="text-xs font-bold text-[#434654]uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <TeamOutlined /> Employee Breakdown
            </div>
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                <table className="w-full border-collapse">
                    <thead>
                         <tr style={{ backgroundColor: '#EFF4FF' }}>
                            <th className="text-left text-[11px] font-bold text-[#434654]uppercase px-4 py-2.5">Employee Code</th>
                            <th className="text-left text-[11px] font-bold text-[#434654]uppercase px-4 py-2.5">Employee Name</th>
                            <th className="text-right text-[11px] font-bold text-[#434654]uppercase px-4 py-2.5">Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {record.employee_details.map((emp, idx) => (
                            <tr key={emp.emp_id} className={idx !== record.employee_details.length - 1 ? 'border-b border-gray-100' : ''}>
                                <td className="px-4 py-2.5">
                                    <span className="inline-block font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        {emp.emp_id || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-4 py-2.5 text-sm text-gray-700">{emp.name || 'Unknown'}</td>
                                <td className="px-4 py-2.5 text-sm text-gray-700 text-right">{emp.hours?.toFixed(1) || '0'} hrs</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

    const foundProjects = projectStatusData.filter(p => p.project_exists).length;
    const notFoundProjects = projectStatusData.filter(p => !p.project_exists).length;
    const hasData = projectStatusData.length > 0;
    const selectedBatch = allBatches.find(b => b.id === selectedBatchId);

    return (
        <div className=" mx-auto p-6 font-sans">

          {/* ── Page Header ── */}
<div className="mb-6">
    <h1 className="text-2xl font-bold text-gray-900 m-0">Timesheet Upload</h1>
    <p className="text-sm text-[#434654]mt-1">
        Upload and review timesheet data against active projects in the system
    </p>
</div>

{/* ── Upload + Active Batch row ── */}
<div className="flex flex-col md:flex-row gap-5 mb-5 items-start">
    {/* Complete Drop Excel layout — 75% width */}
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full md:w-[70%] p-8 flex flex-col gap-6">
        <Dragger
            {...uploadProps}
            className="!bg-white !rounded-xl !border-2 !border-dashed !border-gray-200 !flex-1 !flex !items-center !justify-center"
        >
            <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#856BFF]/10 flex items-center justify-center mb-4">
                    <UploadOutlined className="text-2xl text-[#856BFF]" />
                </div>
                {fileList.length > 0 ? (
                    <>
                        <p className="font-bold text-[#856BFF] text-base m-0">{fileList[0].name}</p>
                        <p className="text-gray-400 text-sm mt-1">Click or drag to replace</p>
                    </>
                ) : (
                    <>
                        <p className="font-bold text-gray-900 text-base m-0">Drop your Excel file here</p>
                        <p className="text-gray-400 text-sm mt-1">Max file size: 25MB · 1 file per upload</p>
                    </>
                )}
            </div>
        </Dragger>

        {/* Cancel / Upload — inside the same white card, below the dropzone */}
        <div className="flex justify-end gap-3">
            <button
                onClick={() => setFileList([])}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleUpload}
                disabled={fileList.length === 0 || uploading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#856BFF] hover:bg-[#7259e6] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
            >
                <FileExcelOutlined />
                {uploading ? 'Uploading…' : 'Upload Batch'}
            </button>
        </div>
    </div>

    {/* Active Batch layout — 25% width with fixed height */}
    <div className="relative bg-white rounded-xl border border-gray-100 shadow-sm w-full md:w-[30%] h-[236px] p-4 flex flex-col gap-4 overflow-hidden">
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#856BFF]" />

        <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
                <FolderOpenOutlined /> Active Batch
            </span>
            <button
                onClick={fetchAllBatches}
                disabled={loadingBatches}
                className="flex items-center gap-1 text-xs font-semibold text-[#856BFF] hover:text-[#7259e6] disabled:opacity-50"
            >
                <ReloadOutlined spin={loadingBatches} /> Refresh
            </button>
        </div>

        <Select
            value={selectedBatchId}
            onChange={handleBatchChange}
            className="w-full"
            loading={loadingBatches}
            placeholder="Select a batch…"
            size="large"
        >
            {allBatches.map((batch) => (
                <Option key={batch.id} value={batch.id}>
                    <span className="font-mono">{batch.batch_code}</span>{' '}
                    <span className="text-gray-400 text-xs">
                        · {batch.file_name?.split('_').pop() || 'Unknown'} · {batch.total_entries || 0} entries…
                    </span>
                </Option>
            ))}
        </Select>

        {selectedBatch && (
            <div className="bg-[#F5F3FF] rounded-xl p-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-base font-bold text-[#856BFF]">{selectedBatch.batch_code}</span>
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-700 mb-1.5">
                    <span className="text-gray-500">
                        Processed: <span className="font-semibold text-gray-800">{selectedBatch.file_name?.split('_').pop() || 'Unknown'}</span>
                    </span>
                    <span className="text-gray-500">
                        Entries: <span className="font-semibold text-gray-800">{selectedBatch.total_entries || 0}</span>
                    </span>
                </div>
                <div className="text-sm text-gray-500">
                    Date: <span className="font-semibold text-gray-800">{selectedBatch.created_at?.split('T')[0]}</span>
                </div>
            </div>
        )}
    </div>
</div>

{/* ── Project Not Found alert ── */}
{notFoundProjects > 0 && (
    <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-5 py-4 mb-5">
        <WarningOutlined className="text-[#BA1A1A] text-lg mt-0.5" />
        <div>
            <div className="text-sm font-semibold text-[#BA1A1A]">
                {notFoundProjects} project{notFoundProjects > 1 ? 's' : ''} not found in the system
            </div>
            <div className="text-xs text-[#BA1A1A] mt-0.5">
                These entries cannot be reconciled automatically. Create the missing projects or map them to existing entities before running the reconciliation report.
            </div>
        </div>
    </div>
)}

            {/* ── Upload Result Summary ── */}
            {uploadResult && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-7 py-5 mb-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircleOutlined className="text-green-600 text-lg" />
                        <span className="font-bold text-green-700 text-[15px]">Upload Successful</span>
                    </div>
                    <div className="flex flex-wrap gap-10">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Total Records</div>
                            <div className="text-xl font-bold text-gray-900">{uploadResult.data?.total_records || 0}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Entries Stored</div>
                            <div className="text-xl font-bold text-gray-900">{uploadResult.data?.total_entries_stored || 0}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Duplicates Skipped</div>
                            <div className={`text-xl font-bold ${uploadResult.data?.duplicate_entries > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                {uploadResult.data?.duplicate_entries || 0}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Projects</div>
                            <div className="text-xl font-bold text-gray-900">
                                {foundProjects} / {notFoundProjects}{' '}
                                <span className="text-xs font-normal text-gray-400">found / missing</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            
            {uploadResult?.data?.duplicate_entries > 0 && (
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-5">
                    <InboxOutlined className="text-blue-500 text-lg mt-0.5" />
                    <div>
                        <div className="text-sm font-semibold text-blue-800">
                            {uploadResult.data.duplicate_entries} duplicate entries skipped
                        </div>
                        <div className="text-xs text-blue-600 mt-0.5">
                            These entries already exist in the system and were not inserted again.
                        </div>
                    </div>
                </div>
            )}

            {/* ── Project Status Table ── */}
            {loadingDetails ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Spin size="large" />
                    <span className="text-sm text-gray-400">Loading project details…</span>
                </div>
            ) : hasData ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4">
        <span className="font-bold text-gray-900 text-base">Project Validation Status</span>
        <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                <CheckCircleOutlined /> {foundProjects} Found
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#BA1A1A] text-xs font-semibold">
                <CloseCircleOutlined /> {notFoundProjects} Missing
            </span>
        </div>
    </div>

                   <Table
        columns={projectStatusColumns}
        dataSource={projectStatusData}
        rowKey="project_code"
        pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} projects`,
            className: 'custom-pagination',
        }}
        size="middle"
        scroll={{ x: 800 }}
        rowClassName={() => 'align-top'}
        expandable={{
            expandedRowRender,
            expandedRowKeys: expandedProject ? [expandedProject] : [],
            onExpand: (expanded, record) =>
                setExpandedProject(expanded ? record.project_code : null),
            rowExpandable: (record) =>
                record.employee_details && record.employee_details.length > 0,
            showExpandColumn: false,
        }}
    />
                </div>
            ) : uploadResult && !loadingDetails ? (
                <div className="bg-white rounded-xl border border-gray-200 text-center py-10">
                    <InboxOutlined className="text-4xl text-gray-300 block mb-3" />
                    <span className="text-sm text-gray-400">No project data found in this batch</span>
                </div>
            ) : null}

            {/* Table look & feel overrides */}
           <style>{`
    .ant-table-thead > tr > th {
        background: #EFF4FF !important;
        color: #434654 !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.03em !important;
        border-bottom: none !important;
    }
    .ant-table-tbody > tr > td {
        border-bottom: 1px solid #f3f4f6 !important;
        vertical-align: middle !important;
    }
    .ant-table-expanded-row > td {
        background: #ffffff !important;
        padding: 0 24px 16px !important;
    }
    .ant-pagination-item-active {
        border-color: #856BFF !important;
        background: #856BFF !important;
    }
    .ant-pagination-item-active a {
        color: #fff !important;
    }
       
   /* Pagination Container Styles matching the image */
    .custom-pagination {
        background: #EFF4FF !important;
        padding: 16px 24px !important;
        border-bottom-left-radius: 16px !important;
        border-bottom-right-radius: 16px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        border: none !important;
        margin: 0 !important;
    }
    
    .custom-pagination .ant-pagination-total-text {
        color: #6B7280 !important;
        font-family: inherit !important;
        font-weight: 400 !important;
        font-size: 13px !important;
        margin-right: auto !important;
    }
    
    .custom-pagination.ant-table-pagination {
        display: flex !important;
    }
    
    .custom-pagination .ant-pagination-item,
    .custom-pagination .ant-pagination-prev,
    .custom-pagination .ant-pagination-next {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border: none !important;
        background: transparent !important;
        min-width: 28px !important;
        height: 24px !important;
        line-height: 24px !important;
        margin: 0 4px !important;
        cursor: pointer !important;
    }
    
    .custom-pagination .ant-pagination-item a {
        color: #1F2937 !important;
        font-weight: 500 !important;
        font-size: 13px !important;
        padding: 0 4px !important;
        transition: none !important;
    }
    
    /* Active State (Purple Pill Button) */
    .custom-pagination .ant-pagination-item-active {
        background: #856BFF !important;
        border-radius: 6px !important;
    }
    
    .custom-pagination .ant-pagination-item-active a {
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    
    /* Navigation Arrows */
    .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
    .custom-pagination .ant-pagination-next .ant-pagination-item-link {
        color: #1F2937 !important;
        border: none !important;
        background: transparent !important;
        font-size: 12px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    }
    
    /* Disabled Arrow State */
    .custom-pagination .ant-pagination-disabled .ant-pagination-item-link {
        color: #9CA3AF !important;
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }
    
    /* Hide unneeded Ant utilities */
    .custom-pagination .ant-pagination-options,
    .custom-pagination .ant-pagination-jump-prev,
    .custom-pagination .ant-pagination-jump-next {
        display: none !important;
    }
`}</style>
        </div>
    );
};

export default ReconciliationUpload;