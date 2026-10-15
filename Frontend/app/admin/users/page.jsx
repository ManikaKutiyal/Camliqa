"use client";

import { useEffect, useState } from 'react';
import { Users, Search, Mail, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminGetCustomerProfiles } from '@/services/supabase/users';
import { createClient } from '@/lib/supabase/client';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await adminGetCustomerProfiles(supabase);
      if (error) throw error;

      const mappedUsers = (data || []).map(u => ({
        id: u.id,
        name: u.full_name || 'Unnamed User',
        email: u.email || 'No Email',
        ordersCount: u.orders?.length || 0,
        role: u.role,
        createdAt: u.created_at
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = (users || []).filter(u => 
    u?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    u?.email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-secondary/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-secondary/10 bg-secondary/5">
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">User</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Email</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Orders</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-6 w-32 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-48 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-12 bg-secondary/10 rounded-lg"></div></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 ml-auto bg-secondary/10 rounded-lg"></div></td>
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary/10 text-secondary font-medium text-xs">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-primary">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-primary/60">
                      <Mail size={14} className="text-primary/30" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-primary/60">
                      <ShoppingBag size={14} className="text-primary/30" />
                      {user.ordersCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-primary/40">
                    <Users size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">No users found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
