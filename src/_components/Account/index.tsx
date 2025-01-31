import Container from "../../layouts/Container";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const Account = ({ children }) => {
  const pathname = useLocation().pathname;

  return (
    <Container fwdClassName="dark:bg-zinc-800 bg-white pl-2 pb-2 pr-2 flex flex-col">
      <div className="my-2.5">
        <h1 className="text-2xl font-bold text-black dark:text-white capitalize tracking-tight  inline-flex items-center dark:border-white border-zinc-800 ">
          Settings
        </h1>
        <p className=" dark:text-zinc-200 text-white text-base">
          Manage your profile, account settings and set e-mail preferences.
        </p>
      </div>
      <div className="flex gap-2 h-full text-sm">
        <ul className="space-y-2 flex flex-col bg-white dark:bg-zinc-900 dark:text-white text-black rounded-md p-2 w-52 h-full sticky top-0">
          <Link
            to="/setting/account"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/account" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Account
          </Link>
          <Link
            to="/setting/profile"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/profile" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Profile
          </Link>

          <Link
            to="/setting/location"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/location" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Location
          </Link>
          <Link
            to="/setting/role"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/role" && "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Role
          </Link>
          <Link
            to="/setting/integrations"
            className={clsx(
              "p-2 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
              pathname === "/setting/integrations" &&
                "bg-zinc-200 dark:bg-zinc-700"
            )}
          >
            Integrations
          </Link>
        </ul>
        <div className="dark:bg-zinc-900 dark:text-white bg-white/90 rounded-md text-black px-8 py-4 flex flex-col gap-4  w-full h-full">
          {children}
        </div>
      </div>
    </Container>
  );
};

export default Account;
