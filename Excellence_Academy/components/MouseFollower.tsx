"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MouseFollower() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 rounded-full bg-blue-500 pointer-events-none z-[9999]"
      animate={{
        x: position.x - 12,
        y: position.y - 12,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    />
  );
}