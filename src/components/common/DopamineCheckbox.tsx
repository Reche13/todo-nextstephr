"use client";

import { motion } from "motion/react";
import confetti from "canvas-confetti";

type Props = {
  checked: boolean;
  onToggle: () => void;
};

export default function DopamineCheckbox({ checked, onToggle }: Props) {
  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (checked) {
      onToggle();
    } else {
      try {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        await confetti({
          origin: {
            x: x / window.innerWidth,
            y: y / window.innerHeight,
          },
        });
        onToggle();
      } catch (error) {
        console.error("Confetti button error:", error);
      }
    }
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={handleToggle}
        className={`
          relative z-20 flex h-5 w-5 items-center justify-center cursor-pointer
          rounded-md border-2
          ${
            checked
              ? "border-emerald-500 bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.35)]"
              : "border-gray-400 bg-white"
          }
        `}
        whileTap={{ scale: 0.85 }}
        animate={{
          scale: checked ? [1, 1.15, 1] : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 18,
        }}
      >
        {checked && (
          <motion.svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.25 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </motion.button>
    </div>
  );
}
