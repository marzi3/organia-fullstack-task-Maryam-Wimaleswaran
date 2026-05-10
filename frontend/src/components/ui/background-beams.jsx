"use client";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import React from "react";

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 flex h-full w-full items-center justify-center overflow-hidden bg-slate-950",
        className
      )}
    >
      <div className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="absolute inset-0 bg-slate-950 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      
      {/* Beam 1 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 0.4, scale: 1.5, rotate: -45 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/4 top-1/4 h-[80vh] w-[20vw] bg-gradient-to-r from-indigo-500/30 to-purple-500/0 blur-[100px]"
      />
      {/* Beam 2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 45 }}
        animate={{ opacity: 0.3, scale: 1.5, rotate: 45 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
        className="absolute right-1/4 top-1/4 h-[80vh] w-[20vw] bg-gradient-to-l from-cyan-500/30 to-blue-500/0 blur-[100px]"
      />
      {/* Beam 3 */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.2, y: -100 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="absolute bottom-0 left-1/2 h-[40vh] w-[40vw] -translate-x-1/2 bg-gradient-to-t from-indigo-500/40 to-transparent blur-[80px]"
      />
    </div>
  );
};
