import { storage } from "./storage";
import "./seed-permissions";

const permissionsToSeed = [
  // Dashboard
  { permission_name: "view_dashboard", category: "dashboard", description: "Access to main dashboard and analytics" },

  // Platform PO
  { permission_name: "view_platform_po", category: "platform_po", description: "Can view platform purchase orders" },
  { permission_name: "create_platform_po", category: "platform_po", description: "Can create platform purchase orders" },
  { permission_name: "edit_platform_po", category: "platform_po", description: "Can edit platform purchase orders" },
  { permission_name: "delete_platform_po", category: "platform_po", description: "Can delete platform purchase orders" },
  { permission_name: "export_platform_po", category: "platform_po", description: "Can export platform purchase orders" },
  { permission_name: "upload_platform_po", category: "platform_po", description: "Can upload platform purchase orders" },

  // Swiggy POs
  { permission_name: "view_swiggy_pos", category: "swiggy", description: "Can view Swiggy purchase orders" },
  { permission_name: "import_swiggy_pos", category: "swiggy", description: "Can import Swiggy purchase orders" },

  // Distributor PO
  { permission_name: "view_distributor_po", category: "distributor_po", description: "Can view distributor purchase orders" },
  { permission_name: "create_distributor_po", category: "distributor_po", description: "Can create distributor purchase orders" },
  { permission_name: "edit_distributor_po", category: "distributor_po", description: "Can edit distributor purchase orders" },
  { permission_name: "delete_distributor_po", category: "distributor_po", description: "Can delete distributor purchase orders" },

  // Secondary Sales
  { permission_name: "view_secondary_sales", category: "secondary_sales", description: "Can view secondary sales data" },
  { permission_name: "upload_secondary_sales", category: "secondary_sales", description: "Can upload secondary sales data from platforms" },
  { permission_name: "edit_secondary_sales", category: "secondary_sales", description: "Can edit secondary sales data" },
  { permission_name: "delete_secondary_sales", category: "secondary_sales", description: "Can delete secondary sales data" },

  // Inventory
  { permission_name: "view_inventory", category: "inventory", description: "Can view inventory data" },
  { permission_name: "upload_inventory", category: "inventory", description: "Can upload inventory data from platforms" },
  { permission_name: "edit_inventory", category: "inventory", description: "Can edit inventory data" },
  { permission_name: "delete_inventory", category: "inventory", description: "Can delete inventory data" },

  // Platform Items
  { permission_name: "view_pf_items", category: "pf_items", description: "Can view platform items" },
  { permission_name: "create_pf_item", category: "pf_items", description: "Can create new platform items" },
  { permission_name: "edit_pf_item", category: "pf_items", description: "Can edit platform items" },
  { permission_name: "delete_pf_item", category: "pf_items", description: "Can delete platform items" },

  // SAP Sync
  { permission_name: "view_sap_sync", category: "sap", description: "Can view SAP sync data" },
  { permission_name: "execute_sap_sync", category: "sap", description: "Can sync item master data from SAP B1 Hanna ERP" },

  // SQL Query
  { permission_name: "view_sql_query", category: "sql", description: "Can view SQL query interface" },
  { permission_name: "execute_sql_query", category: "sql", description: "Can execute custom SQL queries and generate reports" },

  // User Management (Admin only)
  { permission_name: "view_users", category: "user_management", description: "Can view user list" },
  { permission_name: "create_users", category: "user_management", description: "Can create new users" },
  { permission_name: "edit_users", category: "user_management", description: "Can edit user details" },
  { permission_name: "delete_users", category: "user_management", description: "Can delete users" },
  { permission_name: "manage_permissions", category: "user_management", description: "Can manage user permissions (Admin only)" },
];

const rolesToSeed = [
  { role_name: "Admin", description: "Full system access with all permissions", is_admin: true },
  { role_name: "Manager", description: "Manager with elevated permissions", is_admin: false },
  { role_name: "User", description: "Standard user with basic permissions", is_admin: false },
  { role_name: "Viewer", description: "Read-only access to view data", is_admin: false },
];

export async function seedPermissions() {
  try {
    console.log("🌱 Starting permissions seed...");

    // Seed roles
    console.log("Creating roles...");
    const createdRoles = [];
    for (const role of rolesToSeed) {
      try {
        const existingRoles = await storage.getAllRoles();
        const roleExists = existingRoles.find(r => r.role_name === role.role_name);

        if (!roleExists) {
          const createdRole = await storage.createRole(role);
          createdRoles.push(createdRole);
          console.log(`✅ Created role: ${role.role_name}`);
        } else {
          createdRoles.push(roleExists);
          console.log(`ℹ️  Role already exists: ${role.role_name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating role ${role.role_name}:`, error);
      }
    }

    // Seed permissions
    console.log("\nCreating permissions...");
    const createdPermissions = [];
    for (const permission of permissionsToSeed) {
      try {
        const existingPermissions = await storage.getAllPermissions();
        const permissionExists = existingPermissions.find(p => p.permission_name === permission.permission_name);

        if (!permissionExists) {
          const createdPermission = await storage.createPermission(permission);
          createdPermissions.push(createdPermission);
          console.log(`✅ Created permission: ${permission.permission_name}`);
        } else {
          createdPermissions.push(permissionExists);
          console.log(`ℹ️  Permission already exists: ${permission.permission_name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating permission ${permission.permission_name}:`, error);
      }
    }

    // Assign all permissions to Admin role
    console.log("\nAssigning permissions to Admin role...");
    const adminRole = createdRoles.find(r => r.role_name === "Admin");
    if (adminRole) {
      for (const permission of createdPermissions) {
        try {
          const rolePerms = await storage.getRolePermissions(adminRole.id);
          const hasPermission = rolePerms.some(rp => rp.permission_id === permission.id);

          if (!hasPermission) {
            await storage.assignPermissionToRole(adminRole.id, permission.id);
            console.log(`✅ Assigned ${permission.permission_name} to Admin`);
          }
        } catch (error) {
          // Permission might already be assigned, ignore
        }
      }
    }

    // Assign basic permissions to User role
    console.log("\nAssigning basic permissions to User role...");
    const userRole = createdRoles.find(r => r.role_name === "User");
    const basicPermissions = [
      "view_dashboard",
      "view_platform_po",
      "view_distributor_po",
      "view_secondary_sales",
      "view_inventory",
      "view_pf_items",
    ];

    if (userRole) {
      for (const permName of basicPermissions) {
        const permission = createdPermissions.find(p => p.permission_name === permName);
        if (permission) {
          try {
            const rolePerms = await storage.getRolePermissions(userRole.id);
            const hasPermission = rolePerms.some(rp => rp.permission_id === permission.id);

            if (!hasPermission) {
              await storage.assignPermissionToRole(userRole.id, permission.id);
              console.log(`✅ Assigned ${permName} to User`);
            }
          } catch (error) {
            // Permission might already be assigned, ignore
          }
        }
      }
    }

    // Assign view-only permissions to Viewer role
    console.log("\nAssigning view permissions to Viewer role...");
    const viewerRole = createdRoles.find(r => r.role_name === "Viewer");
    const viewPermissions = [
      "view_dashboard",
      "view_platform_po",
      "view_distributor_po",
      "view_secondary_sales",
      "view_inventory",
      "view_pf_items",
      "view_sap_sync",
      "view_sql_query",
    ];

    if (viewerRole) {
      for (const permName of viewPermissions) {
        const permission = createdPermissions.find(p => p.permission_name === permName);
        if (permission) {
          try {
            const rolePerms = await storage.getRolePermissions(viewerRole.id);
            const hasPermission = rolePerms.some(rp => rp.permission_id === permission.id);

            if (!hasPermission) {
              await storage.assignPermissionToRole(viewerRole.id, permission.id);
              console.log(`✅ Assigned ${permName} to Viewer`);
            }
          } catch (error) {
            // Permission might already be assigned, ignore
          }
        }
      }
    }

    // Update users with legacy role field to use role_id
    console.log("\nUpdating users with role_id...");
    const allUsers = await storage.getAllUsers();
    for (const user of allUsers) {
      if (user.role && !user.role_id) {
        const matchingRole = createdRoles.find(r =>
          r.role_name.toLowerCase() === user.role.toLowerCase()
        );
        if (matchingRole) {
          await storage.assignRoleToUser(user.id, matchingRole.id);
          console.log(`✅ Assigned role_id ${matchingRole.id} (${matchingRole.role_name}) to user ${user.username}`);
        }
      }
    }

    console.log("\n✅ Permissions seed completed successfully!");
    console.log(`Created ${createdRoles.length} roles and ${createdPermissions.length} permissions`);

  } catch (error) {
    console.error("❌ Error seeding permissions:", error);
    throw error;
  }
}
