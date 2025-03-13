import { getRegisterEvents, registerForEvent, deleteRegistration } from '../services/eventRegistrationService.js';
import  {handleError } from '../utils/AppError.js';

// Register for an event
export const createEventRegistration = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const eventId = req.params.id;
        const { amount, name, cardNumber } = req.body;

        const result = await registerForEvent(userId, eventId, userRole, {
            amount,
            name,
            cardNumber
        });
        
        res.status(201).json({
            success: true,
            message: 'Successfully registered for the event',
            data: {
                registration: result.registration,
                payment: result.paymentDetails
            }
        });
    } catch (error) {
        return handleError(error, req, res);
    }
};

export const getRegistrations = async (req, res) => {
    try {
        const registrations = await getRegisterEvents(req);
        res.status(200).json({
            success: true,
            message: "Successfully fetched registrations",
            registrations: registrations
        });
    } catch (error) {
        return handleError(error, req, res);
    }
};

export const deleteEventRegistration = async (req, res) => {
    try {
        const registrationId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        await deleteRegistration(registrationId, userId, userRole);
        
        res.status(200).json({
            success: true,
            message: 'Registration successfully deleted'
        });
    } catch (error) {
        return handleError(error, req, res);
    }
};
 
