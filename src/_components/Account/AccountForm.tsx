import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../apis/userApis";
import FormInput from "../shared/Input/FormInput";
import { UserContext } from "../../Context/UserContext";

const AccountForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { name = "", phoneNumber = "", imageUrl = "" } = user || {};

  const [formState, setFormState] = useState({
    name,
    phoneNumber,
    imageUrl,
  });

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
      toast.success("Account updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update account");
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
      <h1 className="text-2xl font-bold text-white mb-1">Account</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Manage your account settings and profile image.
      </p>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-6"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="name"
          type="text"
          htmlFor="name"
          formStateValue={formState.name}
          handleChange={handleChange}
          placeholder="John Doe"
          value="Name"
          description="This is the name that will be displayed on your account and in emails."
        />
        <FormInput
          id="phoneNumber"
          type="tel"
          htmlFor="phoneNumber"
          formStateValue={formState.phoneNumber}
          placeholder="+xyz 98765 43210"
          handleChange={handleChange}
          value="Phone Number"
          description="Its upto you to keep it private or public. Don't forget to add country code."
        />
        <FormInput
          id="imageUrl"
          type="url"
          htmlFor="imageUrl"
          formStateValue={formState.imageUrl}
          handleChange={handleChange}
          placeholder="https://example.com/profile-image.jpg"
          value="Profile Image URL"
          description="Enter the URL of your profile image. This image will be displayed on your profile."
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

export default AccountForm;
