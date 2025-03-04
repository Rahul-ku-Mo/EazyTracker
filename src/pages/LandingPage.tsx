import { motion, useScroll, useTransform } from "framer-motion";
import {
  BarChart2,
  Clock,
  Users,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import FormPage from "./formPage";

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Split description into bullet points
  const bulletPoints = description.split(".").filter((point) => point.trim());

  return (
    <motion.div
      className={cn(
        "p-8 transition-all duration-300 border rounded-xl ",
        isDark
          ? "bg-zinc-900/80 border-zinc-800 hover:border-emerald-500/50"
          : "bg-white/80 border-zinc-200 hover:border-emerald-500/50"
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0, delay }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{
        boxShadow: isDark
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Icon className="w-12 h-12 mb-4 text-emerald-500" />
      <h3
        className={cn(
          "mb-2 text-xl font-semibold gt-walsheim-font",
          isDark ? "text-zinc-100" : "text-zinc-900"
        )}
      >
        {title}
      </h3>
      <ul className="space-y-1">
        {bulletPoints.map((point, index) => (
          <li
            key={index}
            className={cn(
              isDark ? "text-zinc-400" : "text-zinc-600",
              " text-sm font-semibold flex items-start gap-2"
            )}
          >
            <span className="text-emerald-500">•</span>
            {point.trim()}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};


interface TextGradientProps {
  children: React.ReactNode;
  className?: string;
}

export const TextGradient = ({ children, className }: TextGradientProps) => (
  <span
    className={cn(
      "text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-300 ",
      className
    )}
  >
    {children}
  </span>
);

const BackgroundGradient = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="absolute inset-0 max-w-full mx-auto h-screen blur-[120px] opacity-20"
      style={{
        background: isDark
          ? "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)"
          : "radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)",
      }}
    />
  );
};


interface HeroImageProps {
  className?: string;
}

const HeroImage = ({ className }: HeroImageProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);

  return (
    <motion.div
      ref={ref}
      style={{ y, scale, opacity }}
      className={cn(
        "relative mx-auto mt-16 overflow-hidden rounded-xl border shadow-2xl",
        isDark ? "border-zinc-800" : "border-zinc-200",
        className
      )}
    >
      <img
        src={isDark ? "/dashboard-dark.png" : "/dashboard-light.png"}
        alt="EazyTrack Dashboard"
        className="w-full h-auto"
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-gradient-to-t from-black/40 to-transparent"
            : "bg-gradient-to-t from-white/40 to-transparent"
        )}
      />
    </motion.div>
  );
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden",
        isDark ? "bg-black text-zinc-100" : "bg-zinc-50 text-zinc-900"
      )}
    >
      <BackgroundGradient />
      <div className="relative z-10 px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between mb-16">
          <div className="text-2xl font-bold tracking-tight">
            <TextGradient className="gt-walsheim-font">EzTrack</TextGradient>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="gap-1 text-sm font-semibold tracking-tight rounded-full inter-variable-font"
            >
              {isDark ? "Light" : "Dark"} Mode
            </Button>
            <Link to="/auth">
              <Button
                variant="default"
                size="sm"
                className="text-sm font-semibold tracking-tight rounded-full inter-variable-font"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </nav>

        <main>
          <section className="flex flex-col gap-6 mb-16 text-center">
            <div className="flex flex-col gap-2.5 text-center">
              <motion.h1
                className="max-w-2xl pt-16 mx-auto text-5xl font-semibold leading-tight tracking-tight dark:text-white sm:text-8xl gt-walsheim-font"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                Just Track it with <TextGradient>EzTrack</TextGradient>
              </motion.h1>
              <motion.p
                className={cn(
                  "max-w-2xl mx-auto font-semibold inter-variable-font text-[22px] tracking-tight",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Track tasks easily. Stay organized. No fuss.
              </motion.p>
            </div>
            <motion.div
              className="flex flex-wrap items-center justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Button
                variant="default"
                className="h-8 px-3.5 py-2.5 text-base tracking-tight font-bold rounded-full"
              >
                Start for free
              </Button>
              <Button
                variant="secondary"
                className="h-8 px-3.5 py-2.5 text-base tracking-tight font-bold rounded-full"
              >
                Watch Demo
              </Button>
            </motion.div>
          </section>

          <HeroImage />

          <section className="flex flex-col gap-16 pt-48 pb-24 " id="features">
            <div className="flex flex-col gap-2.5 items-center justify-center text-center">
              <motion.h2
                className={cn(
                  "text-3xl font-bold sm:text-5xl gt-walsheim-font max-w-xl break-words",
                  isDark ? "text-zinc-100" : "text-zinc-900"
                )}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <TextGradient>Boost productivity</TextGradient> with powerful AI
                assistance
              </motion.h2>
              <motion.p
                className={cn(
                  "max-w-xl font-semibold inter-variable-font text-[22px] tracking-tight",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                Yeah, we're not kidding.
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 gap-8 mb-16 md:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <FeatureCard
                icon={BarChart2}
                title="Advanced Analytics"
                description="Gain insights into work patterns. Powerful analytics tools. Track team performance metrics."
                delay={0.1}
              />
              <FeatureCard
                icon={Users}
                title="Collaboration (Fast)"
                description="Work together effortlessly. Real-time updates. Intuitive sharing features."
                delay={0.2}
              />
              <FeatureCard
                icon={Clock}
                title="Time Management"
                description="Optimize your productivity. Intelligent time tracking. Smart task prioritization."
                delay={0.3}
              />
              <FeatureCard
                icon={Sparkles}
                title="AI-Powered Insights"
                description="AI work pattern analysis. Smart productivity suggestions. Automated improvements."
                delay={0.4}
              />
            </motion.div>
          </section>

         

          <section className="flex flex-col items-center gap-16 pb-24 mx-auto">
            <motion.div
              className="break-words flex flex-col gap-2.5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2
                className={cn(
                  "text-3xl font-bold sm:text-5xl gt-walsheim-font text-center",
                  isDark ? "text-zinc-100" : "text-zinc-900"
                )}
              >
                <TextGradient>Everything </TextGradient>you need to know
              </h2>
              <motion.p
                className={cn(
                  "max-w-xl font-semibold inter-variable-font text-[22px] tracking-tight text-center",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                Our platform combines powerful features with an intuitive
                interface, making it easy for teams of any size to collaborate
                effectively.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description:
                    "All your data is secured. We won't be looking what you saving.",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description:
                    "Optimized performance ensures a smooth experience even with large projects.",
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description:
                    "Real-time updates and seamless sharing make teamwork effortless.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={cn(
                    "p-6 text-center rounded-xl",
                    isDark
                      ? "bg-zinc-900/50"
                      : "bg-white/50 border border-zinc-200"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <feature.icon className="w-10 h-10 mx-auto mb-4 text-emerald-500" />
                  <h3
                    className={cn(
                      "mb-2 text-xl font-semibold gt-walsheim-font",
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    )}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      isDark ? "text-zinc-400" : "text-zinc-600",
                      "inter-variable-font font-semibold tracking-tight text-sm"
                    )}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center gap-6 text-center">
            <motion.div
              className="flex flex-col gap-2.5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2
                className={cn(
                  "text-3xl font-bold sm:text-5xl gt-walsheim-font",
                  isDark ? "text-zinc-100" : "text-zinc-900"
                )}
              >
                Its Currently on <TextGradient>Development</TextGradient>
              </h2>
              <p
                className={cn(
                  "max-w-xl mx-auto text-xl inter-variable-font font-semibold tracking-tight",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                Join or Collabrate with me to add insanely awesome features.
              </p>
            </motion.div>
            <Button
              variant="default"
              className="px-3.5 py-2.5 rounded-full text-lg inter-variable-font w-fit font-semibold tracking-tight"
              onClick={() => setIsFormOpen(true)}
            >
              Contact Me
            </Button>
          </section>
        </main>

        <footer
          className={cn(
            "py-12 mt-24 border-t",
            isDark ? "border-zinc-800" : "border-zinc-200"
          )}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex-1 flex flex-col gap-2.5 w-full text-center md:text-left">
              <div className="text-2xl font-bold tracking-tight gt-walsheim-font">
                <TextGradient>EzTrack</TextGradient>
              </div>
              <p
                className={cn(
                  "font-semibold  max-w-xs mx-auto md:mx-0",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}
              >
                The complete solution for work management and team
                collaboration.
              </p>
            </div>

            <div className="w-full text-center md:text-right">
              <h3
                className={cn(
                  "mb-4 text-sm font-semibold uppercase gt-walsheim-font",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}
              >
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className={cn(
                      "hover:text-emerald-500 transition-colors inter-variable-font",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className={cn(
              "flex justify-center pt-8 mt-8 border-t",
              isDark ? "border-zinc-800" : "border-zinc-200"
            )}
          >
            <p
              className={cn(
                "text-sm inter-variable-font",
                isDark ? "text-zinc-500" : "text-zinc-600"
              )}
            >
              © {new Date().getFullYear()} EzTrack. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <FormPage isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
