import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SelectCategory({ selected, setSelected, categories }) {
  return (
    <div className="w-72">
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative ">
          <Listbox.Button className="relative max-w-40 focus:border-emerald-500 cursor-default rounded-md bg-white py-1 pl-3 pr-10 text-left border-2 border-slate-500/50 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-green-300 sm:text-sm">
            <span className="block truncate capitalize text-sm">
              {selected}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FontAwesomeIcon
                icon={faChevronDown}
                className="h-2 w-2 text-zinc-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 max-w-36 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {categories.map((category, categoryIdx) => (
                <Listbox.Option
                  key={categoryIdx + "category"}
                  className={({ active }) =>
                    `relative cursor-default  select-none py-1 pl-8 pr-4 ${
                      active
                        ? "bg-emerald-100 text-emerald-900"
                        : "text-zinc-900"
                    }`
                  }
                  value={category}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-sm ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {category}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600 ">
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="w-2 h-2"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
