import { useState } from "react";
import clsx from "clsx";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const AuthFormInput = ({
  value,
  type,
  onHandleChange,
  placeholder,
  isPassword = false,
  label,
  error,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-800 dark:text-zinc-100">
        {label}
      </label>
      <div className="flex flex-col">
        <div className="flex items-center relative">
          <input
            placeholder={placeholder}
            autoComplete={isPassword ? "current-password" : "on"}
            className={clsx(
              "flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm ring-offset-white dark:ring-offset-zinc-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              isPassword && "pr-10",
              error && "border-red-500 dark:border-red-400"
            )}
            value={value}
            type={isPassword ? (isPasswordVisible ? "text" : "password") : type}
            onChange={onHandleChange}
            required
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {!isPasswordVisible ? (
                <EyeOffIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AuthFormInput;
