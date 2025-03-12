import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { LogOut, CreditCard, UserRound, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { UserCircle } from "lucide-react";

interface UserData {
  imageUrl?: string;
  name?: string;
}

interface AuthContextType {
  setIsLoggedIn: (value: boolean) => void;
}

interface UserContextType {
  user: UserData | null;
}

const User = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext) as UserContextType;
  const { setIsLoggedIn } = useContext(AuthContext) as AuthContextType;
  const queryClient = useQueryClient();

  const logOut = (): void => {
    Cookies.remove("accessToken");
    setIsLoggedIn(false);
    queryClient.clear();

    navigate("/auth");
  };

  return (
    <Popover>
      <PopoverTrigger>
        {user?.imageUrl ? (
          <img
            src={user?.imageUrl}
            alt="User"
            className="object-cover w-5 h-5 rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center w-5 h-5 text-sm font-bold">
            <UserCircle className="w-5 h-5 transition-all ease-linear text-zinc-200 hover:text-zinc-400" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2 -translate-x-4">
        <a
          href="/setting/profile"
          className="block py-2 pl-2 pr-4 text-xs transition-all ease-in rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <UserRound className="inline-block w-4 h-4 mr-2" />
          Profile
        </a>

        <a
          href="/pricing"
          className="block py-2 pl-2 pr-4 text-xs transition-all ease-in rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <CreditCard className="inline-block w-4 h-4 mr-2" />
          Pricing Plans
        </a>
        <a
          href="/setting/account"
          className="block py-2 pl-2 pr-4 text-xs transition-all ease-in rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <Settings className="inline-block w-4 h-4 mr-2" />
          Settings
        </a>
        <button
          onClick={logOut}
          className="block w-full py-2 pl-2 pr-4 text-xs text-left transition-all ease-in rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <LogOut className="inline-block w-4 h-4 mr-2" />
          Logout
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default User;
