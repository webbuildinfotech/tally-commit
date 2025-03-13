import { getUsers, getUserById, deleteUser, updateUser } from '../services/userService.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await getUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Exclude password field from response
        const { password, ...userWithoutPassword } = user.toJSON();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Remove password field if included in the update data
        delete updatedData.password;

        const updatedUser = await updateUser(id, updatedData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const removeUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteUser(id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
