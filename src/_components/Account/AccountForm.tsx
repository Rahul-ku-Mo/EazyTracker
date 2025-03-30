import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { Input } from "@/components/ui/input";
import { UserContext } from "@/context/UserContext";
import { motion } from "framer-motion";

interface FormState {
  name?: string;
  phoneNumber?: string;
  imageUrl?: string;
  username?: string;
  email: string;
}

const AccountForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { name = "", phoneNumber = "", imageUrl = "", username = "", email = "" } = user || {};

  const [formState, setFormState] = useState<FormState>({
    name,
    phoneNumber,
    imageUrl,
    username,
    email,
  });

  const [initialState, setInitialState] = useState<FormState>(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [formState, user]);

  const handleChange =
    (prop: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState({ ...formState, [prop]: event.target.value });
    };

  const updateProfileMutation = useMutation({
    mutationFn: (data: FormState) => updateUserProfile(accessToken, data),
    onSuccess: () => {
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update account");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEqual(formState, initialState)) {
      toast.info("No changes to save");
      return;
    }
    updateProfileMutation.mutate(formState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-transparent rounded-lg p-6 shadow-sm dark:shadow-none"
    >
      <h1 className="text-lg font-bold text-gray-800 dark:text-white">Account Settings</h1>
      <p className="text-sm text-gray-600 dark:text-zinc-400">
        Manage your account settings and profile image.
      </p>
      <div className="shrink-0 bg-gray-200 dark:bg-zinc-700 h-[1px] w-full my-6"></div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={formState.name || ""}
            onChange={handleChange("name")}
            placeholder="John Doe"
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            This is the name that will be displayed on your account and in emails.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-gray-700 dark:text-zinc-200"
          >
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formState.phoneNumber || ""}
            onChange={handleChange("phoneNumber")}
            placeholder="+xyz 98765 43210"
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            It's up to you to keep it private or public. Don't forget to add country code.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="imageUrl"
            className="text-sm font-medium text-gray-700 dark:text-zinc-200"
          >
            Profile Image URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={formState.imageUrl || ""}
            onChange={handleChange("imageUrl")}
            placeholder="https://example.com/profile-image.jpg"
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Enter the URL of your profile image. This image will be displayed on your profile.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={formState.username || ""}
            onChange={handleChange("username")}
            placeholder="test-k-m"
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            This is your unique username. It can be a combination of name or a pseudonym. You can change it whenever you want.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formState.email || ""}
            onChange={handleChange("email")}
            placeholder="email@example.com"
            readOnly
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/50 text-gray-500 dark:text-zinc-400"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            You cannot change your email since it's unique.
          </p>
        </div>
      </form>
      
      <motion.div
        className="mt-8"
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={handleSubmit}
          disabled={isEqual(formState, initialState) || updateProfileMutation.isPending}
          className="px-5 py-2.5 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AccountForm;
