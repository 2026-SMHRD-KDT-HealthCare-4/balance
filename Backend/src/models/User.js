// models/User.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true
    },
    login_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // --- 정자세 기준값(Baseline) 컬럼 ---
    // MediaPipe 수치는 소수점이 매우 정밀하므로 FLOAT보다는 DOUBLE 사용을 권장합니다.
    base_shoulder_width: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    base_neck_dist: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    base_shoulder_diff: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    // ------------------------------------
    provider: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_table',
    timestamps: false,
    underscored: true // DB 컬럼명이 스네이크 케이스(base_neck_dist)일 때 연동을 도와줍니다.
  })

  return User
}