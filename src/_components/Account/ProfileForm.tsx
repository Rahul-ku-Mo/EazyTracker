import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../apis/userApis";
import { UserContext } from "../../Context/UserContext";
import FormInput from "../shared/Input/FormInput";

const ProfileForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { username = "", email = "" } = user || {};

  const [formState, setFormState] = useState({ username, email });
  const [initialState, setInitialState] = useState(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user]);

  const handleChange = (prop) => (event) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
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

  const handleSubmit = async (e) => {
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
        <FormInput
          id="username"
          type="text"
          htmlFor="username"
          formStateValue={formState.username}
          handleChange={handleChange}
          placeholder="test-k-m"
          value="Username"
          description=" This is your unique username. It can be combination of name or a pseudonym. You can change it whenever you want."
        />
        <FormInput
          id="email"
          type="email"
          htmlFor="email"
          formStateValue={formState.email}
          placeholder="Rahu@km.com"
          handleChange={handleChange}
          readOnly
          value="Email"
          description="You cannot change your email since it's unique."
        />
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
