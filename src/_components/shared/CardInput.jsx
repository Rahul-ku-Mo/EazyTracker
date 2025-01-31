import React, { forwardRef } from "react";

const CardInput = forwardRef(
  ({ setValue, value, id, name, onKeyDown }, ref) => {
    return (
      <input
        ref={ref}
        {...(onKeyDown && { onKeyDown })}
        id={id}
        name={name}
        value={value}
        placeholder="Type something..."
        className="flex w-full px-2 py-2 bg-white dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-600 rounded-md text-xs shadow-sm placeholder-zinc-400 outline-none
          focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
          disabled:bg-zinc-50 disabled:text-zinc-500 disabled:border-zinc-200 disabled:shadow-none
          invalid:border-pink-500 invalid:text-pink-600
          focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
        type="text"
        onChange={(e) => setValue(e.target.value)}
      />
    );
  }
);

CardInput.displayName = "CardInput";

export default CardInput;
