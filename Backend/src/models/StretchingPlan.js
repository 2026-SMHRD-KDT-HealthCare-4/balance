// models/StretchingPlan.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const StretchingPlan = sequelize.define('StretchingPlan', {
    plan_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    plan_date: {
      type: DataTypes.DATEONLY,   // 날짜만 저장 (시간 불필요)
      allowNull: false
    },
    stretching_id: {
      type: DataTypes.ENUM('A', 'B'),
      allowNull: false
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false         // 시연 시 미래 데이터는 false
    }
  }, {
    tableName: 'stretching_plans',
    timestamps: false
  })

  StretchingPlan.associate = (models) => {
    StretchingPlan.belongsTo(models.User, { foreignKey: 'user_id' })
  }

  return StretchingPlan
}
