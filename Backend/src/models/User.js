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
    provider: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local'
    },
    provider_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // ✅ 컬럼 정의 객체 안에 올바르게 추가
    base_shoulder_width: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    base_neck_dist: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    base_shoulder_diff: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    // ✅ 여기는 테이블 옵션만
    tableName: 'user_table',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  })

  User.associate = (models) => {
    User.hasMany(models.Session, { foreignKey: 'user_id' })
  }

  return User
}