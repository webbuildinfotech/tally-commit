import User from '../models/user.js';

export const getUsers = async () => {
    return await User.findAll({
        attributes: { exclude: ['password'] }, // Dynamically exclude password
    });
};

export const getUserById = async (id) => {
    return await User.findByPk(id, {
        attributes: { exclude: ['password'] },
    });
};

export const updateUser = async (id, updatedData) => {
    const user = await User.findByPk(id);
    if (!user) {
        return null;
    }
    // Prevent updating the password
    delete updatedData.password;
    await user.update(updatedData);
    // Return the updated user without the password
    return await User.scope('withoutPassword').findByPk(id);
};

export const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        return null;
    }
    await user.destroy();
    return user;
};
