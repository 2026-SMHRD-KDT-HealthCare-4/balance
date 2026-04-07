// models/StretchingLog.js 수정 제안
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const StretchingLog = sequelize.define('StretchingLog', {
    stretching_id: {
      type: DataTypes.INTEGER(100),
      primaryKey: true,
      autoIncrement: true
    },
    session_id: {
      type: DataTypes.INTEGER(100),
      allowNull: false
    },
    target_part: {
      type: DataTypes.STRING(50),
      allowNull: false // 예: '목', '어깨'
    },
    // --- 추가 제안 필드 ---
    angle: {
      type: DataTypes.FLOAT, // 측정된 실제 각도
      allowNull: true
    },
    posture_status: {
      type: DataTypes.STRING(20), // '정상', '주의', '위험'
      allowNull: true
    },
    ai_feedback: {
      type: DataTypes.TEXT, // LLM이 생성한 피드백 문구 저장
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'stretching_logs_table',
    timestamps: false
  })

  StretchingLog.associate = (models) => {
    StretchingLog.belongsTo(models.Session, {
      foreignKey: 'session_id'
    })
  }

  return StretchingLog
}