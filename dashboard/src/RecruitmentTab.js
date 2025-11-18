// import React, { useState } from "react";
// import { Send } from "lucide-react";

// const API_URL = "http://localhost:3001/api";

// const RecruitmentTab = () => {
//   const [formData, setFormData] = useState({
//     position: "",
//     quantity: "",
//     salary: "",
//     deadline: "",
//     location: "",
//     skills: "",
//     formLink: "",
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.position || !formData.deadline || !formData.formLink) {
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
//         body: JSON.stringify(formData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert("Thành công! Tin tuyển dụng sẽ được đăng trong vài giây.");
//         setFormData({
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

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
//       <h3 className="text-2xl font-bold text-gray-800 mb-6">
//         Tạo tin tuyển dụng mới
//       </h3>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Vị trí tuyển dụng *
//           </label>
//           <input
//             type="text"
//             name="position"
//             value={formData.position}
//             onChange={handleChange}
//             placeholder="VD: Senior React Developer"
//             className="w-full border rounded-lg p-3"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Số lượng
//           </label>
//           <input
//             type="number"
//             name="quantity"
//             value={formData.quantity}
//             onChange={handleChange}
//             className="w-full border rounded-lg p-3"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Mức lương (dạng text)
//           </label>
//           <input
//             type="text"
//             name="salary"
//             value={formData.salary}
//             onChange={handleChange}
//             placeholder="VD: 10-20 triệu (thỏa thuận)"
//             className="w-full border rounded-lg p-3"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Địa điểm làm việc
//           </label>
//           <input
//             type="text"
//             name="location"
//             value={formData.location}
//             onChange={handleChange}
//             placeholder="VD: Hà Nội / HCM"
//             className="w-full border rounded-lg p-3"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Kỹ năng yêu cầu
//           </label>
//           <input
//             type="text"
//             name="skills"
//             value={formData.skills}
//             onChange={handleChange}
//             placeholder="VD: ReactJS, NodeJS, AWS"
//             className="w-full border rounded-lg p-3"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Đường dẫn ứng tuyển (Google Form, etc.) *
//           </label>
//           <input
//             type="url"
//             name="formLink"
//             value={formData.formLink}
//             onChange={handleChange}
//             placeholder="https://forms.gle/..."
//             className="w-full border rounded-lg p-3"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Hạn nộp hồ sơ *
//           </label>
//           <input
//             type="date"
//             name="deadline"
//             value={formData.deadline}
//             onChange={handleChange}
//             className="w-full border rounded-lg p-3"
//             required
//           />
//         </div>
//         <div>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
//           >
//             <Send size={18} />
//             {isSubmitting ? "Đang xử lý..." : "Đăng tin lên Facebook"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default RecruitmentTab;
