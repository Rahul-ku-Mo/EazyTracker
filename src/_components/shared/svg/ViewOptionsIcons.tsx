import { SVGProps } from "react";

export const DisplayIcon = ({ fill }: { fill?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
    >
      <path
        fill={fill ? fill : "none"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4 4h2v2H4zm0 14h2v2H4zM18 4h2v2h-2zm0 7h2v2h-2zm-7 0h2v2h-2zm-7 0h2v2H4zm7-7h2v2h-2zm0 14h2v2h-2zm7 0h2v2h-2z"
      />
    </svg>
  );
};

export const GroupingIcon = ({ fill }: { fill?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 36 36"
    >
      <path
        fill={fill ? fill : "currentColor"}
        d="m33.53 18.76l-6.93-3.19V6.43a1 1 0 0 0-.6-.9l-7.5-3.45a1 1 0 0 0-.84 0l-7.5 3.45a1 1 0 0 0-.58.91v9.14l-6.9 3.18a1 1 0 0 0-.58.91v9.78a1 1 0 0 0 .58.91l7.5 3.45a1 1 0 0 0 .84 0l7.08-3.26l7.08 3.26a1 1 0 0 0 .84 0l7.5-3.45a1 1 0 0 0 .58-.91v-9.78a1 1 0 0 0-.57-.91M25.61 22l-5.11-2.33l5.11-2.35l5.11 2.35Zm-1-6.44l-6.44 3v-7.69a1 1 0 0 0 .35-.08L24.6 8v7.58ZM18.1 4.08l5.11 2.35l-5.11 2.35L13 6.43Zm-7.5 13.23l5.11 2.35L10.6 22l-5.11-2.33Zm6.5 11.49l-6.5 3v-7.69A1 1 0 0 0 11 24l6.08-2.8Zm15 0l-6.46 3v-7.69A1 1 0 0 0 26 24l6.08-2.8Z"
        className="clr-i-solid clr-i-solid-path-1"
      />
      <path fill="none" d="M0 0h36v36H0z" />
    </svg>
  );
};

export const BoardViewIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M13 8V4q0-.425.288-.712T14 3h6q.425 0 .713.288T21 4v4q0 .425-.288.713T20 9h-6q-.425 0-.712-.288T13 8M3 12V4q0-.425.288-.712T4 3h6q.425 0 .713.288T11 4v8q0 .425-.288.713T10 13H4q-.425 0-.712-.288T3 12m10 8v-8q0-.425.288-.712T14 11h6q.425 0 .713.288T21 12v8q0 .425-.288.713T20 21h-6q-.425 0-.712-.288T13 20M3 20v-4q0-.425.288-.712T4 15h6q.425 0 .713.288T11 16v4q0 .425-.288.713T10 21H4q-.425 0-.712-.288T3 20m2-9h4V5H5zm10 8h4v-6h-4zm0-12h4V5h-4zM5 19h4v-2H5zm4-2"
      />
    </svg>
  );
};

export const ListViewIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M2 20v-4h4v4zm6 0v-4h14v4zm-6-6v-4h4v4zm6 0v-4h14v4zM2 8V4h4v4zm6 0V4h14v4z"
      />
    </svg>
  );
};

export const CompletedCardIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        fill="currentColor"
        d="M1.5 8a6.5 6.5 0 1 1 13 0A.75.75 0 0 0 16 8a8 8 0 1 0-8 8a.75.75 0 0 0 0-1.5A6.5 6.5 0 0 1 1.5 8"
      />
      <path
        fill="currentColor"
        d="m8.677 12.427l2.896 2.896a.25.25 0 0 0 .427-.177V13h3.25a.75.75 0 0 0 0-1.5H12V9.354a.25.25 0 0 0-.427-.177l-2.896 2.896a.25.25 0 0 0 0 .354M11.28 6.78a.749.749 0 1 0-1.06-1.06L7.25 8.689L5.78 7.22a.749.749 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0z"
      />
    </svg>
  );
};

export const CardIdIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M2 4h4V2H2a2 2 0 0 0-2 2v4h2zm20-2h-4v2h4v4h2V4a2 2 0 0 0-2-2M2 16H0v4a2 2 0 0 0 2 2h4v-2H2zm20 4h-4v2h4a2 2 0 0 0 2-2v-4h-2zM4 8v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2m2 8v-4h12v4zm12-8v2H6V8z"
      />
    </svg>
  );
};

export const DueDateIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="m9.7 17.758l-.708-.708l2.3-2.3l-2.3-2.3l.708-.708l2.3 2.3l2.3-2.3l.708.708l-2.3 2.3l2.3 2.3l-.708.708l-2.3-2.3zM5.616 21q-.691 0-1.153-.462T4 19.385V6.615q0-.69.463-1.152T5.616 5h1.769V2.77h1.077V5h7.154V2.77h1V5h1.769q.69 0 1.153.463T20 6.616v12.769q0 .69-.462 1.153T18.384 21zm0-1h12.769q.23 0 .423-.192t.192-.424v-8.768H5v8.769q0 .23.192.423t.423.192"
      />
    </svg>
  );
};

export function DateCreatedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5.616 21q-.691 0-1.153-.462T4 19.385V6.615q0-.69.463-1.152T5.616 5h1.769V2.77h1.077V5h7.154V2.77h1V5h1.769q.69 0 1.153.463T20 6.616v4.751q0 .214-.143.357t-.357.143t-.357-.143t-.143-.357v-.752H5v8.77q0 .23.192.423t.423.192h6.435q.214 0 .357.143t.143.357t-.143.357t-.357.143zm12.769 1q-1.671 0-2.836-1.164Q14.385 19.67 14.385 18t1.164-2.835T18.384 14t2.836 1.165T22.385 18t-1.165 2.836T18.385 22m1.655-1.798l.546-.546l-1.817-1.818v-2.722H18v3.046z"
      />
    </svg>
  );
}

export function DateUpdatedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M5.616 21q-.691 0-1.153-.462T4 19.385V6.615q0-.69.463-1.152T5.616 5h1.769V2.77h1.077V5h7.154V2.77h1V5h1.769q.69 0 1.153.463T20 6.616v5h-1v-1H5v8.769q0 .23.192.423t.423.192h6.231v1zm8.615 0v-2.21l5.333-5.307q.148-.13.307-.19q.16-.062.32-.062q.165 0 .334.064q.17.065.298.194l.925.944q.123.148.188.308q.064.159.064.319t-.052.322t-.2.31L16.44 21zm5.96-4.985l.925-.956l-.925-.943l-.95.95z"
      />
    </svg>
  );
}

export function EstimateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3 20v-1h18v1zm1-2.77V12h2v5.23zm4.654 0V7h2v10.23zm4.673 0V10h2v7.23zm4.673 0V4h2v13.23z"
      />
    </svg>
  );
}

export function ViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3 16h5.2q-.4.55-.737 1.175T6.825 18.5q.3.7.638 1.325T8.2 21H3zm0-2V9h8v4.325q-.25.15-.488.313T10.05 14zm10-5h8v4.325q-1.1-.65-2.337-.987T16 12q-.8 0-1.55.113t-1.45.312zM3 7V3h18v4zm13 16q-2.275 0-4.2-1.2T9 18.5q.875-2.1 2.8-3.3T16 14t4.2 1.2t2.8 3.3q-.875 2.1-2.8 3.3T16 23m0-2q1.05 0 1.775-.725T18.5 18.5t-.725-1.775T16 16t-1.775.725T13.5 18.5t.725 1.775T16 21m0-1q-.625 0-1.063-.437T14.5 18.5t.438-1.062T16 17t1.063.438t.437 1.062t-.437 1.063T16 20"
      />
    </svg>
  );
}
