import { storage } from './storage';

export async function setupRBACData() {
  try {
    console.log('Setting up RBAC data...');

    // Create basic permissions
    const permissions = [
      { permission_name: 'view_dashboard', category: 'Dashboard', description: 'View dashboard' },
      { permission_name: 'manage_platform_po', category: 'Platform PO', description: 'Create and manage platform purchase orders' },
      { permission_name: 'view_platform_po', category: 'Platform PO', description: 'View platform purchase orders' },
      { permission_name: 'manage_distributor_po', category: 'Distributor PO', description: 'Create and manage distributor purchase orders' },
      { permission_name: 'view_distributor_po', category: 'Distributor PO', description: 'View distributor purchase orders' },
      { permission_name: 'upload_secondary_sales', category: 'Secondary Sales', description: 'Upload secondary sales data' },
      { permission_name: 'view_secondary_sales', category: 'Secondary Sales', description: 'View secondary sales data' },
      { permission_name: 'upload_inventory', category: 'Inventory', description: 'Upload inventory data' },
      { permission_name: 'view_inventory', category: 'Inventory', description: 'View inventory data' },
      { permission_name: 'create_pf_items', category: 'Platform Items', description: 'Create platform items' },
      { permission_name: 'view_pf_items', category: 'Platform Items', description: 'View platform items' },
      { permission_name: 'sap_sync', category: 'System', description: 'Sync data with SAP system' },
      { permission_name: 'sql_query', category: 'System', description: 'Execute SQL queries' },
      { permission_name: 'manage_users', category: 'User Management', description: 'Create, edit, and delete users' },
      { permission_name: 'manage_roles', category: 'User Management', description: 'Create and manage roles' },
      { permission_name: 'view_users', category: 'User Management', description: 'View user information' },
    ];

    const createdPermissions = [];
    for (const permission of permissions) {
      try {
        const created = await storage.createPermission(permission);
        createdPermissions.push(created);
        console.log(`Created permission: ${permission.permission_name}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate key')) {
          console.log(`Permission ${permission.permission_name} already exists`);
        } else {
          console.error(`Error creating permission ${permission.permission_name}:`, error);
        }
      }
    }

    // Create basic roles
    const roles = [
      { role_name: 'Admin', is_admin: true },
      { role_name: 'Manager', is_admin: false },
      { role_name: 'Operator', is_admin: false },
      { role_name: 'Viewer', is_admin: false }
    ];

    const createdRoles = [];
    for (const role of roles) {
      try {
        const created = await storage.createRole(role);
        createdRoles.push(created);
        console.log(`Created role: ${role.role_name}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate key')) {
          console.log(`Role ${role.role_name} already exists`);
        } else {
          console.error(`Error creating role ${role.role_name}:`, error);
        }
      }
    }

    // Get all permissions and roles for assignment
    const allPermissions = await storage.getAllPermissions();
    const allRoles = await storage.getAllRoles();

    // Assign permissions to roles
    const adminRole = allRoles.find(r => r.role_name === 'Admin');
    const managerRole = allRoles.find(r => r.role_name === 'Manager');
    const operatorRole = allRoles.find(r => r.role_name === 'Operator');
    const viewerRole = allRoles.find(r => r.role_name === 'Viewer');

    if (adminRole) {
      // Admin gets all permissions
      for (const permission of allPermissions) {
        try {
          await storage.assignPermissionToRole(adminRole.id, permission.id);
        } catch (error: any) {
          if (!error.message?.includes('duplicate key')) {
            console.error(`Error assigning permission to Admin:`, error);
          }
        }
      }
      console.log('Assigned all permissions to Admin role');
    }

    if (managerRole) {
      // Manager gets most permissions except user management and system operations
      const managerPermissions = allPermissions.filter(p => 
        !['manage_users', 'manage_roles', 'sap_sync', 'sql_query'].includes(p.permission_name)
      );
      for (const permission of managerPermissions) {
        try {
          await storage.assignPermissionToRole(managerRole.id, permission.id);
        } catch (error: any) {
          if (!error.message?.includes('duplicate key')) {
            console.error(`Error assigning permission to Manager:`, error);
          }
        }
      }
      console.log('Assigned permissions to Manager role');
    }

    if (operatorRole) {
      // Operator gets basic operational permissions
      const operatorPermissions = allPermissions.filter(p => 
        ['view_dashboard', 'manage_platform_po', 'view_platform_po', 'upload_secondary_sales', 'view_secondary_sales', 'upload_inventory', 'view_inventory'].includes(p.permission_name)
      );
      for (const permission of operatorPermissions) {
        try {
          await storage.assignPermissionToRole(operatorRole.id, permission.id);
        } catch (error: any) {
          if (!error.message?.includes('duplicate key')) {
            console.error(`Error assigning permission to Operator:`, error);
          }
        }
      }
      console.log('Assigned permissions to Operator role');
    }

    if (viewerRole) {
      // Viewer gets only view permissions
      const viewerPermissions = allPermissions.filter(p => p.permission_name.startsWith('view_'));
      for (const permission of viewerPermissions) {
        try {
          await storage.assignPermissionToRole(viewerRole.id, permission.id);
        } catch (error: any) {
          if (!error.message?.includes('duplicate key')) {
            console.error(`Error assigning permission to Viewer:`, error);
          }
        }
      }
      console.log('Assigned permissions to Viewer role');
    }

    console.log('RBAC setup completed successfully');
    return { success: true, message: 'RBAC data setup completed' };
  } catch (error) {
    console.error('Error setting up RBAC data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}