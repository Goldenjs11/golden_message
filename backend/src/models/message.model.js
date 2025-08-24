const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define("Message", {
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    viewsLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: "messages",
    timestamps: true,
});

module.exports = Message;
