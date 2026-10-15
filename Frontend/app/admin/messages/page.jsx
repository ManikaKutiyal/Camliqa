"use client";

import React, { useEffect, useState } from 'react';
import { Search, Mail, MessageSquare, Trash2, CheckCircle, Phone, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contact-messages');
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Failed to load messages');
      setMessages(payload.data || []);
    } catch (error) {
      console.error('Failed to fetch messages', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id, currentRead) => {
    try {
      const res = await fetch(`/api/contact-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !currentRead }),
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentRead } : m));
      }
    } catch (err) {
      console.error('Error updating message', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message permanently?')) return;
    try {
      const res = await fetch(`/api/contact-messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Error deleting message', err);
    }
  };

  const filteredMessages = messages
    .filter(m => {
      if (filter === 'unread') return !m.read;
      if (filter === 'read') return m.read;
      return true;
    })
    .filter(m =>
      m?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      m?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      m?.subject?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      m?.issue?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );

  const unreadCount = messages.filter(m => !m.read).length;

  const issueLabel = (issue) => {
    if (!issue) return null;
    const map = {
      'order-status': 'Order Status',
      'return-request': 'Return Request',
      'product-inquiry': 'Product Inquiry',
      'other': 'Other',
    };
    return map[issue] || issue;
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Messages', value: messages.length, color: 'text-primary' },
          { label: 'Unread', value: unreadCount, color: 'text-amber-600' },
          { label: 'Read', value: messages.length - unreadCount, color: 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-secondary/10 px-6 py-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-primary/40 mb-1">{stat.label}</p>
            <p className={`text-3xl font-serif font-light ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/30">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-secondary/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === f
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-white border border-secondary/10 text-primary/60 hover:bg-secondary/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-secondary/10 bg-secondary/5">
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Sender</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Issue</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Date</th>
              <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/10">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-5 w-36 bg-secondary/10 rounded-lg mb-1" /><div className="h-4 w-48 bg-secondary/5 rounded-lg" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-24 bg-secondary/10 rounded-lg" /></td>
                  <td className="px-6 py-4"><div className="h-5 w-20 bg-secondary/10 rounded-lg" /></td>
                  <td className="px-6 py-4"><div className="h-8 w-16 ml-auto bg-secondary/10 rounded-lg" /></td>
                </tr>
              ))
            ) : filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <tr
                    className={`hover:bg-secondary/5 transition-colors cursor-pointer ${!msg.read ? 'bg-amber-50/40' : ''}`}
                    onClick={() => {
                      setExpandedId(expandedId === msg.id ? null : msg.id);
                      // Auto-mark as read when expanded
                      if (!msg.read && expandedId !== msg.id) handleMarkAsRead(msg.id, false);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full font-medium text-xs ${!msg.read ? 'bg-amber-100 text-amber-700' : 'bg-secondary/10 text-secondary'}`}>
                          {(msg.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm text-primary ${!msg.read ? 'font-semibold' : ''}`}>{msg.name}</p>
                          <p className="text-xs text-primary/50 flex items-center gap-1 mt-0.5">
                            <Mail size={11} /> {msg.email}
                          </p>
                        </div>
                        {!msg.read && (
                          <span className="ml-2 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(msg.issue || msg.subject) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-secondary/10 text-secondary uppercase tracking-wider">
                          <Tag size={10} />
                          {issueLabel(msg.issue) || msg.subject}
                        </span>
                      ) : (
                        <span className="text-primary/30 text-xs italic">No subject</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary/60 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(msg.id, msg.read); }}
                          className={`p-2 rounded-lg transition-colors ${msg.read ? 'text-primary/30 hover:text-primary hover:bg-secondary/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={msg.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete message"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <AnimatePresence>
                    {expandedId === msg.id && (
                      <motion.tr
                        key={`expanded-${msg.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-secondary/5"
                      >
                        <td colSpan="4" className="px-6 py-6">
                          <div className="flex gap-4 max-w-3xl">
                            <MessageSquare className="text-secondary/50 mt-1 flex-shrink-0" size={20} />
                            <div className="flex-1 space-y-4">
                              {msg.phone && (
                                <p className="text-xs text-primary/60 flex items-center gap-2">
                                  <Phone size={12} className="text-primary/30" />
                                  {msg.phone}
                                </p>
                              )}
                              <div>
                                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-primary/40 mb-2">Message</h4>
                                <p className="text-sm text-primary/80 leading-relaxed whitespace-pre-wrap bg-white rounded-xl p-4 border border-secondary/10">
                                  {msg.message}
                                </p>
                              </div>
                              <div className="flex gap-3">
                                <a
                                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(issueLabel(msg.issue) || msg.subject || 'Your message')}`}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A3E] text-white text-xs font-semibold rounded-xl hover:bg-[#0f0f26] transition-colors"
                                >
                                  <Mail size={13} /> Reply via Email
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-primary/40">
                    <MessageSquare size={48} strokeWidth={1} />
                    <p className="text-sm font-medium">No messages found</p>
                    <p className="text-xs text-primary/30">Messages from the contact form will appear here</p>
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
