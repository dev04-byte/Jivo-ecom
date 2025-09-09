import { Express } from 'express';
import { storage } from './storage';
import { authenticateUser, requireAdmin, requirePermission } from './rbac-middleware';
import bcrypt from 'bcrypt';
import type { InsertUser } from '@shared/schema';

export function setupUserManagementRoutes(app: Express) {
  // Get all users (Admin only)
  app.get('/api/admin/users', 
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        const usersWithRoles = await Promise.all(
          users.map(async (user) => {
            const userWithRole = await storage.getUserWithRole(user.id);
            const permissions = await storage.getUserPermissions(user.id);
            return {
              ...user,
              name: user.full_name, // Add name field for frontend compatibility
              role: userWithRole?.role || null,
              permissions: permissions.map(p => ({
                id: p.id,
                name: p.permission_name,
                category: p.category
              }))
            };
          })
        );
        res.json(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    }
  );

  // Get single user with details (Admin only)
  app.get('/api/admin/users/:id',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const user = await storage.getUserWithRole(userId);
        
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const permissions = await storage.getUserPermissions(userId);
        
        res.json({
          ...user,
          permissions: permissions.map(p => ({
            id: p.id,
            name: p.permission_name,
            category: p.category
          }))
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  );

  // Create new user (Admin only)
  app.post('/api/admin/users',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const { email, password, name, role_id, permissions } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
          return res.status(400).json({ 
            error: 'Email, password, and name are required' 
          });
        }

        // Check if user already exists
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          return res.status(409).json({ 
            error: 'User with this email already exists' 
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user - use email as username if username not provided
        const userData: InsertUser = {
          username: email.split('@')[0], // Use email prefix as username
          email,
          password: hashedPassword,
          full_name: name,
          role_id: role_id || null,
          google_id: null,
          picture: null
        };

        const newUser = await storage.createUser(userData);

        // Assign permissions if provided
        if (permissions && Array.isArray(permissions)) {
          for (const permissionId of permissions) {
            if (role_id) {
              await storage.assignPermissionToRole(role_id, permissionId);
            }
          }
        }

        // Get updated user with permissions
        const userWithPermissions = await storage.getUserWithRole(newUser.id);
        const userPermissions = await storage.getUserPermissions(newUser.id);

        res.status(201).json({
          ...userWithPermissions,
          permissions: userPermissions.map(p => ({
            id: p.id,
            name: p.permission_name,
            category: p.category
          }))
        });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  );

  // Update user (Admin only)
  app.put('/api/admin/users/:id',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { email, name, role_id, password, isActive } = req.body;

        // Check if user exists
        const existingUser = await storage.getUserById(userId);
        if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Prepare update data
        const updateData: any = {};
        if (email) updateData.email = email;
        if (name) updateData.name = name;
        if (role_id !== undefined) updateData.role_id = role_id;
        if (isActive !== undefined) updateData.is_active = isActive;
        
        // Hash new password if provided
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const updatedUser = await storage.updateUser(userId, updateData);

        // Get updated user with permissions
        const userWithPermissions = await storage.getUserWithRole(userId);
        const permissions = await storage.getUserPermissions(userId);

        res.json({
          ...userWithPermissions,
          permissions: permissions.map(p => ({
            id: p.id,
            name: p.permission_name,
            category: p.category
          }))
        });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
      }
    }
  );

  // Delete user (Admin only)
  app.delete('/api/admin/users/:id',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        
        // Prevent deleting own account
        if (req.user?.id === userId) {
          return res.status(400).json({ 
            error: 'Cannot delete your own account' 
          });
        }

        // Check if user exists
        const existingUser = await storage.getUserById(userId);
        if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Soft delete or hard delete based on your preference
        await storage.updateUser(userId, { is_active: false });
        
        res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
      }
    }
  );

  // Assign or remove role from user (Admin only)
  app.put('/api/admin/users/:id/role',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { roleId } = req.body;

        let updatedUser;

        if (roleId === null || roleId === undefined) {
          // Remove role from user (set role_id to null)
          updatedUser = await storage.updateUser(userId, { role_id: null });
        } else {
          // Check if role exists
          const role = await storage.getRoleById(roleId);
          if (!role) {
            return res.status(404).json({ error: 'Role not found' });
          }

          // Update user role
          updatedUser = await storage.assignRoleToUser(userId, roleId);
        }
        
        // Get updated user with role information
        const userWithRole = await storage.getUserWithRole(userId);
        const permissions = await storage.getUserPermissions(userId);

        res.json({
          ...userWithRole,
          name: userWithRole?.full_name,
          permissions: permissions.map(p => ({
            id: p.id,
            name: p.permission_name,
            category: p.category
          }))
        });
      } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
      }
    }
  );

  // Get all roles (Admin only)
  app.get('/api/admin/roles',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const roles = await storage.getAllRoles();
        const rolesWithPermissions = await Promise.all(
          roles.map(async (role) => {
            const permissions = await storage.getRolePermissions(role.id);
            return {
              ...role,
              permissions
            };
          })
        );
        res.json(rolesWithPermissions);
      } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
      }
    }
  );

  // Create new role (Admin only)
  app.post('/api/admin/roles',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const { role_name, is_admin, permissions } = req.body;

        if (!role_name) {
          return res.status(400).json({ error: 'Role name is required' });
        }

        // Create role
        const newRole = await storage.createRole({
          role_name,
          is_admin: is_admin || false
        });

        // Assign permissions if provided
        if (permissions && Array.isArray(permissions)) {
          for (const permissionId of permissions) {
            await storage.assignPermissionToRole(newRole.id, permissionId);
          }
        }

        // Get role with permissions
        const rolePermissions = await storage.getRolePermissions(newRole.id);

        res.status(201).json({
          ...newRole,
          permissions: rolePermissions
        });
      } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
      }
    }
  );

  // Update role permissions (Admin only)
  app.put('/api/admin/roles/:id/permissions',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const roleId = parseInt(req.params.id);
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
          return res.status(400).json({ 
            error: 'Permissions must be an array of permission IDs' 
          });
        }

        // Get current permissions
        const currentPermissions = await storage.getRolePermissions(roleId);
        const currentPermissionIds = currentPermissions.map(p => p.permission_id);

        // Find permissions to add and remove
        const toAdd = permissions.filter(id => !currentPermissionIds.includes(id));
        const toRemove = currentPermissionIds.filter(id => !permissions.includes(id));

        // Remove old permissions
        for (const permissionId of toRemove) {
          await storage.removePermissionFromRole(roleId, permissionId);
        }

        // Add new permissions
        for (const permissionId of toAdd) {
          await storage.assignPermissionToRole(roleId, permissionId);
        }

        // Get updated permissions
        const updatedPermissions = await storage.getRolePermissions(roleId);

        res.json({
          roleId,
          permissions: updatedPermissions
        });
      } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({ error: 'Failed to update role permissions' });
      }
    }
  );

  // Get all permissions (Admin only)
  app.get('/api/admin/permissions',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const permissions = await storage.getAllPermissions();
        
        // Group permissions by category
        const groupedPermissions = permissions.reduce((acc, permission) => {
          const category = permission.category || 'Other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push({
            id: permission.id,
            name: permission.permission_name,
            description: permission.description
          });
          return acc;
        }, {} as Record<string, any[]>);

        res.json(groupedPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
      }
    }
  );

  // Create new permission (Admin only)
  app.post('/api/admin/permissions',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const { permission_name, category, description } = req.body;

        if (!permission_name || !category) {
          return res.status(400).json({ 
            error: 'Permission name and category are required' 
          });
        }

        const newPermission = await storage.createPermission({
          permission_name,
          category,
          description: description || null
        });

        res.status(201).json(newPermission);
      } catch (error) {
        console.error('Error creating permission:', error);
        res.status(500).json({ error: 'Failed to create permission' });
      }
    }
  );

  // Bulk assign permissions to user (Admin only)
  app.post('/api/admin/users/:id/permissions',
    authenticateUser,
    requireAdmin,
    async (req, res) => {
      try {
        const userId = parseInt(req.params.id);
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
          return res.status(400).json({ 
            error: 'Permissions must be an array of permission IDs' 
          });
        }

        // Get user's role
        const user = await storage.getUserWithRole(userId);
        if (!user || !user.role_id) {
          return res.status(400).json({ 
            error: 'User must have a role assigned to manage permissions' 
          });
        }

        // Update role permissions (affects all users with this role)
        const currentPermissions = await storage.getRolePermissions(user.role_id);
        const currentPermissionIds = currentPermissions.map(p => p.permission_id);

        // Find permissions to add
        const toAdd = permissions.filter(id => !currentPermissionIds.includes(id));

        // Add new permissions to role
        for (const permissionId of toAdd) {
          await storage.assignPermissionToRole(user.role_id, permissionId);
        }

        // Get updated user permissions
        const updatedPermissions = await storage.getUserPermissions(userId);

        res.json({
          userId,
          permissions: updatedPermissions.map(p => ({
            id: p.id,
            name: p.permission_name,
            category: p.category
          }))
        });
      } catch (error) {
        console.error('Error updating user permissions:', error);
        res.status(500).json({ error: 'Failed to update user permissions' });
      }
    }
  );
}