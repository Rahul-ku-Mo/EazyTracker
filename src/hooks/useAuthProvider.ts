import { useContext, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

const useAuthProvider = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useContext(AuthContext);
  const [username, setUserName] = useState("");
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    setErrors({ ...errors, [prop]: "" });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!values.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!values.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (values.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const signinUser = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        values
      );

      const token = response.data.accesstoken;

      if (response.status === 200) {
        Cookies.set("accessToken", token);
        toast.success("Login successful 🎉");
        setIsLoggedIn(true);
        queryClient.setQueryData(["user"], response.data.data);
        navigate("/boards");
      }
    } catch (err ) {
      toast.error(
        err.response?.data?.message || "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email: "rajamohanty12345@gmail.com",
          password: "123456",
        }
      );

      const token = response.data.accesstoken;

      if (response.status === 200) {
        Cookies.set("accessToken", token);
        toast.success("Login successful as Guest 🎉");
        setIsLoggedIn(true);
        queryClient.setQueryData(["user"], response.data.data);
        navigate("/boards");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An error occurred during guest login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async () => {
    if (!validateForm() || !username) {
      setErrors((prev) => ({ ...prev, username: "Username is required" }));
      return;
    }

    setIsLoading(true);
    const updatedData = { ...values, username, name: username };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        updatedData
      );

      const token = response.data.accesstoken;
      Cookies.set("accessToken", token);
      toast.success("Signed up and logged in successfully 🎉");
      setIsLoggedIn(true);
      queryClient.setQueryData(["user"], response.data.data);
      navigate("/boards");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setUserName(e.target.value);
    setErrors((prev) => ({ ...prev, username: "" }));
  };

  return {
    signinUser,
    signupUser,
    signInAsGuest,
    values,
    handleChange,
    username,
    handleNameChange,
    errors,
    isLoading,
  };
};

export default useAuthProvider;
