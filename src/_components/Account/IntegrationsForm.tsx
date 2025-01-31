import { useState, useContext } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../Context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { updateUserIntegrations } from "../../apis/userApis";
import { UserContext } from "../../Context/UserContext";
import {
  FaDiscord,
  FaSlack,
  FaMailchimp,
  FaGithub,
  FaGoogleDrive,
} from "react-icons/fa";

const IntegrationCard = ({ name, icon: Icon, connected, onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
      <div className="flex items-center space-x-3">
        <Icon className="text-2xl text-gray-600 dark:text-gray-300" />
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {name}
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
          connected
            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }`}
      >
        {connected ? "Connected" : "Connect"}
      </button>
    </div>
  );
};

const IntegrationsForm = () => {
  const { accessToken } = useContext(AuthContext);
  const { user } = useContext(UserContext);

  const [integrations, setIntegrations] = useState({
    discord: user?.integrations?.discord || false,
    slack: user?.integrations?.slack || false,
    mailchimp: user?.integrations?.mailchimp || false,
    github: user?.integrations?.github || false,
    googleDrive: user?.integrations?.googleDrive || false,
  });

  const updateIntegrationsMutation = useMutation({
    mutationFn: async (data) => {
      return await updateUserIntegrations(accessToken, data);
    },
    onSuccess: () => {
      toast.success("Integrations updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update integrations");
    },
  });

  const handleToggleIntegration = (integration) => {
    const updatedIntegrations = {
      ...integrations,
      [integration]: !integrations[integration],
    };
    setIntegrations(updatedIntegrations);
    updateIntegrationsMutation.mutate(updatedIntegrations);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Integrations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your accounts to enable seamless integrations with your
          favorite tools.
        </p>
      </div>
      <div className="shrink-0 dark:bg-zinc-700 bg-white/10 h-[1px] w-full my-3"></div>
      <div className="grid gap-4 lg:grid-cols-2 ">
        <IntegrationCard
          name="Discord"
          icon={FaDiscord}
          connected={integrations.discord}
          onToggle={() => handleToggleIntegration("discord")}
        />
        <IntegrationCard
          name="Slack"
          icon={FaSlack}
          connected={integrations.slack}
          onToggle={() => handleToggleIntegration("slack")}
        />
        <IntegrationCard
          name="MailChimp"
          icon={FaMailchimp}
          connected={integrations.mailchimp}
          onToggle={() => handleToggleIntegration("mailchimp")}
        />
        <IntegrationCard
          name="GitHub"
          icon={FaGithub}
          connected={integrations.github}
          onToggle={() => handleToggleIntegration("github")}
        />
        <IntegrationCard
          name="Google Drive"
          icon={FaGoogleDrive}
          connected={integrations.googleDrive}
          onToggle={() => handleToggleIntegration("googleDrive")}
        />
      </div>
    </>
  );
};

export default IntegrationsForm;
