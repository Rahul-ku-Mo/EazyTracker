import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function NotFound() {

  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-100">
      <div className="w-full max-w-md p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-center">
            404
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-xl font-medium text-center">I am still working on this page.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className="text-center text-zinc-400">
            I am working hard at work to bring you something amazing!
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center"
        >
          <Link
            to={navigate(-1)}
            className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-emerald-800 text-zinc-100 hover:bg-emerald-800/90"
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Return to previous page
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
