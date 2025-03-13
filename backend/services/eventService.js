import { Op } from "sequelize";
import Event from "../models/event.js";
/**
 * Get all events with optional filters including keyword search
 * @param {Object} filters - Filters for retrieving events
 * @param {String} keyword - Search keyword for name and description
 * @returns {Promise<Array>} - List of events
 */
export const getAllEvents = async (filters = {}, keyword = '') => {
    const whereClause = { ...filters };

    // If keyword is provided, search in both name and description
    if (keyword) {
        whereClause[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${keyword}%` // Case-insensitive partial match in name
                }
            },
            {
                location: {
                    [Op.iLike]: `%${keyword}%` // Case-insensitive partial match in description
                }
            },
            {
                description: {
                    [Op.iLike]: `%${keyword}%` // Case-insensitive partial match in description
                }
            }
        ];
    }

    return await Event.findAll({
        where: whereClause,
        order: [
            ['startDate', 'ASC'] // Order results by start date
        ]
    });
};

/**
 * Get event details by ID
 * @param {String} id - Event ID
 * @returns {Promise<Object>} - Event details
 */
export const getEventById = async (id) => {
  return await Event.findByPk(id);
};

/**
 * Check if event name already exists
 * @param {String} name - Event name to check
 * @returns {Promise<Boolean>} - True if exists, false if not
 */
export const checkEventNameExists = async (name) => {
  const event = await Event.findOne({
    where: {
      name: {
        [Op.iLike]: name, // Case-insensitive comparison
      },
    },
  });
  return event !== null;
};


// ... existing code ...

/**
 * Check if event exists with same date and location
 * @param {String} location - Event location
 * @param {String} startDate - Event start date
 * @param {String} endDate - Event end date
 * @param {String} startTime - Event start time
 * @param {String} endTime - Event end time
 * @returns {Promise<Boolean>} - True if exists, false if not
 */
export const checkEventDateLocationConflict = async (location, startDate, endDate, startTime, endTime) => {
    const event = await Event.findOne({
        where: {
            location: {
                [Op.iLike]: location
            },
            [Op.or]: [
                {
                    // Same day, overlapping times
                    [Op.and]: {
                        startDate: startDate,
                        startTime: {
                            [Op.lt]: endTime
                        },
                        endTime: {
                            [Op.gt]: startTime
                        }
                    }
                },
                {
                    // Different days, date range overlap
                    [Op.and]: {
                        startDate: {
                            [Op.lte]: endDate
                        },
                        endDate: {
                            [Op.gte]: startDate
                        }
                    }
                }
            ]
        }
    });
    return event !== null;
};

/**
 * Create a new event
 * @param {Object} eventData - Event details to create
 * @returns {Promise<Object>} - Newly created event
 */
export const createEvent = async (eventData) => {
  return await Event.create(eventData);
};




/**
 * Check if any event exists at the same location and dates (excluding specified event)
 * @param {String} location - Event location
 * @param {String} startDate - Event start date
 * @param {String} endDate - Event end date
 * @param {String} startTime - Event start time
 * @param {String} endTime - Event end time
 * @param {String} excludeId - ID of event to exclude from check
 * @returns {Promise<Object|null>} - Returns conflicting event if found, null if no conflict
 */
export const findConflictingEvent = async (location, startDate, endDate, startTime, endTime, excludeId = null) => {
    const whereClause = {
        location: {
            [Op.iLike]: location
        },
        [Op.and]: [
            {
                [Op.or]: [
                    {
                        // Same day time overlap
                        [Op.and]: {
                            startDate: startDate,
                            startTime: {
                                [Op.lt]: endTime
                            },
                            endTime: {
                                [Op.gt]: startTime
                            }
                        }
                    },
                    {
                        // Different days overlap
                        [Op.and]: {
                            startDate: {
                                [Op.lte]: endDate
                            },
                            endDate: {
                                [Op.gte]: startDate
                            }
                        }
                    }
                ]
            }
        ]
    };

    if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
    }

    return await Event.findOne({ where: whereClause });
};

/**
 * Update an existing event
 * @param {String} id - Event ID
 * @param {Object} updatedData - Updated event details
 * @returns {Promise<Object>} - Updated event or null if not found
 */
export const updateEvent = async (id, updatedData) => {
  const event = await getEventById(id);
  if (!event) return null;

  await event.update(updatedData);
  return event;
};

/**
 * Delete an event by ID
 * @param {String} id - Event ID
 * @returns {Promise<Boolean>} - True if deleted, false if not found
 */
export const deleteEvent = async (id) => {
  const event = await getEventById(id);
  if (!event) return false;

  await event.destroy();
  return true;
};
