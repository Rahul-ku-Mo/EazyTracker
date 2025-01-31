import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../apis/userApis";
import FormInput from "../shared/Input/FormInput";
import { UserContext } from "../../Context/UserContext";

const LocationForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { state = "", address = "", zipCode = "" } = user || {};

  const [formState, setFormState] = useState({
    state,
    address,
    zipCode,
  });

  const handleChange = (prop) => (event) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const [initialState, setInitialState] = useState(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEqual(formState, initialState)) {
      toast.info("No changes to save");
      return;
    }

    updateProfileMutation.mutate(formState);
  };

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white ">Location</h1>
        <p className="text-zinc-400 text-sm">Update your location details.</p>
      </div>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-3"></div>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 grid-cols-2">
          <FormInput
            id="state"
            type="text"
            htmlFor="state"
            formStateValue={formState.state}
            handleChange={handleChange}
            placeholder="Karnataka"
            value="State"
            description="Enter your state of residence. This helps us provide location-specific services."
          />
          <FormInput
            id="zipCode"
            type="text"
            htmlFor="zipCode"
            formStateValue={formState.zipCode}
            handleChange={handleChange}
            placeholder="560001"
            value="Zip Code"
            description="Enter your postal code. This helps us provide location-specific services if needed."
          />
        </div>

        <FormInput
          type="text"
          id="address"
          htmlFor="address"
          formStateValue={formState.address}
          handleChange={handleChange}
          placeholder="1234, Main Street, Apt 2B"
          value="Address"
          description="Enter your full address including street, apartment number, city, and state if applicable."
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
    </>
  );
};

export default LocationForm;
