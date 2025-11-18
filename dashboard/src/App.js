// import React, { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   AlertCircle,
//   TrendingUp,
//   Users,
//   Activity,
//   AlertTriangle,
//   Plus,
//   Edit2,
//   Trash2,
//   X,
//   Save,
//   Mail,
//   Send,
// } from "lucide-react";

// const API_URL = "http://localhost:3001/api";

// const HRDashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [loading, setLoading] = useState(false);

//   const [departmentDetails, setDepartmentDetails] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalMode, setModalMode] = useState("create");
//   const [aiData, setAiData] = useState([]);
//   const [highUrgencyCount, setHighUrgencyCount] = useState(0);
//   const [currentEmployee, setCurrentEmployee] = useState(null);
//   const [overviewStats, setOverviewStats] = useState({
//     totalEmployees: 0,
//     highRiskCount: 0,
//     departmentStats: [],
//   });
//   const [passedApplicants, setPassedApplicants] = useState([]);
//   const [selectedApplicant, setSelectedApplicant] = useState(null);

//   const [mailData, setMailData] = useState({
//     name: "",
//     email: "",
//     status: "pass",
//     note: "",
//     start_date: "",
//   });

//   const [recruitmentForm, setRecruitmentForm] = useState({
//     position: "",
//     quantity: "",
//     salary: "",
//     deadline: "",
//     location: "",
//     skills: "",
//     formLink: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     employee_code: "",
//     department_id: "",
//     position: "",
//     join_date: "",
//     status: "ACTIVE",
//   });

//   useEffect(() => {
//     if (activeTab === "pass") {
//       fetchPassedApplicants();
//     } else {
//       fetchAllData();
//     }
//   }, [activeTab]);

//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       const deptResponse = await fetch(`${API_URL}/departments`, {
//         credentials: "include",
//       });
//       const deptData = deptResponse.ok ? await deptResponse.json() : [];
//       setDepartments(deptData);

//       const empResponse = await fetch(`${API_URL}/employees`, {
//         credentials: "include",
//       });
//       const empData = empResponse.ok ? await empResponse.json() : [];
//       setEmployees(empData);
//       calculateOverviewStats(empData, deptData);

//       const detailsResponse = await fetch(`${API_URL}/departments`, {
//         credentials: "include",
//       });
//       if (detailsResponse.ok) {
//         setDepartmentDetails(await detailsResponse.json());
//       }
//       try {
//         const response = await fetch(`${API_URL}/ai_index`);
//         if (!response.ok) throw new Error("Không thể lấy dữ liệu AI Index");
//         const data = await response.json();
//         setAiData(data);
//         const highUrgencyCount = data.filter(
//           (item) => item.mucDoKhanCap === "CAO"
//         ).length;
//         setHighUrgencyCount(highUrgencyCount);
//       } catch (error) {
//         console.error("Lỗi khi gọi API ai_index:", error);
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//     setLoading(false);
//   };

//   // --- STATE MỚI CHO MODAL GỬI MAIL HÀNG LOẠT ---
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [inviteData, setInviteData] = useState({
//     interview_time: "",
//     interview_date: "",
//   });
//   // ==========================================================
//   // == CÁC HÀM MỚI CHO TAB "ỨNG VIÊN ĐẠT PHỎNG VẤN" ==
//   // ==========================================================
//   const fetchPassedApplicants = async () => {
//     setLoading(true);
//     setSelectedApplicant(null); // Reset lựa chọn khi tải lại dữ liệu
//     try {
//       const response = await fetch(`${API_URL}/applicants_pass_dat`);
//       if (!response.ok) throw new Error("Không thể lấy danh sách ứng viên");
//       const data = await response.json();
//       setPassedApplicants(data);
//     } catch (error) {
//       console.error("Lỗi khi lấy dữ liệu ứng viên:", error);
//       alert("Lỗi: " + error.message);
//     }
//     setLoading(false);
//   };

//   const handleInviteFormChange = (e) => {
//     setInviteData({ ...inviteData, [e.target.name]: e.target.value });
//   };

//   const handleInviteSubmit = async (e) => {
//     e.preventDefault();
//     if (!inviteData.interview_date || !inviteData.interview_time) {
//       alert("Vui lòng nhập đủ ngày và giờ!");
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(
//         `${API_URL}/applicants-pass/send-interview-invites`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(inviteData),
//         }
//       );
//       if (!response.ok) {
//         const err = await response.json();
//         throw new Error(err.message || "Gửi yêu cầu thất bại");
//       }
//       alert("Yêu cầu gửi mail hàng loạt đã được chuyển đến hệ thống!");
//       setShowInviteModal(false);
//       setInviteData({ interview_time: "", interview_date: "" });
//     } catch (error) {
//       alert("Lỗi: " + error.message);
//     }
//     setIsSubmitting(false);
//   };

//   const handleDeleteApplicant = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn xóa ứng viên này?")) return;
//     try {
//       const response = await fetch(`${API_URL}/applicants_pass/${id}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) throw new Error("Xóa thất bại");
//       alert("Đã xóa thành công!");
//       fetchPassedApplicants(); // Tải lại danh sách
//     } catch (error) {
//       alert("Lỗi: " + error.message);
//     }
//   };

//   // HÀM MỚI: Xử lý khi chọn một ứng viên từ bảng
//   const handleApplicantSelect = (applicant) => {
//     setSelectedApplicant(applicant);
//     setMailData({
//       name: applicant.full_name,
//       email: applicant.email,
//       status: "pass",
//       note: "",
//       start_date: "",
//     });
//   };

//   const handleMailFormChange = (e) => {
//     setMailData({ ...mailData, [e.target.name]: e.target.value });
//   };

//   const handleMailSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${API_URL}/send-mail-candidate`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(mailData),
//       });
//       if (!response.ok) throw new Error("Gửi yêu cầu thất bại");
//       alert("Yêu cầu gửi mail đã được chuyển đến hệ thống!");
//       setSelectedApplicant(null); // Ẩn form sau khi gửi thành công
//     } catch (error) {
//       alert("Lỗi: " + error.message);
//     }
//     setIsSubmitting(false);
//   };

//   const openMailForm = (applicant) => {
//     setMailData({
//       name: applicant.full_name,
//       email: applicant.email,
//       status: "pass", // Mặc định là 'pass'
//       note: "",
//     });
//     setShowMailForm(true);
//   };

//   const calculateOverviewStats = (empData, deptData) => {
//     const totalEmployees = empData.length;
//     const highRiskCount = empData.filter(
//       (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
//     ).length;

//     const departmentStats = deptData.map((dept) => {
//       const deptEmployees = empData.filter(
//         (emp) => emp.department_id === dept.department_id
//       );
//       const highRiskInDept = deptEmployees.filter(
//         (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
//       ).length;

//       return {
//         name: dept.department_name,
//         total: deptEmployees.length,
//         highRisk: highRiskInDept,
//       };
//     });

//     setOverviewStats({
//       totalEmployees,
//       highRiskCount,
//       departmentStats,
//     });
//   };

//   const handleCreate = async () => {
//     if (!formData.name || !formData.email || !formData.department_id) {
//       alert("Vui lòng điền đầy đủ thông tin!");
//       return;
//     }

//     try {
//       const response = await fetch(`${API_URL}/employees`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         await fetchAllData();
//         setShowModal(false);
//         resetForm();
//         alert("Thêm nhân viên thành công!");
//       } else {
//         alert("Lỗi khi thêm nhân viên!");
//       }
//     } catch (error) {
//       alert("Lỗi kết nối!");
//     }
//   };

//   const handleUpdate = async () => {
//     if (!formData.name || !formData.email) {
//       alert("Vui lòng điền đầy đủ thông tin!");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${API_URL}/employees/${currentEmployee.id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify(formData),
//         }
//       );

//       if (response.ok) {
//         await fetchAllData();
//         setShowModal(false);
//         resetForm();
//         alert("Cập nhật thành công!");
//       } else {
//         alert("Lỗi khi cập nhật!");
//       }
//     } catch (error) {
//       alert("Lỗi kết nối!");
//     }
//   };

//   const handleDelete = async (id, name) => {
//     if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${name}"?`)) return;

//     try {
//       const response = await fetch(`${API_URL}/employees/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (response.ok) {
//         await fetchAllData();
//         alert("Đã xóa nhân viên!");
//       } else {
//         alert("Lỗi khi xóa!");
//       }
//     } catch (error) {
//       alert("Lỗi kết nối!");
//     }
//   };

//   const openCreateModal = () => {
//     setModalMode("create");
//     resetForm();
//     setShowModal(true);
//   };

//   const openEditModal = (employee) => {
//     setModalMode("edit");
//     setCurrentEmployee(employee);
//     setFormData({
//       name: employee.name,
//       email: employee.email,
//       department_id: employee.department_id?.toString() || "",
//       position: employee.position || "",
//       status: employee.status || "ACTIVE",
//     });
//     setShowModal(true);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       email: "",
//       department_id: "",
//       position: "",
//       status: "ACTIVE",
//     });
//     setCurrentEmployee(null);
//   };

//   const handleRecruitmentSubmit = async (e) => {
//     e.preventDefault(); // Ngăn trang web tải lại khi nhấn nút

//     if (
//       !recruitmentForm.position ||
//       !recruitmentForm.deadline ||
//       !recruitmentForm.formLink
//     ) {
//       alert(
//         "Vui lòng nhập các trường bắt buộc: Vị trí, Hạn nộp và Đường dẫn ứng tuyển."
//       );
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${API_URL}/recruitment/post`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(recruitmentForm),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert("Thành công! Tin tuyển dụng sẽ được đăng trong vài giây.");
//         // Xóa nội dung form sau khi gửi thành công
//         setRecruitmentForm({
//           position: "",
//           quantity: "",
//           salary: "",
//           deadline: "",
//           location: "",
//           skills: "",
//           formLink: "",
//         });
//       } else {
//         throw new Error(result.message || "Có lỗi xảy ra.");
//       }
//     } catch (error) {
//       alert(`Lỗi: ${error.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const filteredEmployees =
//     selectedDepartment === "all"
//       ? employees
//       : employees.filter(
//           (emp) => emp.department_id === parseInt(selectedDepartment)
//         );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center">
//             <div className="text-4xl mr-4">🏢</div>
//             <div>
//               <h1 className="text-3xl font-bold mb-1">
//                 HR Analytics Dashboard
//               </h1>
//               <p className="text-blue-100">
//                 Quản lý nhân viên và phân tích dữ liệu
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex space-x-8">
//             {[
//               { id: "overview", label: "Tổng quan", icon: Activity },
//               { id: "departments", label: "Phòng ban", icon: Users },
//               { id: "employees", label: "Nhân viên", icon: Users },
//               { id: "recruitment", label: "Tuyển dụng", icon: Activity },
//               { id: "pass", label: "Ứng viên đạt phỏng vấn", icon: Users },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
//                   activeTab === tab.id
//                     ? "border-blue-600 text-blue-600"
//                     : "border-transparent text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 <tab.icon size={20} />
//                 <span className="font-medium">{tab.label}</span>
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto p-6">
//         {activeTab === "overview" && (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm mb-1">
//                       Tổng số nhân viên
//                     </p>
//                     <p className="text-4xl font-bold text-gray-900">
//                       {overviewStats.totalEmployees}
//                     </p>
//                   </div>
//                   <Users className="text-blue-500" size={48} />
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm mb-1">
//                       Nhân Viên có mức độ khẩn cấp cao
//                     </p>
//                     <p className="text-4xl font-bold text-red-600">
//                       {highUrgencyCount}
//                     </p>
//                   </div>
//                   <AlertTriangle className="text-red-500" size={48} />
//                 </div>
//               </div>

//               <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-sm mb-1">Số phòng ban</p>
//                     <p className="text-4xl font-bold text-gray-900">
//                       {departments.length}
//                     </p>
//                   </div>
//                   <Activity className="text-green-500" size={48} />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-xl font-semibold mb-6 text-gray-800">
//                 Thống kê theo phòng ban
//               </h3>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={overviewStats.departmentStats}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="total" fill="#3b82f6" name="Tổng NV" />
//                   <Bar dataKey="highRisk" fill="#ef4444" name="Rủi ro cao" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-xl font-semibold mb-4 text-gray-800">
//                 Chi tiết phòng ban
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {overviewStats.departmentStats.map((dept, index) => (
//                   <div
//                     key={index}
//                     className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                   >
//                     <h4 className="font-semibold text-gray-800 mb-2">
//                       {dept.name}
//                     </h4>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">
//                         Tổng: <strong>{dept.total}</strong>
//                       </span>
//                       <span className="text-red-600">
//                         Rủi ro: <strong>{dept.highRisk}</strong>
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//         {activeTab === "departments" && (
//           <div className="bg-white rounded-lg shadow-lg p-6">
//             <h3 className="text-xl font-semibold mb-6 text-gray-800">
//               Danh Sách Dự Đoán AI (AI Index)
//             </h3>

//             {aiData.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         ID
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         Email
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         Họ và Tên
//                       </th>
//                       <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
//                         Mức độ khẩn cấp
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {aiData.map((item) => {
//                       const urgencyColors = {
//                         CAO: "bg-red-100 text-red-800 font-semibold",
//                         "TRUNG BÌNH":
//                           "bg-yellow-100 text-yellow-800 font-semibold",
//                         THẤP: "bg-green-100 text-green-800 font-semibold",
//                         "KHÔNG XÁC ĐỊNH": "bg-gray-100 text-gray-700",
//                       };

//                       return (
//                         <tr key={item.id}>
//                           <td className="px-4 py-3 text-sm text-gray-700">
//                             {item.id}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-700">
//                             {item.employeeEmail}
//                           </td>
//                           <td className="px-4 py-3 text-sm text-gray-900 font-medium">
//                             {item.employeeName}
//                           </td>
//                           <td className="px-4 py-3 text-center">
//                             <span
//                               className={`px-3 py-1 text-xs rounded-full ${
//                                 urgencyColors[item.mucDoKhanCap] ||
//                                 "bg-gray-100 text-gray-600"
//                               }`}
//                             >
//                               {item.mucDoKhanCap || "KHÔNG XÁC ĐỊNH"}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <p className="text-center text-gray-500 py-4">
//                 Không có dữ liệu AI Index nào được ghi nhận.
//               </p>
//             )}
//           </div>
//         )}
//         {activeTab === "employees" && (
//           <div className="space-y-4">
//             <div className="bg-white rounded-lg shadow-sm">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <h3 className="text-xl font-semibold text-gray-800">
//                     Danh sách nhân viên
//                   </h3>
//                   <button
//                     onClick={openCreateModal}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm"
//                   >
//                     <Plus size={20} />
//                     <span className="font-medium">Thêm nhân viên</span>
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 border-b border-gray-200 bg-gray-50">
//                 <select
//                   className="border border-gray-300 rounded-md px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   value={selectedDepartment}
//                   onChange={(e) => setSelectedDepartment(e.target.value)}
//                 >
//                   <option value="all">Tất cả phòng ban</option>
//                   {departments.map((dept) => (
//                     <option key={dept.department_id} value={dept.department_id}>
//                       {dept.department_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {loading ? (
//                 <div className="p-12 text-center text-gray-500">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="mt-4">Đang tải...</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                           Nhân viên
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                           Phòng ban
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                           Chức vụ
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                           Trạng thái
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                           Hành động
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredEmployees.map((emp) => (
//                         <tr
//                           key={emp.id}
//                           className="hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="px-6 py-4">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900">
//                                 {emp.name}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 {emp.email}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                             {emp.department_name}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                             {emp.position || "-"}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 py-1 text-xs rounded-full font-medium ${
//                                 emp.status === "ACTIVE"
//                                   ? "bg-green-100 text-green-800"
//                                   : emp.status === "INACTIVE"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                               }`}
//                             >
//                               {emp.status === "ACTIVE"
//                                 ? "Đang làm"
//                                 : emp.status === "INACTIVE"
//                                 ? "Nghỉ việc"
//                                 : "Nghỉ phép"}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex space-x-2">
//                               <button
//                                 onClick={() => openEditModal(emp)}
//                                 className="text-blue-600 hover:text-blue-800 transition-colors p-1"
//                                 title="Chỉnh sửa"
//                               >
//                                 <Edit2 size={18} />
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(emp.id, emp.name)}
//                                 className="text-red-600 hover:text-red-800 transition-colors p-1"
//                                 title="Xóa"
//                               >
//                                 <Trash2 size={18} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                       {filteredEmployees.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan="5"
//                             className="px-6 py-12 text-center text-gray-500"
//                           >
//                             Không có nhân viên nào
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//         {activeTab === "recruitment" && (
//           <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
//             <h3 className="text-2xl font-bold text-gray-800 mb-6">
//               Tạo tin tuyển dụng mới
//             </h3>
//             <form onSubmit={handleRecruitmentSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Vị trí tuyển dụng *
//                 </label>
//                 <input
//                   type="text"
//                   name="position"
//                   value={recruitmentForm.position}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       position: e.target.value,
//                     })
//                   }
//                   placeholder="VD: Senior React Developer"
//                   className="w-full border rounded-lg p-3"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Số lượng
//                 </label>
//                 <input
//                   type="number"
//                   name="quantity"
//                   value={recruitmentForm.quantity}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       quantity: e.target.value,
//                     })
//                   }
//                   className="w-full border rounded-lg p-3"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mức lương (dạng text)
//                 </label>
//                 <input
//                   type="text"
//                   name="salary"
//                   value={recruitmentForm.salary}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       salary: e.target.value,
//                     })
//                   }
//                   placeholder="VD: 10-20 triệu (thỏa thuận)"
//                   className="w-full border rounded-lg p-3"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Địa điểm làm việc
//                 </label>
//                 <input
//                   type="text"
//                   name="location"
//                   value={recruitmentForm.location}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       location: e.target.value,
//                     })
//                   }
//                   placeholder="VD: Hà Nội / HCM"
//                   className="w-full border rounded-lg p-3"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Kỹ năng yêu cầu
//                 </label>
//                 <input
//                   type="text"
//                   name="skills"
//                   value={recruitmentForm.skills}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       skills: e.target.value,
//                     })
//                   }
//                   placeholder="VD: ReactJS, NodeJS, AWS"
//                   className="w-full border rounded-lg p-3"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Đường dẫn ứng tuyển (Google Form, etc.) *
//                 </label>
//                 <input
//                   type="url"
//                   name="formLink"
//                   value={recruitmentForm.formLink}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       formLink: e.target.value,
//                     })
//                   }
//                   placeholder="https://forms.gle/..."
//                   className="w-full border rounded-lg p-3"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Hạn nộp hồ sơ *
//                 </label>
//                 <input
//                   type="date"
//                   name="deadline"
//                   value={recruitmentForm.deadline}
//                   onChange={(e) =>
//                     setRecruitmentForm({
//                       ...recruitmentForm,
//                       deadline: e.target.value,
//                     })
//                   }
//                   className="w-full border rounded-lg p-3"
//                   required
//                 />
//               </div>
//               <div>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
//                 >
//                   {isSubmitting ? "Đang xử lý..." : "Đăng tin lên Facebook"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//         {activeTab === "pass" && (
//           <div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-6">
//               Danh sách & Gửi mail cho Ứng viên Đạt
//             </h3>
//             <button
//               onClick={() => setShowInviteModal(true)}
//               className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700"
//             >
//               <Send size={18} />
//               <span>Gửi mail phỏng vấn</span>
//             </button>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* CỘT BÊN TRÁI: BẢNG DANH SÁCH */}
//               <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
//                 {loading ? (
//                   <p className="text-center text-gray-500">
//                     Đang tải dữ liệu...
//                   </p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="p-3 text-left font-semibold text-gray-600 border">
//                             Họ và tên
//                           </th>
//                           <th className="p-3 text-left font-semibold text-gray-600 border">
//                             Email
//                           </th>
//                           <th className="p-3 text-left font-semibold text-gray-600 border">
//                             Vị trí
//                           </th>
//                           <th className="p-3 text-center font-semibold text-gray-600 border">
//                             Xóa
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {passedApplicants.map((app) => (
//                           <tr
//                             key={app.id}
//                             onClick={() => handleApplicantSelect(app)}
//                             className={`border-t cursor-pointer ${
//                               selectedApplicant?.id === app.id
//                                 ? "bg-blue-100"
//                                 : "hover:bg-gray-50"
//                             }`}
//                           >
//                             <td className="p-3 border font-medium">
//                               {app.full_name}
//                             </td>
//                             <td className="p-3 border">{app.email}</td>
//                             <td className="p-3 border">{app.position}</td>
//                             <td className="p-3 border text-center">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleDeleteApplicant(app.id);
//                                 }}
//                                 className="text-red-500 hover:text-red-700"
//                                 title="Xóa ứng viên"
//                               >
//                                 <Trash2 size={18} />
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>

//               {/* CỘT BÊN PHẢI: FORM GỬI MAIL */}
//               <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
//                 {selectedApplicant ? (
//                   <div>
//                     <h4 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
//                       Gửi mail Kết quả
//                     </h4>
//                     <form onSubmit={handleMailSubmit}>
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Họ và tên:
//                           </label>
//                           <input
//                             value={mailData.name}
//                             disabled
//                             className="border w-full p-2 rounded mt-1 bg-gray-100"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Email:
//                           </label>
//                           <input
//                             value={mailData.email}
//                             disabled
//                             className="border w-full p-2 rounded mt-1 bg-gray-100"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Trạng thái:
//                           </label>
//                           <select
//                             name="status"
//                             value={mailData.status}
//                             onChange={handleMailFormChange}
//                             className="border w-full p-2 rounded mt-1"
//                           >
//                             <option value="pass">Đậu</option>
//                             <option value="fail">Trượt</option>
//                           </select>
//                         </div>

//                         {/* ====== TRƯỜNG MỚI ĐƯỢC THÊM VÀO ĐÂY ====== */}
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Ngày bắt đầu làm:
//                           </label>
//                           <input
//                             type="date"
//                             name="start_date"
//                             value={mailData.start_date}
//                             onChange={handleMailFormChange}
//                             className="border w-full p-2 rounded mt-1"
//                           />
//                         </div>
//                         {/* =========================================== */}

//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Ghi chú:
//                           </label>
//                           <textarea
//                             name="note"
//                             value={mailData.note}
//                             onChange={handleMailFormChange}
//                             className="border w-full p-2 rounded mt-1 h-24"
//                             placeholder="VD: Mời đến nhận việc vào ngày..."
//                           ></textarea>
//                         </div>
//                       </div>
//                       <div className="flex justify-end mt-6">
//                         <button
//                           type="submit"
//                           disabled={isSubmitting}
//                           className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
//                         >
//                           <Mail size={18} />
//                           {isSubmitting ? "Đang gửi..." : "Gửi"}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
//                     <Mail size={48} className="mb-4 text-gray-300" />
//                     <p className="font-semibold">Vui lòng chọn một ứng viên</p>
//                     <p className="text-sm">
//                       Bấm vào một hàng trong danh sách bên trái để soạn và gửi
//                       mail.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             {/* MODAL MỚI: Gửi mail phỏng vấn hàng loạt */}

//             {showInviteModal && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
//                   <h4 className="text-xl font-semibold mb-4">
//                     Gửi Lịch phỏng vấn Hàng loạt
//                   </h4>

//                   <form onSubmit={handleInviteSubmit}>
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Ngày phỏng vấn:
//                         </label>

//                         <input
//                           type="date"
//                           name="interview_date"
//                           value={inviteData.interview_date}
//                           onChange={handleInviteFormChange}
//                           className="border w-full p-2 rounded mt-1"
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Thời gian phỏng vấn:
//                         </label>

//                         <input
//                           type="text"
//                           name="interview_time"
//                           value={inviteData.interview_time}
//                           onChange={handleInviteFormChange}
//                           className="border w-full p-2 rounded mt-1"
//                           placeholder="VD: 09:00 AM"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="flex justify-end gap-4 mt-6">
//                       <button
//                         type="button"
//                         onClick={() => setShowInviteModal(false)}
//                         className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
//                       >
//                         Hủy
//                       </button>

//                       <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
//                       >
//                         {isSubmitting ? "Đang gửi..." : "Gửi cho tất cả"}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-semibold text-gray-900">
//                   {modalMode === "create"
//                     ? "Thêm nhân viên mới"
//                     : "Chỉnh sửa nhân viên"}
//                 </h3>
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="text-gray-400 hover:text-gray-600 transition-colors"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Họ tên <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Nguyễn Văn A"
//                   value={formData.name}
//                   onChange={(e) =>
//                     setFormData({ ...formData, name: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Mã nhân viên <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="EMP001"
//                   value={formData.employee_code}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       employee_code: e.target.value,
//                     })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="email@company.com"
//                   value={formData.email}
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phòng ban <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.department_id}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       department_id: e.target.value,
//                     })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">-- Chọn phòng ban --</option>
//                   {departments.map((dept) => (
//                     <option key={dept.department_id} value={dept.department_id}>
//                       {dept.department_name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Chức vụ
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Developer, Manager..."
//                   value={formData.position}
//                   onChange={(e) =>
//                     setFormData({ ...formData, position: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Ngày vào làm <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={formData.join_date}
//                   onChange={(e) =>
//                     setFormData({ ...formData, join_date: e.target.value })
//                   }
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {modalMode === "edit" && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Trạng thái
//                   </label>
//                   <select
//                     value={formData.status}
//                     onChange={(e) =>
//                       setFormData({ ...formData, status: e.target.value })
//                     }
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="ACTIVE">Đang làm việc</option>
//                     <option value="INACTIVE">Nghỉ việc</option>
//                     <option value="ON_LEAVE">Nghỉ phép</option>
//                   </select>
//                 </div>
//               )}
//             </div>

//             <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={modalMode === "create" ? handleCreate : handleUpdate}
//                 className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
//               >
//                 <Save size={18} />
//                 <span>{modalMode === "create" ? "Thêm mới" : "Cập nhật"}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default HRDashboard;
