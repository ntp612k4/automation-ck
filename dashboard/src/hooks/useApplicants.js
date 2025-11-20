import { useState } from "react";
import { api } from "../services/api";

export const useApplicants = () => {
  const [passedApplicants, setPassedApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPassedApplicants = async () => {
    setLoading(true);
    try {
      const data = await api.getPassedApplicants();
      setPassedApplicants(data);
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
    setLoading(false);
  };

  const deleteApplicant = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ứng viên này?")) return;
    try {
      await api.deleteApplicant(id);
      alert("Đã xóa thành công!");
      fetchPassedApplicants();
    } catch (error) {
      alert("Lỗi: " + error.message);
    }
  };

  return { passedApplicants, loading, fetchPassedApplicants, deleteApplicant };
};
