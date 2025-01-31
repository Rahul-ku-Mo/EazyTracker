const FormInput = ({
  formStateValue,
  handleChange,
  type,
  id,
  htmlFor,
  value,
  readOnly,
  placeholder,
  description,
}) => {
  return (
    <div className="flex flex-col relative gap-1.5">
      <label
        className="font-bold text-sm text-zinc-800 dark:text-white"
        htmlFor={htmlFor}
      >
        {value}
      </label>
      <input
        readOnly={readOnly}
        type={type}
        id={id}
        value={formStateValue || ""}
        placeholder={placeholder}
        onChange={handleChange(id)}
        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-md text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
      />
      {description !== "" && (
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
          {description}
        </span>
      )}
    </div>
  );
};

export default FormInput;
