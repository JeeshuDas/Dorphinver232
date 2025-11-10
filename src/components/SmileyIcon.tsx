import { motion } from 'motion/react';

interface SmileyIconProps {
  className?: string;
  color?: string;
  animated?: boolean;
}

export function SmileyIcon({ className = "w-7 h-7", color = "#EAB308", animated = true }: SmileyIconProps) {
  return (
    <motion.svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={animated ? { scale: 0.5, rotate: -180 } : undefined}
      animate={animated ? { 
        scale: [0.5, 1.2, 1],
        rotate: [0, 10, -10, 0]
      } : undefined}
      transition={animated ? {
        type: "spring",
        stiffness: 300,
        damping: 15,
        duration: 0.6
      } : undefined}
    >
      {/* Outer Glow */}
      <motion.circle 
        cx="12" 
        cy="12" 
        r="11" 
        fill={color}
        opacity="0.2"
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { 
          scale: [0.8, 1.15, 1],
          opacity: [0, 0.3, 0.2]
        } : undefined}
        transition={animated ? {
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.5
        } : undefined}
      />
      
      {/* Circle */}
      <motion.circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, rotate: -90 } : undefined}
        animate={animated ? { pathLength: 1, rotate: 0 } : undefined}
        transition={animated ? {
          pathLength: { duration: 0.4, ease: "easeInOut" },
          rotate: { duration: 0.4, ease: "easeOut" }
        } : undefined}
        style={{ originX: '50%', originY: '50%' }}
      />
      
      {/* Left Eye - Closed/Squinting */}
      <motion.path 
        d="M7.5 9C7.5 9 8.5 10 10 10C11.5 10 12.5 9 12.5 9" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? {
          delay: 0.2,
          duration: 0.3,
          ease: "easeOut"
        } : undefined}
      />
      
      {/* Right Eye - Closed/Squinting */}
      <motion.path 
        d="M11.5 9C11.5 9 12.5 10 14 10C15.5 10 16.5 9 16.5 9" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? {
          delay: 0.25,
          duration: 0.3,
          ease: "easeOut"
        } : undefined}
      />
      
      {/* Wide Grinning Smile with Teeth */}
      <motion.path 
        d="M6.5 13.5C6.5 13.5 8.5 17 12 17C15.5 17 17.5 13.5 17.5 13.5" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? {
          delay: 0.3,
          duration: 0.35,
          ease: "easeOut"
        } : undefined}
      />
      
      {/* Teeth Line */}
      <motion.path 
        d="M8.5 15C8.5 15 9.5 15.5 12 15.5C14.5 15.5 15.5 15 15.5 15" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={animated ? {
          delay: 0.4,
          duration: 0.25,
          ease: "easeOut"
        } : undefined}
      />
    </motion.svg>
  );
}
