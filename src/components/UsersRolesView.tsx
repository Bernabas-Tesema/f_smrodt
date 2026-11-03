import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types/smrod';
import {
  Users,
  Shield,
  Key,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  X
} from 'lucide-react';

interface UsersRolesViewProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onToggleUserActive: (userId: string) => void;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  users,
  onAddUser,
  onUpdateRole,
  onToggleUserActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('operations');
  const [dept, setDept] = useState('Operations Control');

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      supabaseUid: `uuid-${Date.now().toString().slice(-6)}-smrod-auth`,
      fullName: name,
      email: email,
      role: role,
      department: dept,
      isActive: true,
      twoFactorEnabled: true,
      lastLogin: 'Just registered'
    };

    onAddUser(newUser);
    setIsAddUserOpen(false);
    setName('');
    setEmail('');
  };

  const PERMISSION_MATRIX = [
    { permission: 'View Pilot Map & Live Telemetry', super_admin: true, admin: true, operations: true, support: true, viewer: true },
    { permission: 'Acknowledge & Triage Security Incidents', super_admin: true, admin: true, operations: true, support: true, viewer: false },
    { permission: 'Execute Remote Alarm & Diagnostic Ping', super_admin: true, admin: true, operations: true, support: false, viewer: false },
    { permission: 'Execute Remote Vehicle Immobilization', super_admin: true, admin: true, operations: false, support: false, viewer: false },
    { permission: 'Register & Edit Vehicles and ESP32 Units', super_admin: true, admin: true, operations: false, support: false, viewer: false },
    { permission: 'Configure Geofences & Speed Limits', super_admin: true, admin: true, operations: true, support: false, viewer: false },
    { permission: 'User & Role Administration (RBAC)', super_admin: true, admin: false, operations: false, support: false, viewer: false },
    { permission: 'Inspect Cryptographic Audit Logs', super_admin: true, admin: true, operations: false, support: false, viewer: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Identity &amp; Access Management (Supabase Auth + Django RBAC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            User Accounts &amp; Role Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supabase Auth handles identity tokens; Django backend independently enforces object-level RBAC rules on every API request.
          </p>
        </div>

        <button
          onClick={() => setIsAddUserOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision User Account</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, email or role..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          <div className="text-xs text-slate-500">
            Total Accounts: <strong className="text-slate-900 font-mono tabular-nums">{users.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Operator Name &amp; Email</th>
                <th className="py-3 px-4">Supabase Auth UUID</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">2FA Security</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {u.supabaseUid.slice(0, 18)}...
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateRole(u.id, e.target.value as UserRole)}
                      className="text-xs font-semibold uppercase bg-slate-100 text-slate-800 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="operations">Operations</option>
                      <option value="support">Support</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {u.department}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.twoFactorEnabled ? (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enforced (TOTP)</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium text-[11px] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Not Configured</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {u.lastLogin}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onToggleUserActive(u.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Granular Permissions Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Django RBAC Permission Matrix Specification
          </h2>
          <p className="text-xs text-slate-500">
            Permissions are checked server-side by Django on every protected REST endpoint (`HasRolePermission` / `DjangoModelPermissions`).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5">System Privilege / Action</th>
                <th className="py-2.5 text-center">Super Admin</th>
                <th className="py-2.5 text-center">Admin</th>
                <th className="py-2.5 text-center">Operations</th>
                <th className="py-2.5 text-center">Support</th>
                <th className="py-2.5 text-center">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSION_MATRIX.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 font-medium text-slate-800">{perm.permission}</td>
                  <td className="py-2.5 text-center">{perm.super_admin ? '✅' : '—'}</td>
                  <td className="py-2.5 text-center">{perm.admin ? '✅' : '—'}</td>
                  <td className="py-2.5 text-center">{perm.operations ? '✅' : '—'}</td>
                  <td className="py-2.5 text-center">{perm.support ? '✅' : '—'}</td>
                  <td className="py-2.5 text-center">{perm.viewer ? '✅' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Provision User &amp; Assign Role
              </h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Kibet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@smrod.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="super_admin">Super Admin (Full Platform Control)</option>
                  <option value="admin">Admin (Vehicle &amp; Device Manager)</option>
                  <option value="operations">Operations (Monitoring &amp; Incident Triage)</option>
                  <option value="support">Support (Hardware Diagnostician)</option>
                  <option value="viewer">Viewer (Read-Only Observer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Field Operations Center"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
