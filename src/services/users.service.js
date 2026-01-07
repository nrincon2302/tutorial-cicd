import logger from '#config/logger';
import { eq } from 'drizzle-orm';
import { db } from '#config/database';
import { users } from '#models/user.model';

export const getAllUsers = async () => {
  try {
    return await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users);

  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users).where(eq(users.id, id));

    if (!user) throw new Error('User not found');

    return user;
        
  } catch (e) {
    logger.error(`Unable to retrieve user by id ${id}:`, e);
    throw e;
  }
};

export const updateUser = async (id, updatedInfo) => {
  try {
    // Check if user exists before trying to update it
    const existingUser = await getUserById(id);

    // If updating field is email, check if it already exists somewhere else
    if (updatedInfo.email && updatedInfo.email !== existingUser.email) {
      const [emailExists] = await db.select().from(users).where(eq(users.email, updatedInfo.email)).limit(1);

      if (emailExists) throw new Error('Email already in use');
    }

    // Add current time to the updated_at parameter
    const update = {
      ...updatedInfo,
      updated_at: new Date()
    };

    const [updatedUser] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;

  } catch (e) {
    logger.error(`Unable to update user by id ${id}:`, e);
    throw e;
  }
};

export const deleteUser = async (id) => {
  try {
    // First check if user exists
    await getUserById(id);

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
        
  } catch (e) {
    logger.error(`Error deleting user ${id}:`, e);
    throw e;
  }
};
