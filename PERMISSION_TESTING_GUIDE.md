# Permission System Testing Guide

## How Permissions Work

1. **Permissions are assigned to ROLES, not users directly**
   - Each user has a role (Admin, User, Viewer, Manager)
   - When you edit permissions for a user, you're editing permissions for their ROLE
   - All users with the same role will have the same permissions

2. **Users inherit permissions from their role**
   - If a user has role "Viewer", they get all permissions assigned to the Viewer role
   - If you add a permission to the Viewer role, ALL users with Viewer role get that permission

3. **Changes require logout/login to take effect**
   - Permissions are loaded when the user logs in
   - After changing permissions, the user must logout and login again to see changes

## Step-by-Step Testing

### Test 1: Create a New User

1. **Login as Admin**
   ```
   Username: admin
   Password: [your admin password]
   ```

2. **Go to "Create Users" page**

3. **Create a test user:**
   ```
   Username: testuser
   Email: test@example.com
   Password: password123
   Full Name: Test User
   Department: E-Com
   Role: User  ← IMPORTANT: Select "User" role
   ```

4. **Click "Create User"**
   - Watch server console for:
     ```
     ✅ Matched role "user" to role_id: 3
     Creating user: testuser with role_id: 3
     User created successfully: 5 testuser role_id: 3
     ```

### Test 2: Check Default Permissions

5. **Logout from admin**

6. **Login as testuser**
   ```
   Username: testuser
   Password: password123
   ```

7. **You should see 6 menu items by default:**
   - Dashboard
   - Platform PO (view only)
   - Distributor PO (view only)
   - Secondary Sales (view only)
   - Inventory (view only)
   - Create PF Item

8. **You should NOT see:**
   - SAP Sync
   - SQL Query
   - User Permissions (admin only)
   - Create Users (admin only)

### Test 3: Add Permissions to User Role

9. **Logout from testuser**

10. **Login as admin**

11. **Go to "User Permissions" page**

12. **Find testuser → Click "Edit Permissions"**

13. **Toggle ON these permissions:**
    - upload_secondary_sales
    - upload_inventory
    - view_sap_sync
    - view_sql_query

14. **Click "Save Permissions"**
    - Watch server console for:
      ```
      🔐 Assigning permission 15 to role 3
         Role: User, Permission: upload_secondary_sales
      ✅ Successfully assigned permission to role
      ```

### Test 4: Verify New Permissions

15. **Logout from admin**

16. **Login as testuser again**

17. **You should NOW see 8 menu items:**
    - Dashboard
    - Platform PO
    - Distributor PO
    - Secondary Sales
    - Inventory
    - Create PF Item
    - SAP Sync ← NEW
    - SQL Query ← NEW

18. **Try accessing these pages** - they should work!

## Troubleshooting

### Issue: User sees blank page or no menu items

**Solution:**
1. Check if user has `role_id` set:
   ```sql
   SELECT id, username, role, role_id FROM users WHERE username = 'testuser';
   ```

2. If `role_id` is NULL, restart the server (it will auto-fix)

3. User must logout and login again

### Issue: Permission changes don't appear

**Reason:** Permissions are cached in the user session

**Solution:**
1. User must logout
2. User must login again
3. Permissions will be freshly loaded from database

### Issue: "Role not found" error

**Solution:**
1. Make sure roles exist in database:
   ```sql
   SELECT * FROM roles;
   ```

2. If no roles, restart server (it will seed them)

### Issue: All menu items are hidden

**Solution:**
1. Check user's role has permissions:
   ```sql
   SELECT r.role_name, p.permission_name
   FROM role_permissions rp
   JOIN roles r ON r.id = rp.role_id
   JOIN permissions p ON p.id = rp.permission_id
   WHERE r.role_name = 'User';
   ```

2. If no permissions, restart server to reseed

## Important Notes

1. **Admin users always see everything** - they bypass permission checks

2. **Viewer role** gets read-only access by default:
   - view_dashboard
   - view_platform_po
   - view_distributor_po
   - view_secondary_sales
   - view_inventory
   - view_pf_items
   - view_sap_sync
   - view_sql_query

3. **User role** gets basic access by default:
   - view_dashboard
   - view_platform_po
   - view_distributor_po
   - view_secondary_sales
   - view_inventory
   - view_pf_items

4. **Changes to role permissions affect ALL users with that role**

5. **Always logout/login after permission changes!**

## Server Console Logs to Watch

When things are working correctly, you should see:

**On Server Start:**
```
🌱 Starting permissions seed...
✅ Created role: Admin
✅ Created permission: view_dashboard
✅ Assigned view_dashboard to Admin
✅ Assigned role_id 3 (User) to user testuser
✅ Permissions seed completed successfully!
```

**On User Creation:**
```
✅ Matched role "user" to role_id: 3
Creating user: testuser with role_id: 3
User created successfully: 5 testuser role_id: 3
```

**On Login:**
```
🔐 Login attempt for username: testuser
✅ User found: testuser ID: 5
🔑 Checking password... (hash exists: true )
🔑 Password valid: true
✅ Login successful for user: testuser
```

**On Permission Assignment:**
```
🔐 Assigning permission 15 to role 3
   Role: User, Permission: upload_secondary_sales
✅ Successfully assigned permission to role
```

**On Permission Removal:**
```
🗑️  Removing permission 15 from role 3
   Role: User, Permission: upload_secondary_sales
✅ Successfully removed permission from role
```

## Quick Reference: Permission Names

- `view_dashboard` - Access dashboard
- `view_platform_po` - View platform purchase orders
- `create_platform_po` - Create platform purchase orders
- `edit_platform_po` - Edit platform purchase orders
- `delete_platform_po` - Delete platform purchase orders
- `upload_platform_po` - Upload platform purchase orders
- `view_distributor_po` - View distributor purchase orders
- `create_distributor_po` - Create distributor purchase orders
- `view_secondary_sales` - View secondary sales
- `upload_secondary_sales` - Upload secondary sales
- `view_inventory` - View inventory
- `upload_inventory` - Upload inventory
- `create_pf_item` - Create platform items
- `view_sap_sync` - View SAP sync
- `execute_sap_sync` - Execute SAP sync
- `view_sql_query` - View SQL query interface
- `execute_sql_query` - Execute SQL queries
- `manage_permissions` - Manage user permissions (Admin only)
- `create_users` - Create new users (Admin only)
