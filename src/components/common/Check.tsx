import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";

interface Props {
  isSelected: boolean;
  onToggleSelect: () => void;
}

export default function Checkbox({ isSelected, onToggleSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onToggleSelect}
      className="flex items-center gap-3"
    >
      {/* Checkbox box */}
      <motion.div
        className={`
          relative flex h-5 w-5 items-center justify-center
          rounded-md border-2
          ${
            isSelected
              ? "border-purple-500 bg-purple-500"
              : "border-gray-400 bg-white"
          }
        `}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: isSelected ? 1.1 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
      >
        <AnimatePresence>
          {isSelected && (
            <motion.span
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
            >
              <Check className="h-4 w-4 text-white" strokeWidth={3} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
