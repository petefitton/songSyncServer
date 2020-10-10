'use strict';
module.exports = (sequelize, DataTypes) => {
  const room = sequelize.define('room', {
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    isPublic: DataTypes.BOOLEAN
  }, {});
  room.associate = function(models) {
    // associations can be defined here
    models.room.belongsToMany(models.user, {through: 'usersRooms'})
    models.room.hasMany(models.message)
  };
  return room;
};