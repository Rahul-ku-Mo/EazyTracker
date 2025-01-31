import React, { forwardRef } from 'react';

const CardInputForm = forwardRef(({
  input,
  onInputChange,
  onHideInput,
  handleUpdate,
  prevInput,
}, ref) => (
  <form
    className="p-1 flex gap-2 flex-col w-full"
    onSubmit={(e) => {
      e.preventDefault();

      if (prevInput !== input) {
        handleUpdate();
      }
      onHideInput();
    }}
    onBlur={() => {
      if (prevInput !== input) {
        handleUpdate();
      }
      onHideInput();
    }}
  >
    <input
      ref={ref}
      value={input}
      className="flex w-full !h-8 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 outline-none
        focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
        disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
        invalid:border-pink-500 invalid:text-pink-600
        focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
      type="text"
      onChange={onInputChange}
    />
  </form>
));

CardInputForm.displayName = 'CardInputForm';

export default CardInputForm;
