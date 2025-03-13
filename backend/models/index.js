import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import UserModel from './user.js';
import EventModel from './event.js';
import RegistrationModel from './registraterEvents.js';

// Initialize models
const User = UserModel(sequelize, DataTypes);
const Event = EventModel(sequelize, DataTypes);
const RegistraterEvents = RegistrationModel(sequelize, DataTypes);

// Define relationships
User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(RegistraterEvents, { foreignKey: 'userId' });
RegistraterEvents.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(RegistraterEvents, { foreignKey: 'eventId' });
RegistraterEvents.belongsTo(Event, { foreignKey: 'eventId' });


export { sequelize };
export default { User, Event , RegistraterEvents};
