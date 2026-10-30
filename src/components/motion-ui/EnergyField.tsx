import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import trail from "@/assets/trail-runner.jpg";

/** Cinematic trail-runner backdrop: slow forward push with subtle pointer parallax. */
export function EnergyField() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 20 });
  const sy = useSpring(py, { stiffness: 40, damping: 20 });
  const x = useTransform(sx, (v) => v * -14);
  const y = useTransform(sy, (v) => v * -8);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute -inset-6" style={{ x, y }}>
        <motion.img
          src={trail}
          alt=""
          width={1920}
          height={1088}
          className="h-full w-full object-cover object-[70%_center]"
          initial={{ scale: 1.08 }}
          animate={reduce ? { scale: 1.04 } : { scale: [1.04, 1.12] }}
          transition={reduce ? { duration: 0 } : { duration: 30, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,color-mix(in_oklab,var(--background)_70%,transparent)_40%,transparent_75%)]" />
    </div>
  );
}
