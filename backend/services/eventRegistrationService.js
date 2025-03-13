import Event from "../models/event.js";
import RegistraterEvents from "../models/registraterEvents.js";
import AppError from "../utils/AppError.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import User from "../models/user.js";
import { getUserById, getUsers } from "./userService.js";

export const registerForEvent = async (
  userId,
  eventId,
  userRole,
  paymentDetails
) => {
  // Admin check
  if (isAdmin(userRole)) {
    throw new AppError(
      "FORBIDDEN",
      "Administrators cannot register for events"
    );
  }

  const existingRegistration = await RegistraterEvents.findOne({
    where: { userId, eventId },
  });

  if (existingRegistration) {
    throw new AppError(
      "ALREADY_EXISTS",
      "You are already registered for this event"
    );
  }

  // Check if event exists
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new AppError("NOT_FOUND", "Event not found");
  }

  // Check event date
  const today = new Date().toISOString().split("T")[0];
  if (event.startDate < today) {
    throw new AppError(
      "EVENT_EXPIRED",
      "This event has already started or ended"
    );
  }

  // Validate payment details if event is paid
  if (event.price > 0) {
    // Validate required payment fields
    const requiredFields = ["amount", "name", "cardNumber"];
    const missingFields = requiredFields.filter(
      (field) => !paymentDetails?.[field]
    );

    if (missingFields.length > 0) {
      throw new AppError(
        "PAYMENT_REQUIRED",
        `Missing payment details: ${missingFields.join(", ")}`
      );
    }

    // Validate card number (basic validation)
    if (
      paymentDetails.cardNumber.length < 16 ||
      paymentDetails.cardNumber.length > 16
    ) {
      throw new AppError("INVALID_PAYMENT", "Invalid card number format");
    }

    // Verify amount matches event price
    if (parseFloat(paymentDetails.amount) !== parseFloat(event.price)) {
      throw new AppError(
        "INVALID_PAYMENT",
        `Payment amount ${paymentDetails.amount} does not match event price ${event.price} ${event.currency}`
      );
    }
  }

  // Create registration with payment details
  const registration = await RegistraterEvents.create({
    userId,
    eventId,
    registeredAt: new Date(),
    paymentStatus: event.price > 0 ? "Completed" : "Free", // Set as Completed since payment is validated
    amount: event.price > 0 ? event.price : 0,
    currency: event.currency,
    payerName: paymentDetails?.name || null,
    cardLastFour: event.price > 0 ? paymentDetails.cardNumber.slice(-4) : null,
    paymentDate: event.price > 0 ? new Date() : null,
  });

  // Get user details for email
  const user = await User.findByPk(userId);

  // Send emails if it's a paid event
  if (event.price > 0) {
    console.log(user, event, registration);
  }

  return {
    registration: {
      id: registration.id,
      eventId: registration.eventId,
      registeredAt: registration.registeredAt,
      paymentStatus: registration.paymentStatus,
      amount: registration.amount,
      currency: registration.currency,
    },
    paymentDetails:
      event.price > 0
        ? {
            amount: event.price,
            currency: event.currency,
            status: "Completed",
            payerName: paymentDetails.name,
            cardLastFour: registration.cardLastFour,
            paymentDate: registration.paymentDate,
          }
        : null,
  };
};

export const getRegisterEvents = async (req) => {
  try {
    let registrations;
    let users;
    
    // Get registrations
    if (isAdmin(req.user.role)) {
      registrations = await RegistraterEvents.findAll();
      users = await getUsers();
    } else {
      registrations = await RegistraterEvents.findAll({
        where: { userId: req.user.id },
      });
      const user = await getUserById(req.user.id);
      users = user ? [user] : [];
    }

    // Get unique event IDs
    const eventIds = [...new Set(registrations.map(reg => reg.eventId))];

    // Fetch all events in one query
    const events = await Event.findAll({
      where: {
        id: eventIds
      }
    });

    // Create lookup objects
    const usersMap = users.reduce((acc, user) => {
      acc[user.id] = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      };
      return acc;
    }, {});

    const eventsMap = events.reduce((acc, event) => {
      acc[event.id] = event;
      return acc;
    }, {});

    // Combine registration data with user and event data
    const registrationsWithDetails = registrations.map(registration => ({
      ...registration.toJSON(),
      user: usersMap[registration.userId],
      event: eventsMap[registration.eventId]
    }));

    return registrationsWithDetails;

  } catch (error) {
    throw new AppError("SERVER_ERROR", "Unable to fetch registrations");
  }
};

export const deleteRegistration = async (registrationId, userId, userRole) => {
    try {
        const registration = await RegistraterEvents.findByPk(registrationId);

        if (!registration) {
            throw new AppError("NOT_FOUND", "Registration not found");
        }

        // Only allow admin or the registered user to delete
        if (!isAdmin(userRole) && registration.userId !== userId) {
            throw new AppError("FORBIDDEN", "You don't have permission to delete this registration");
        }

        // Check if event has already started
        const event = await Event.findByPk(registration.eventId);
        if (event && new Date(event.startDate) <= new Date()) {
            throw new AppError("FORBIDDEN", "Cannot delete registration for an event that has already started");
        }

        await registration.destroy();
        return true;
    } catch (error) {
        throw error;
    }
};