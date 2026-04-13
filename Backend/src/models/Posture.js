// models/Posture.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Posture = sequelize.define('Posture', {
    posture_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('FRONT', 'SIDE'),
      allowNull: false
    },
    neck_angle: {
      type: DataTypes.FLOAT,
      allowNull: true   // 측면(SIDE) 사진에서만 측정
    },
    shoulder_angle: {
      type: DataTypes.FLOAT,
      allowNull: true   // 정면(FRONT) 사진에서만 측정
    },
    status: {
      type: DataTypes.ENUM('GOOD', 'WARNING', 'BAD'),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'postures',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  })

  Posture.associate = (models) => {
    Posture.belongsTo(models.User, { foreignKey: 'user_id' })
    Posture.hasMany(models.AiReport, { foreignKey: 'posture_id' })
  }

  return Posture
}
