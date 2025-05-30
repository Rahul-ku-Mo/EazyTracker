import MainLayout from "@/layouts/Container";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
  import { UserRoundCogIcon,  MapPinHouseIcon } from "lucide-react";
const Account = ({ children }: { children: React.ReactNode }) => {
  const pathname = useLocation().pathname;

  return (
    <MainLayout title="Settings" fwdClassName="flex flex-col !pl-0 !pr-2">
      <div className="flex h-full gap-2 text-sm">
        <aside className="sticky top-0 flex flex-col p-2 space-y-2 text-black bg-white rounded-md h-fit dark:bg-zinc-950 dark:text-white w-52">
          <Link
            to="/setting/account"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2",
              pathname === "/setting/account" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            <UserRoundCogIcon className="size-4" />
Personalization
          </Link>
          {/* <Link
            to="/setting/role"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2",
              pathname === "/setting/role" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            <ShieldPlus className="size-4" />
            Role 
          </Link> */}

          <Link
            to="/setting/location"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2",
              pathname === "/setting/location" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
             <MapPinHouseIcon className="size-4" />
            Location
          </Link>
          {/* <Link
            to="/setting/role"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/role" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Role
          </Link> */}
          {/* <Link
            to="/setting/integrations"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/integrations" &&
                "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Integrations
          </Link> */}
        </aside>
        <div className="flex flex-col w-full h-full gap-4 px-8 py-4 text-black rounded-md dark:bg-zinc-900 dark:text-white bg-white/90">
          {children}
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
