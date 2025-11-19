import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    totalEmployees: 0,
    highRiskCount: 0,
    departmentStats: [],
  });

  const calculateStats = (empData, deptData) => {
    const totalEmployees = empData.length;
    const highRiskCount = empData.filter(
      (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
    ).length;

    const departmentStats = deptData.map((dept) => {
      const deptEmployees = empData.filter(
        (emp) => emp.department_id === dept.department_id
      );
      const highRiskInDept = deptEmployees.filter(
        (emp) => emp.burnout_score >= 70 || emp.stress_level >= 8
      ).length;
      return {
        name: dept.department_name,
        total: deptEmployees.length,
        highRisk: highRiskInDept,
      };
    });

    setOverviewStats({ totalEmployees, highRiskCount, departmentStats });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        api.getDepartments(),
        api.getEmployees(),
      ]);
      setDepartments(deptData || []);
      setEmployees(empData || []);
      calculateStats(empData || [], deptData || []);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { employees, departments, loading, overviewStats, fetchData };
};
