import { Op } from "sequelize";
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  checkEventNameExists,
  checkEventDateLocationConflict,
  findConflictingEvent,
} from "../services/eventService.js";

/**
 * Controller to fetch all events
 */
export const fetchAllEvents = async (req, res) => {
  try {
    const {
      type,
      startDateFrom,
      startDateTo,
      minPrice,
      maxPrice,
      keyword,    // New keyword parameter
      showUpcoming, // New query parameter
      ...otherFilters
    } = req.query;

    const filters = { ...otherFilters };

    // Add upcoming events filter only if showUpcoming is true
    if (showUpcoming === "true") {
      filters.startDate = {
        [Op.gte]: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      };
    }

    // Add type filter (case-insensitive match)
    if (type) {
      filters.type = type;
    }

    // Add date range filter for startDate
    if (startDateFrom || startDateTo) {
      filters.startDate = {};
      if (startDateFrom) filters.startDate[Op.gte] = startDateFrom;
      if (startDateTo) filters.startDate[Op.lte] = startDateTo;
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) filters.price[Op.lte] = parseFloat(maxPrice);
    }

    // Fetch events with filters
    const events = await getAllEvents(filters, keyword);

      // Handle no matching events
      if (events.length === 0) {
        const message = keyword 
            ? `No events found matching "${keyword}"` 
            : 'No events found matching the specified filters';
        return res.status(404).json({ message });
    }

    // Return matched events with search metadata
    res.status(200).json({
        total: events.length,
        keyword: keyword || null,
        events: events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to fetch event by ID
 */
export const fetchEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to create a new event
 */
export const createNewEvent = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from the token
    const eventData = { ...req.body, createdBy: userId }; // Add userId to event data

    // Basic time format validation (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(eventData.startTime) || !timeRegex.test(eventData.endTime)) {
      return res.status(400).json({
        message: "Invalid time format. Please use HH:mm format (24-hour)"
      });
    }

    // Check same day time validation
    if (eventData.startDate === eventData.endDate) {
      if (eventData.startTime >= eventData.endTime) {
        return res.status(400).json({
          message: "End time must be after start time on the same day"
        });
      }
    }

    // Check for date and location conflict including time
    if (eventData.location) {
      const dateLocationConflict = await checkEventDateLocationConflict(
        eventData.location,
        eventData.startDate,
        eventData.endDate,
        eventData.startTime,
        eventData.endTime
      );

      if (dateLocationConflict) {
        return res.status(400).json({
          message: "Another event is already scheduled at this location during these dates and times"
        });
      }
    }

    // Check if event name already exists
    const nameExists = await checkEventNameExists(eventData.name);
    if (nameExists) {
      return res.status(400).json({
        message: "An event with this name already exists",
      });
    }

    // Get today's date without time component
    const today = new Date().toISOString().split("T")[0];

    // Check if startDate is in the past
    if (eventData.startDate < today) {
      return res.status(400).json({
        message: "Cannot create event with past start date",
      });
    }

    // Check if endDate is before startDate
    if (eventData.endDate < eventData.startDate) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    // If start date is today, ensure end date is at least tomorrow
    if (eventData.startDate === today) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      if (eventData.endDate < tomorrowStr) {
        return res.status(400).json({
          message:
            "For events starting today, end date must be at least tomorrow",
        });
      }
    }

    const newEvent = await createEvent(eventData);
    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to update an event
 */
export const modifyEvent = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from the token
    const { id } = req.params;
    const updatedData = { ...req.body, createdBy: userId }; // Add userId to event data

    const existingEvent = await getEventById(id);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }
    // Use existing dates if not provided in update
    const startDate = updatedData.startDate;
    const endDate = updatedData.endDate;
    const location = updatedData.location;
    // Get today's date without time component
    const today = new Date().toISOString().split("T")[0];

    // Check if startDate is in the past
    if (startDate < today) {
      return res.status(400).json({
        message: "Cannot update event with past date",
      });
    }

    // Check if endDate is before startDate
    if (endDate < startDate) {
      return res.status(400).json({
        message: "End date cannot be before date",
      });
    }
    // If start date is today, ensure end date is at least tomorrow
    if (startDate === today) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      if (endDate < tomorrowStr) {
        return res.status(400).json({
          message:
            "For events starting today, end date must be at least tomorrow",
        });
      }
    }

    // Time validation for updates
    if (updatedData.startTime && updatedData.endTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updatedData.startTime) || !timeRegex.test(updatedData.endTime)) {
        return res.status(400).json({
          message: "Invalid time format. Please use HH:mm format (24-hour)"
        });
      }

      if (startDate === endDate && updatedData.startTime >= updatedData.endTime) {
        return res.status(400).json({
          message: "End time must be after start time on the same day"
        });
      }
    }

    // Check for conflicting events at the same location and dates
    const conflictingEvent = await findConflictingEvent(
      location,
      startDate,
      endDate,
      id
    );
    if (conflictingEvent) {
      return res.status(400).json({
        message: `Location is already booked from ${conflictingEvent.startDate} to ${conflictingEvent.endDate}`,
      });
    }
    const updatedEvent = await updateEvent(id, updatedData);
    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to delete an event
 */
export const removeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
