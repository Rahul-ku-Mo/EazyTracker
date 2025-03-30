import isEqual from "lodash.isequal";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { UserContext } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface LocationFormState {
  state: string;
  address: string;
  zipCode: string;
}

const LocationForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { state = "", address = "", zipCode = "" } = user || {};

  const [formState, setFormState] = useState<LocationFormState>({
    state,
    address,
    zipCode,
  });

  const handleChange = (prop: keyof LocationFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const [initialState, setInitialState] = useState<LocationFormState>(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user, formState]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: LocationFormState) => {
      return await updateUserProfile(accessToken, data);
    },
    onSuccess: () => {
      toast.success("Location updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update location");
    },
  });

  const handleSubmit = async (e: FormEvent) => {
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
      <div>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">Location</h1>
        <p className="text-gray-600 dark:text-zinc-400 text-sm">Update your location details.</p>
      </div>
      
      <div className="shrink-0 bg-gray-200 dark:bg-zinc-700 h-[1px] w-full my-6"></div>
      
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
              State
            </label>
            <Input
              id="state"
              type="text"
              value={formState.state}
              onChange={handleChange("state")}
              placeholder="Karnataka"
              className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Enter your state of residence. This helps us provide location-specific services.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="zipCode" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
              Zip Code
            </label>
            <Input
              id="zipCode"
              type="text"
              value={formState.zipCode}
              onChange={handleChange("zipCode")}
              placeholder="560001"
              className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Enter your postal code. This helps us provide location-specific services if needed.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium text-gray-700 dark:text-zinc-200">
            Address
          </label>
          <Input
            id="address"
            type="text"
            value={formState.address}
            onChange={handleChange("address")}
            placeholder="1234, Main Street, Apt 2B"
            className="focus:ring-2 focus:ring-blue-500/20 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Enter your full address including street, apartment number, city, and state if applicable.
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

export default LocationForm;
