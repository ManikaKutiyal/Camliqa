"use client";

import { motion } from "framer-motion";

export default function OrderStatsCard({ title, value, icon: Icon, bgColor, iconColor, borderColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${bgColor} ${borderColor} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-white shadow-sm ${iconColor} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Live Update
        </span>
      </div>
    </motion.div>
  );
}
