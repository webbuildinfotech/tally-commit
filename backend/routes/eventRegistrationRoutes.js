import express from "express";
import {
  createEventRegistration,
  deleteEventRegistration,
  getRegistrations
} from "../controllers/eventRegistrationController.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Register for an event (accessible to both users and admins)
router.post("/:id", authorizeRoles(["user", "admin"]), createEventRegistration);
router.get("/get", authorizeRoles(["user", "admin"]), getRegistrations);
router.delete("/delete/:id", authorizeRoles(["user","admin"]), deleteEventRegistration);

export default router;
