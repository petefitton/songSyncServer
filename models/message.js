'use strict';
module.exports = (sequelize, DataTypes) => {
  const message = sequelize.define('message', {
    roomId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {});
  message.associate = function(models) {
    // associations can be defined here
    models.message.belongsTo(models.room)
    models.message.belongsTo(models.user)
  };
  return message;
};