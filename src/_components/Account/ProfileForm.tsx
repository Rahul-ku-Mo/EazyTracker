import isEqual from "lodash.isequal";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { UserContext } from "@/context/UserContext";
import { Input } from "@/components/ui/input";

interface ProfileFormState {
  username: string;
  email: string;
}

const ProfileForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { username = "", email = "" } = user || {};

  const [formState, setFormState] = useState<ProfileFormState>({ username, email });
  const [initialState, setInitialState] = useState<ProfileFormState>(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user, formState]);

  const handleChange = (prop: keyof ProfileFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormState) => {
      return await updateUserProfile(accessToken, data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update profile");
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
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
      <p className="text-zinc-400 text-sm mb-6">
        This is how others will see you on the site.
      </p>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-6"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium text-zinc-200">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={formState.username}
            onChange={handleChange("username")}
            placeholder="test-k-m"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            This is your unique username. It can be combination of name or a pseudonym. You can change it whenever you want.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-zinc-200">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={formState.email}
            onChange={handleChange("email")}
            placeholder="Rahu@km.com"
            readOnly
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            You cannot change your email since it's unique.
          </p>
        </div>
      </form>
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={isEqual(formState, initialState)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
