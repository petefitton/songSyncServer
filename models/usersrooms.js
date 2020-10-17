'use strict';
module.exports = (sequelize, DataTypes) => {
  const usersRooms = sequelize.define('usersRooms', {
    userId: DataTypes.INTEGER,
    roomId: DataTypes.INTEGER
  }, {});
  usersRooms.associate = function(models) {
    // associations can be defined here
  };
  return usersRooms;
};