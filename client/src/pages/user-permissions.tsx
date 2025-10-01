import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Search, Edit, Trash2, Eye, X, Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

type Role = {
  id: number;
  role_name: string;
  description: string;
  is_admin: boolean;
};

type User = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  role_id: number | null;
  department: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

type Permission = {
  id: number;
  permission_name: string;
  category: string;
  description: string | null;
};

type RolePermission = {
  role_id: number;
  permission_id: number;
  permission: Permission;
};

export default function UserPermissions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<number[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Fetch all roles
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/roles");
      if (!res.ok) throw new Error("Failed to fetch roles");
      return res.json();
    },
  });

  // Fetch all permissions
  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/permissions");
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json();
    },
  });

  // Fetch role permissions when a user is selected for editing
  const { data: rolePermissions = [] } = useQuery<RolePermission[]>({
    queryKey: ["/api/roles", selectedUser?.role_id, "permissions"],
    queryFn: async () => {
      if (!selectedUser?.role_id) return [];
      const res = await apiRequest("GET", `/api/roles/${selectedUser.role_id}/permissions`);
      if (!res.ok) throw new Error("Failed to fetch role permissions");
      return res.json();
    },
    enabled: !!selectedUser?.role_id && showPermissionModal,
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/users/${userId}`);
      if (!res.ok) throw new Error("Failed to delete user");
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Assign permission to role mutation
  const assignPermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => {
      const res = await apiRequest("POST", `/api/roles/${roleId}/permissions/${permissionId}`);
      if (!res.ok) throw new Error("Failed to assign permission");
      return res.json();
    },
  });

  // Remove permission from role mutation
  const removePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: number; permissionId: number }) => {
      const res = await apiRequest("DELETE", `/api/roles/${roleId}/permissions/${permissionId}`);
      if (!res.ok) throw new Error("Failed to remove permission");
    },
  });

  const handleDeleteUser = (userId: number, userEmail: string) => {
    if (userEmail === "admin@jivo.com") {
      toast({
        title: "Cannot Delete Admin",
        description: "The admin user cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const handleEditPermissions = async (user: User) => {
    setSelectedUser(user);
    if (user.role_id) {
      setShowPermissionModal(true);
    } else {
      toast({
        title: "No Role Assigned",
        description: "This user doesn't have a role assigned. Please assign a role first.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePermission = async (permissionId: number) => {
    if (!selectedUser?.role_id) return;

    const hasPermission = rolePermissions.some(rp => rp.permission_id === permissionId);

    if (hasPermission) {
      await removePermissionMutation.mutateAsync({
        roleId: selectedUser.role_id,
        permissionId,
      });
    } else {
      await assignPermissionMutation.mutateAsync({
        roleId: selectedUser.role_id,
        permissionId,
      });
    }

    // Refetch role permissions
    queryClient.invalidateQueries({
      queryKey: ["/api/roles", selectedUser.role_id, "permissions"],
    });
  };

  const handleSavePermissions = () => {
    setShowPermissionModal(false);
    setSelectedUser(null);
    toast({
      title: "Permissions Updated",
      description: "Role permissions have been updated successfully.",
    });
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">User Permissions</h2>
            <p className="text-gray-600 mt-1">Manage user access and permissions</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Add User Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Users & Permissions</h3>
              <p className="text-sm text-gray-600 mt-1">Manage user access to different modules ({filteredUsers.length} users)</p>
            </div>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate("/create-users")}
            >
              <Shield size={18} />
              Create New User
            </Button>
          </div>

          {/* Users List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="text-primary" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {user.full_name || user.username}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            user.role?.toLowerCase() === "admin" ? "bg-purple-100 text-purple-800" :
                            user.role?.toLowerCase() === "manager" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {user.role || "No Role"}
                          </span>
                          {user.department && (
                            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {user.department}
                            </span>
                          )}
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                            user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUserDetails(user)}
                        className="flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPermissions(user)}
                        className="flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit Permissions
                      </Button>
                      {user.email !== "admin@jivo.com" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 size={16} />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No users found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <p className="text-sm text-gray-600 mt-1">Complete information about {selectedUser.full_name || selectedUser.username}</p>
              </div>
              <button
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* User Info */}
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="text-primary" size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-gray-900">{selectedUser.full_name || selectedUser.username}</h4>
                  <p className="text-gray-600 mt-1 flex items-center gap-2">
                    <Mail size={16} />
                    {selectedUser.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-block px-4 py-2 text-sm font-medium rounded-full ${
                      selectedUser.role?.toLowerCase() === "admin" ? "bg-purple-100 text-purple-800" :
                      selectedUser.role?.toLowerCase() === "manager" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {selectedUser.role || "No Role"}
                    </span>
                    {selectedUser.email === "admin@jivo.com" && (
                      <span className="inline-block px-4 py-2 text-sm font-medium rounded-full bg-red-100 text-red-800">
                        System Administrator
                      </span>
                    )}
                  </div>
                  {selectedUser.last_login && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last login: {new Date(selectedUser.last_login).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserDetailsModal(false);
                  handleEditPermissions(selectedUser);
                }}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Permissions
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserDetailsModal(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Permissions - {selectedUser.full_name || selectedUser.username}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage permissions for {selectedUser.role} role
              </p>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-3">
                {permissions.map((permission) => {
                  const isSelected = rolePermissions.some(rp => rp.permission_id === permission.id);
                  return (
                    <div
                      key={permission.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => handleTogglePermission(permission.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{permission.permission_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {permission.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePermissions}>
                Save Permissions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
