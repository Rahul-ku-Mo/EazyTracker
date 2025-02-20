import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../apis/userApis";
import { Input } from "../../components/ui/input";
import { UserContext } from "../../context/UserContext";
import { motion } from "framer-motion";

interface FormState {
  name: string;
  phoneNumber: string;
  imageUrl: string;
}

const AccountForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { name = "", phoneNumber = "", imageUrl = "" } = user || {};

  const [formState, setFormState] = useState<FormState>({
    name,
    phoneNumber,
    imageUrl,
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
    >
      <h1 className="mb-1 text-2xl font-bold text-white">Account</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Manage your account settings and profile image.
      </p>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-6"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-200">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={formState.name}
            onChange={handleChange("name")}
            placeholder="John Doe"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            This is the name that will be displayed on your account and in
            emails.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="phoneNumber"
            className="text-sm font-medium text-zinc-200"
          >
            Phone Number
          </label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formState.phoneNumber}
            onChange={handleChange("phoneNumber")}
            placeholder="+xyz 98765 43210"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Its up to you to keep it private or public. Don't forget to add
            country code.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="imageUrl"
            className="text-sm font-medium text-zinc-200"
          >
            Profile Image URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={formState.imageUrl}
            onChange={handleChange("imageUrl")}
            placeholder="https://example.com/profile-image.jpg"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Enter the URL of your profile image. This image will be displayed on
            your profile.
          </p>
        </div>
      </form>
      <motion.div
        className="mt-6"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          onClick={handleSubmit}
          disabled={isEqual(formState, initialState)}
          className="px-4 py-2 text-sm font-medium text-white rounded-md bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </motion.div>
    </motion.div>
  );
};

export default AccountForm;
