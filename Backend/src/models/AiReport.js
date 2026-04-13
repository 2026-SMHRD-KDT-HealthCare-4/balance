// models/AiReport.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const AiReport = sequelize.define('AiReport', {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    posture_id: {
      type: DataTypes.INTEGER,
      allowNull: false              // 어떤 측정 데이터를 바탕으로 생성됐는지 (FK)
    },
    report_text: {
      type: DataTypes.TEXT,
      allowNull: true               // AI 분석 박스에 들어갈 요약 (2줄)
    },
    prescription_text: {
      type: DataTypes.TEXT,
      allowNull: true               // 약 봉투 처방전 상세 내용
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true               // 대시보드 점수 표시용
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ai_reports',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  })

  AiReport.associate = (models) => {
    AiReport.belongsTo(models.User, { foreignKey: 'user_id' })
    AiReport.belongsTo(models.Posture, { foreignKey: 'posture_id' })
  }

  return AiReport
}
