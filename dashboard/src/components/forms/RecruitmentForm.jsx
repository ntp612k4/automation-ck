import React, { useState } from 'react'
import { api } from '../../services/api' // Đảm bảo đường dẫn đúng

const RecruitmentForm = () => {
  const [recruitmentForm, setRecruitmentForm] = useState({
    position: '',
    quantity: '',
    salary: '',
    deadline: '',
    location: '',
    skills: '',
    formLink: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (e) => {
    setRecruitmentForm({ ...recruitmentForm, [e.target.name]: e.target.value })
  }

  const handleRecruitmentSubmit = async (e) => {
    e.preventDefault()

    if (
      !recruitmentForm.position ||
      !recruitmentForm.deadline ||
      !recruitmentForm.formLink
    ) {
      alert(
        'Vui lòng nhập các trường bắt buộc: Vị trí, Hạn nộp và Đường dẫn ứng tuyển.'
      )
      return
    }

    setIsSubmitting(true)
    try {
      await api.postRecruitment(recruitmentForm)
      alert('Thành công! Tin tuyển dụng sẽ được đăng trong vài giây.')
      // Reset form
      setRecruitmentForm({
        position: '',
        quantity: '',
        salary: '',
        deadline: '',
        location: '',
        skills: '',
        formLink: '',
      })
    } catch (error) {
      alert(`Lỗi: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleRecruitmentSubmit} className="space-y-6">
      {/* Vị trí tuyển dụng */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vị trí tuyển dụng *
        </label>
        <input
          type="text"
          name="position"
          value={recruitmentForm.position}
          onChange={handleFormChange}
          placeholder="VD: Senior React Developer"
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      {/* Số lượng */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng
        </label>
        <input
          type="number"
          name="quantity"
          value={recruitmentForm.quantity}
          onChange={handleFormChange}
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Mức lương */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mức lương (dạng text)
        </label>
        <input
          type="text"
          name="salary"
          value={recruitmentForm.salary}
          onChange={handleFormChange}
          placeholder="VD: 10-20 triệu (thỏa thuận)"
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Địa điểm */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Địa điểm làm việc
        </label>
        <input
          type="text"
          name="location"
          value={recruitmentForm.location}
          onChange={handleFormChange}
          placeholder="VD: Hà Nội / HCM"
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Kỹ năng yêu cầu */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kỹ năng yêu cầu
        </label>
        <input
          type="text"
          name="skills"
          value={recruitmentForm.skills}
          onChange={handleFormChange}
          placeholder="VD: ReactJS, NodeJS, AWS"
          className="w-full border rounded-lg p-3"
        />
      </div>

      {/* Đường dẫn ứng tuyển */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đường dẫn ứng tuyển (Google Form, etc.) *
        </label>
        <input
          type="url"
          name="formLink"
          value={recruitmentForm.formLink}
          onChange={handleFormChange}
          placeholder="https://forms.gle/..."
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      {/* Hạn nộp hồ sơ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hạn nộp hồ sơ *
        </label>
        <input
          type="date"
          name="deadline"
          value={recruitmentForm.deadline}
          onChange={handleFormChange}
          className="w-full border rounded-lg p-3"
          required
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng tin lên Facebook'}
        </button>
      </div>
    </form>
  )
}

export default RecruitmentForm
