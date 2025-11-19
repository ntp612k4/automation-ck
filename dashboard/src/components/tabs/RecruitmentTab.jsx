import React from 'react'
import RecruitmentForm from '../forms/RecruitmentForm'

const RecruitmentTab = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Tạo tin tuyển dụng mới
      </h3>
      <RecruitmentForm />
    </div>
  )
}

export default RecruitmentTab
