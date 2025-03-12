import isEqual from "lodash.isequal";
import { useEffect, useState, useContext, ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/apis/userApis";
import { UserContext } from "@/context/UserContext";
import { Input } from "@/components/ui/input";

interface RoleFormState {
  company: string;
  role: string;
  department: string;
}

const RoleForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const { company = "", role = "", department = "" } = user || {};

  const [formState, setFormState] = useState<RoleFormState>({ company, role, department });
  const [initialState, setInitialState] = useState<RoleFormState>(formState);

  useEffect(() => {
    setInitialState(formState);
  }, [user, formState]);

  const handleChange = (prop: keyof RoleFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [prop]: event.target.value });
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: RoleFormState) => {
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

  const handleSubmit = async (e: FormEvent) => {
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
        <h1 className="text-2xl font-bold text-white ">Professional Details</h1>
        <p className="text-zinc-400 text-sm ">
          Update your professional information to help us tailor your
          experience.
        </p>
      </div>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-3"></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="company" className="text-sm font-medium text-zinc-200">
            Company
          </label>
          <Input
            id="company"
            type="text"
            value={formState.company}
            onChange={handleChange("company")}
            placeholder="Acme Corporation"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Enter the name of your current employer or your own company if you're self-employed.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium text-zinc-200">
            Job Title
          </label>
          <Input
            id="role"
            type="text"
            value={formState.role}
            onChange={handleChange("role")}
            placeholder="Software Engineer"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Enter your current job title or role within your company.
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="department" className="text-sm font-medium text-zinc-200">
            Department
          </label>
          <Input
            id="department"
            type="text"
            value={formState.department}
            onChange={handleChange("department")}
            placeholder="Engineering"
            className="focus:ring-0 border-zinc-700 bg-zinc-800/50"
          />
          <p className="text-xs text-zinc-400">
            Specify the department or team you work in.
          </p>
        </div>
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
