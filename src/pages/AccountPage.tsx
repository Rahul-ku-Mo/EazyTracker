
import Account from "../_components/Account";
import { Outlet } from "react-router-dom";

const AccountPage = () => {
  return (
    <>
      <Account>
        <Outlet />
      </Account>
    </>
  );
};

export default AccountPage;
