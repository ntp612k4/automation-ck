const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
// Cổng 3000 là cổng mà ứng dụng Node.js lắng nghe bên trong container
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080", // Chỉ cho phép frontend của bạn gọi API
    credentials: true,
  })
);
app.use(express.json());

// --- CẤU HÌNH KẾT NỐI DATABASE CHO MÔI TRƯỜNG DOCKER ---
// Các biến này sẽ được đọc từ file .env hoặc từ environment trong docker-compose
const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql_db",
  user: process.env.DB_USER || "n8n_user",
  password: process.env.DB_PASSWORD || "your_strong_user_password",
  database: process.env.DB_NAME || "hr_analytics",
  port: process.env.DB_PORT || 3306, // Cổng nội bộ của MySQL trong Docker là 3306
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- CÁC API ENDPOINTS ĐÃ CẬP NHẬT ---

// API cho trang "Tổng quan"
app.get("/api/stats/overview", async (req, res) => {
  try {
    // 1. Lấy tổng số nhân viên
    const [totalRes] = await pool.query(
      "SELECT COUNT(*) as total FROM employees WHERE status = 'ACTIVE'"
    );
    const totalEmployees = totalRes[0].total;

    // 2. Lấy số lượng nhân viên cần chú ý (ví dụ: burnout cao)
    // Giả sử bạn có các bảng survey_responses hoặc daily_reports
    const [urgencyRes] = await pool.query(
      "SELECT COUNT(DISTINCT employee_id) as total FROM survey_responses WHERE needs_attention = 1"
    );
    const highUrgencyCount = urgencyRes[0].total;

    // 0️⃣. Lấy tổng số phòng ban
    const [deptRes] = await pool.query(
      "SELECT COUNT(*) AS total FROM departments"
    );
    const departmentStats = deptRes[0].total;

    // 3. Lấy số lượng nhân viên theo từng phòng ban
    const [perDeptRes] = await pool.query(`
      SELECT d.name, COUNT(e.id) as employeeCount
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'ACTIVE'
      GROUP BY d.id, d.name
    `);

    res.json({
      totalEmployees,
      highUrgencyCount,
      departmentStats,
      employeesPerDept: perDeptRes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🧩 API THÊM ĐƠN ỨNG TUYỂN MỚI
app.post("/api/job_applications", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
    } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    if (!full_name || !email || !position) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
    }

    // Lưu dữ liệu vào bảng job_applications
    const query = `
      INSERT INTO job_applications 
        (full_name, email, phone, position, education, language_cert, years_experience, professional_skills, strengths, motivation, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const [result] = await pool.query(query, [
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
    ]);

    res.status(201).json({
      message: "Ứng viên đã được lưu thành công!",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu ứng viên:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
});

// Sửa lại route để nhận id của ứng viên qua URL
app.put("/api/job_applications/:id/ai_result", async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL, ví dụ: /api/job_applications/5/ai_result

    // Lấy các trường cần cập nhật từ body của request
    const {
      ai_overall_score,
      ai_reasoning,
      educationScore,
      experienceScore,
      skillsScore,
      motivationScore,
      ai_recommendation,
      languageScore,
      strengths,
      concerns,
      interviewTopics,
      isPassed,
    } = req.body;

    // THÊM MỆNH ĐỀ "WHERE id = ?" ĐỂ CHỈ CẬP NHẬT ĐÚNG HÀNG
    const query = `
      UPDATE job_applications 
      SET 
        ai_overall_score = ?, 
        ai_reasoning = ?, 
        educationScore = ?,
        experienceScore = ?,
        skillsScore = ?,
        motivationScore = ?,
        ai_recommendation = ?,
        languageScore = ?,
        strengths = ?,
        concerns = ?, 
        interviewTopics = ?, 
        isPassed = ?
      WHERE id = ? 
    `;

    // Sửa lại thứ tự các biến cho khớp với các dấu ? ở trên
    const values = [
      ai_overall_score,
      ai_reasoning,
      educationScore,
      experienceScore,
      skillsScore,
      motivationScore,
      ai_recommendation,
      languageScore,
      strengths,
      concerns,
      interviewTopics,
      isPassed,
      id, // Thêm id vào cuối cho mệnh đề WHERE
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      // Nếu không có hàng nào được cập nhật, có thể id không tồn tại
      return res
        .status(404)
        .json({ message: `Không tìm thấy ứng viên với ID = ${id}` });
    }

    res
      .status(200)
      .json({ message: `✅ Đã cập nhật thành công ứng viên ID = ${id}` });
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật ứng viên ID:`, error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
});

// 🧩 API LẤY DANH SÁCH ỨNG VIÊN (GET)
app.get("/api/job_applications", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        full_name,
        email,
        phone,
        position,
        education,
        language_cert,
        years_experience,
        professional_skills,
        strengths,
        motivation,
        created_at
      FROM job_applications
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách ứng viên:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ứng viên",
      error: error.message,
    });
  }
});

// API lưu đơn ứng tuyển mới
// API lưu ứng viên đã đạt phỏng vấn
app.post("/api/applicants_pass", async (req, res) => {
  try {
    const {
      id,
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
      ai_overall_score,
      ai_recommendation,
      ai_reasoning,
      status,
      concerns,
      interviewTopics,
      isPassed,
      educationScore,
      languageScore,
      experienceScore,
      skillsScore,
      motivationScore,
      created_at,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!full_name || !email || !position) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc!" });
    }

    // Câu lệnh INSERT đầy đủ
    const query = `
      INSERT INTO applicants_pass (
        id, full_name, email, phone, position, education, language_cert, years_experience,
        professional_skills, strengths, motivation,
        ai_overall_score, ai_recommendation, ai_reasoning,
        status, concerns, interviewTopics,
        isPassed, educationScore, languageScore, experienceScore, skillsScore, motivationScore,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Thực thi truy vấn
    const [result] = await pool.query(query, [
      id,
      full_name,
      email,
      phone,
      position,
      education,
      language_cert,
      years_experience,
      professional_skills,
      strengths,
      motivation,
      ai_overall_score,
      ai_recommendation,
      ai_reasoning,
      status || "NEW",
      concerns,
      interviewTopics,
      isPassed,
      educationScore,
      languageScore,
      experienceScore,
      skillsScore,
      motivationScore,
      created_at || new Date(),
    ]);

    // Trả về phản hồi thành công
    res.status(201).json({
      message: "Ứng viên đạt phỏng vấn đã được lưu vào bảng applicants_pass!",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lưu ứng viên:", error);
    res.status(500).json({
      message: "Lỗi máy chủ khi lưu ứng viên!",
      error: error.message,
    });
  }
});

// API lấy dữ liệu  ứng tuyển
// app.get("/api/applicants_pass_get", async (req, res) => {
//   try {
//     // Lấy toàn bộ danh sách
//     const [rows] = await pool.query(`
//       SELECT
//         id, full_name, email, phone, position, education, language_cert, years_experience,
//         professional_skills, strengths, motivation,
//         ai_overall_score, ai_recommendation, ai_reasoning,
//         status, concerns, interviewTopics,
//         isPassed, educationScore, languageScore, experienceScore, skillsScore, motivationScore,
//         created_at
//       FROM applicants_pass
//       ORDER BY created_at DESC
//     `);

//     res.status(200).json({
//       message: "✅ Lấy danh sách ứng viên pass thành công!",
//       total: rows.length,
//       data: rows,
//     });
//   } catch (error) {
//     console.error("❌ Lỗi khi lấy danh sách ứng viên:", error);
//     res.status(500).json({
//       message: "Lỗi máy chủ khi lấy dữ liệu ứng viên!",
//       error: error.message,
//     });
//   }
// });

// ========== API: Lấy danh sách applicants_pass ==========
app.get("/api/applicants_pass_dat", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM applicants_pass ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});

// ========== API: Xóa ứng viên pass ==========
app.delete("/api/applicants_pass/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM applicants_pass WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 API gửi mail pass/fail
app.post("/api/send-mail-candidate", async (req, res) => {
  try {
    const n8nWebhookUrl = process.env.N8N_CANDIDATE_MAIL_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("Lỗi: Chưa cấu hình N8N_CANDIDATE_MAIL_WEBHOOK_URL");
      return res.status(500).json({ message: "Chưa cấu hình Webhook URL." });
    }

    // Đảm bảo URL đúng là http://n8n:... từ file .env
    await axios.post(n8nWebhookUrl, req.body);

    res.status(200).json({ message: "Đã gửi thông tin sang n8n thành công!" });
  } catch (err) {
    console.error("Lỗi khi kích hoạt webhook gửi mail:", err.message);
    res.status(500).json({ error: "Không gửi được dữ liệu sang n8n" });
  }
});

// 📝 API LẤY TOÀN BỘ PHẢN HỒI KHẢO SÁT (bảng )
app.get("/api/ai_responses", async (req, res) => {
  try {
    const query = `
      SELECT * FROM job_applications
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách ", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ",
      error: error.message,
    });
  }
});

// API cho trang "Phòng ban"
app.get("/api/departments", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id AS department_id,
        name AS department_name,
        code AS department_code,
        manager_name,
        manager_email,
        created_at
      FROM departments
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/departments/details", async (req, res) => {
  try {
    const [departments] = await pool.query(
      "SELECT id AS department_id, name AS department_name FROM departments"
    );

    const [employees] = await pool.query(`
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        e.department_id,
        e.satisfaction_score,
        e.stress_level,
        e.work_life_balance,
        e.burnout_risk
      FROM employees e
    `);

    // Gom nhân viên theo phòng ban
    const departmentDetails = departments.map((dept) => ({
      ...dept,
      employees: employees.filter(
        (emp) => emp.department_id === dept.department_id
      ),
    }));

    res.json(departmentDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API lấy toàn bộ danh sách
// API lấy toàn bộ danh sách (ĐÃ SỬA LỖI)
app.get("/api/employee-analysis", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM employee_analysis ORDER BY id DESC"
    );
    res.json(results);
  } catch (err) {
    console.error("❌ Lỗi khi truy vấn employee_analysis:", err);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu" });
  }
});

// ✅ API KÍCH HOẠT WORKFLOW GỬI MAIL PHỎNG VẤN HÀNG LOẠT TRÊN N8N
app.post("/api/applicants-pass/send-interview-invites", async (req, res) => {
  try {
    const { interview_time, interview_date } = req.body;

    if (!interview_time || !interview_date) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ ngày và giờ phỏng vấn." });
    }

    const n8nWebhookUrl = process.env.N8N_INTERVIEW_INVITE_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("Lỗi: Chưa cấu hình N8N_INTERVIEW_INVITE_WEBHOOK_URL");
      return res
        .status(500)
        .json({ message: "Chưa cấu hình Webhook URL cho n8n." });
    }

    // Gửi dữ liệu ngày giờ sang n8n webhook
    await axios.post(n8nWebhookUrl, { interview_time, interview_date });

    res
      .status(200)
      .json({ message: "Yêu cầu gửi mail hàng loạt đã được gửi thành công!" });
  } catch (error) {
    console.error("Lỗi khi kích hoạt n8n webhook:", error.message);
    res.status(500).json({ message: "Có lỗi xảy ra khi gửi yêu cầu đến n8n." });
  }
});

app.post("/api/employee-analysis", async (req, res) => {
  try {
    const {
      rowNumber,
      employeeEmail,
      employeeName,
      diemCamXucAI,
      mucDoKietSuc,
      moiQuanNgaiChinh,
      deXuatTuAI,
      mucDoKhanCap,
      tomTatAI,
      thoiGianPhanTich,
      canChuY,
      priorityLevel,
    } = req.body;

    const sql = `
      INSERT INTO employee_analysis (
        rowNumber, employeeEmail, employeeName,
        diemCamXucAI, mucDoKietSuc, moiQuanNgaiChinh, deXuatTuAI,
        mucDoKhanCap, tomTatAI, thoiGianPhanTich, canChuY, priorityLevel
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      rowNumber,
      employeeEmail,
      employeeName,
      diemCamXucAI,
      mucDoKietSuc,
      JSON.stringify(moiQuanNgaiChinh || []),
      JSON.stringify(deXuatTuAI || []),
      mucDoKhanCap,
      tomTatAI,
      new Date(thoiGianPhanTich),
      canChuY,
      priorityLevel,
    ]);

    res.json({ message: "✅✅ Đã lưu thành công", id: result.insertId });
  } catch (err) {
    console.error("❌ Lỗi khi thêm dữ liệu:", err);
    res
      .status(500)
      .json({ error: "Lỗi khi lưu dữ liệu", details: err.message });
  }
});

// API LẤY DANH SÁCH NHÂN VIÊN (có lọc) oke
app.get("/api/employees", async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id
    `;
    const params = [];
    if (department_id && department_id !== "all") {
      query += " WHERE e.department_id = ?";
      params.push(department_id);
    }
    const [employees] = await pool.query(query, params);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API THÊM NHÂN VIÊN MỚI
app.post("/api/employees", async (req, res) => {
  try {
    const { name, email, department_id, position, employee_code, join_date } =
      req.body;
    if (!name || !email || !department_id || !employee_code) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đủ các trường bắt buộc." });
    }
    const query =
      'INSERT INTO employees (name, email, department_id, position, employee_code, join_date, status) VALUES (?, ?, ?, ?, ?, ?, "ACTIVE")';
    const [result] = await pool.query(query, [
      name,
      email,
      department_id,
      position,
      employee_code,
      join_date,
    ]);
    res.status(201).json({ message: "Thêm thành công", id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Email hoặc Mã nhân viên đã tồn tại." });
    }
    res.status(500).json({ error: error.message });
  }
});

// API SỬA NHÂN VIÊN
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department_id, position, status } = req.body;
    const query =
      "UPDATE employees SET name = ?, email = ?, department_id = ?, position = ?, status = ? WHERE id = ?";
    await pool.query(query, [name, email, department_id, position, status, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API XÓA NHÂN VIÊN
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    res.json({ message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/recruitment/post", async (req, res) => {
  try {
    // Lấy URL webhook của n8n từ biến môi trường
    const n8nWebhookUrl = process.env.N8N_JOB_POST_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("Lỗi: Chưa cấu hình N8N_JOB_POST_WEBHOOK_URL");
      return res
        .status(500)
        .json({ message: "Chưa cấu hình Webhook URL cho n8n." });
    }

    // Gửi dữ liệu nhận được từ frontend đến n8n webhook
    await axios.post(n8nWebhookUrl, req.body);

    // Phản hồi thành công về cho frontend
    res
      .status(200)
      .json({ message: "Yêu cầu đăng tin đã được gửi thành công!" });
  } catch (error) {
    console.error("Lỗi khi kích hoạt n8n webhook:", error.message);
    res.status(500).json({ message: "Có lỗi xảy ra khi gửi yêu cầu đến n8n." });
  }
});
// API cho Login (ví dụ đơn giản, bạn cần làm phức tạp hơn với JWT trong thực tế)
// app.post("/api/auth/login", (req, res) => {
//   const { username, password } = req.body;
//   // Trong thực tế, bạn sẽ kiểm tra username/password với database
//   if (username === "admin" && password === "admin") {
//     res.json({ message: "Đăng nhập thành công" });
//   } else {
//     res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
//   }
// });

// Khởi động server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend API đang chạy trên http://localhost:${PORT}`);
});
