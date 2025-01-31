import isEqual from "lodash.isequal";
import { useEffect, useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../apis/userApis";
import { UserContext } from "../../Context/UserContext";
import FormInput from "../shared/Input/FormInput";

const RoleForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { company = "", role = "", department = "" } = user || {};

  const [formState, setFormState] = useState({ company, role, department });
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
      toast.success("Professional details updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update professional details");
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
        <h1 className="text-2xl font-bold text-white ">
          Professional Details
        </h1>
        <p className="text-zinc-400 text-sm ">
          Update your professional information to help us tailor your
          experience.
        </p>
      </div>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-3"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          id="company"
          type="text"
          htmlFor="company"
          formStateValue={formState.company}
          handleChange={handleChange}
          placeholder="Acme Corporation"
          value="Company"
          description="Enter the name of your current employer or your own company if you're self-employed."
        />
        <FormInput
          id="role"
          type="text"
          htmlFor="role"
          formStateValue={formState.role}
          handleChange={handleChange}
          placeholder="Software Engineer"
          value="Job Title"
          description="Enter your current job title or role within your company."
        />
        <FormInput
          id="department"
          type="text"
          htmlFor="department"
          formStateValue={formState.department}
          handleChange={handleChange}
          placeholder="Engineering"
          value="Department"
          description="Specify the department or team you work in."
        />
      </form>
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={isEqual(formState, initialState)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </>
  );
};

export default RoleForm;
