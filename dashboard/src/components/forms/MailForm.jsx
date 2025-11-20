import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { api } from "../../services/api";

const MailForm = ({ applicant, onSuccess }) => {
  const [mailData, setMailData] = useState({
    name: "",
    email: "",
    status: "pass",
    note: "",
    start_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (applicant) {
      setMailData((prev) => ({
        ...prev,
        name: applicant.full_name,
        email: applicant.email,
      }));
    }
  }, [applicant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.sendMailCandidate(mailData);
      alert("Gửi mail thành công!");
      onSuccess();
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!applicant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <Mail size={48} className="mb-4 text-gray-300" />
        <p>Vui lòng chọn ứng viên từ danh sách</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="text-xl font-semibold mb-4 border-b pb-2">
        Gửi mail kết quả
      </h4>
      {/* Các input Name, Email (disabled), Status, Date, Note */}
      <input
        value={mailData.name}
        disabled
        className="border w-full p-2 rounded bg-gray-100"
      />
      <input
        value={mailData.email}
        disabled
        className="border w-full p-2 rounded bg-gray-100"
      />

      <select
        value={mailData.status}
        onChange={(e) => setMailData({ ...mailData, status: e.target.value })}
        className="border w-full p-2 rounded"
      >
        <option value="pass">Đậu</option>
        <option value="fail">Trượt</option>
      </select>

      <input
        type="date"
        value={mailData.start_date}
        onChange={(e) =>
          setMailData({ ...mailData, start_date: e.target.value })
        }
        className="border w-full p-2 rounded"
      />

      <textarea
        value={mailData.note}
        onChange={(e) => setMailData({ ...mailData, note: e.target.value })}
        className="border w-full p-2 h-24"
        placeholder="Ghi chú..."
      ></textarea>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi Mail"}
      </button>
    </form>
  );
};

export default MailForm;
