"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function EcoCounter() {
  const [co2Saved, setCo2Saved] = useState(12345);

  useEffect(() => {
    const interval = setInterval(() => {
      setCo2Saved((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-5xl md:text-6xl lg:text-7xl font-bold font-headline tracking-tighter text-primary">
      <motion.div
        key={co2Saved}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeOut", duration: 0.5 }}
      >
        {co2Saved.toLocaleString()}
      </motion.div>
    </div>
  );
}
