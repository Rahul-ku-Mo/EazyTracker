import { useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";

type AuthErrors = {
  email: string;
  password: string;
  username?: string;
  general?: string;
}

const useAuthProvider = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setIsLoggedIn } = useContext(AuthContext);
  const { toast } = useToast();

  const [username, setUserName] = useState("");

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<AuthErrors>({
    email: "",
    password: "",
    username: "",
    general: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (prop: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value });
    setErrors({ ...errors, [prop]: "", general: "" });
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setErrors((prev) => ({ ...prev, username: "", general: "" }));
  };

  const validateForm = (isSignup = false) => {
    let isValid = true;
    const newErrors: AuthErrors = {
      email: "",
      password: "",
      username: "",
      general: "",
    };

    // Email validation
    if (!values.email) {
      newErrors.email = "We need your email address to continue";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = "That doesn't look like a valid email address";
      isValid = false;
    }

    // Password validation
    if (!values.password) {
      newErrors.password = "Please enter your password";
      isValid = false;
    } else if (values.password.length < 6) {
      newErrors.password = "Your password needs to be at least 6 characters";
      isValid = false;
    } else if (isSignup && !/(?=.*[a-zA-Z])/.test(values.password)) {
      newErrors.password = "Please include at least one letter in your password";
      isValid = false;
    }

    // Username validation for signup (optional but if provided, should be valid)
    if (isSignup && username && username.trim().length === 0) {
      newErrors.username = "Username can't be empty if you provide one";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const signinUser = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        values
      );

      const token = response.data.accesstoken;

      if (response.status === 200) {
        Cookies.set("accessToken", token);
        toast({
          title: "Welcome back!",
          description: "You're all signed in 🎉",
        });
        setIsLoggedIn(true);
        queryClient.setQueryData(["user"], response.data.data);
        navigate("/workspace");
      }
    } catch (err : any) {
      console.error("Login error:", err);
      let errorMessage = "Something went wrong while signing you in";
      let fieldErrors: AuthErrors = {
        email: "",
        password: "",
        username: "",
        general: "",
      };
      
      if (err.response?.data?.message) {
        const serverMessage = err.response.data.message;
        
        // Make server messages more user-friendly
        if (serverMessage.toLowerCase().includes('email')) {
          if (serverMessage.toLowerCase().includes('invalid')) {
            errorMessage = "We couldn't find an account with that email";
            fieldErrors.email = "We couldn't find an account with that email";
          } else {
            errorMessage = serverMessage;
            fieldErrors.email = serverMessage;
          }
        } else if (serverMessage.toLowerCase().includes('password')) {
          if (serverMessage.toLowerCase().includes('invalid')) {
            errorMessage = "That password doesn't match our records";
            fieldErrors.password = "That password doesn't match our records";
          } else {
            errorMessage = serverMessage;
            fieldErrors.password = serverMessage;
          }
        } else {
          // General error - show under password field
          errorMessage = serverMessage;
          fieldErrors.password = serverMessage;
        }
      } else if (err.response?.status === 401) {
        errorMessage = "Email or password is incorrect";
        fieldErrors.password = "Double-check your email and password and try again";
      } else if (err.response?.status >= 500) {
        errorMessage = "Our servers are having trouble right now";
        fieldErrors.general = "Our servers are having trouble. Please try again in a moment.";
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Can't connect to our servers";
        fieldErrors.general = "Check your internet connection and try again";
      }
      
      // Set the errors to display in the form
      setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async () => {
    // For signup, username is optional - will default to name on backend
    if (!validateForm(true)) {
      return;
    }

    setIsLoading(true);
    // Use username if provided, otherwise backend will generate from name/email
    const updatedData = { 
      ...values, 
      username: username.trim() || undefined,
      name: username.trim() || values.email.split('@')[0]
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        updatedData
      );

      const token = response.data.accesstoken;
      Cookies.set("accessToken", token);
      toast({
        title: "Welcome to PulseBoard!",
        description: "Your account is ready to go 🎉",
      });
      setIsLoggedIn(true);
      queryClient.setQueryData(["user"], response.data.data);
      navigate("/workspace");
    } catch (err : any) {
      console.error("Signup error:", err);
      let errorMessage = "We couldn't create your account right now";
      let fieldErrors: AuthErrors = {
        email: "",
        password: "",
        username: "",
        general: "",
      };
      
      if (err.response?.data?.message) {
        const serverMessage = err.response.data.message;
        
        // Make server messages more user-friendly
        if (serverMessage.toLowerCase().includes('email')) {
          if (serverMessage.toLowerCase().includes('already exists') || serverMessage.toLowerCase().includes('already taken')) {
            errorMessage = "Someone's already using that email";
            fieldErrors.email = "This email is already registered. Try signing in instead?";
          } else {
            errorMessage = serverMessage;
            fieldErrors.email = serverMessage;
          }
        } else if (serverMessage.toLowerCase().includes('username')) {
          if (serverMessage.toLowerCase().includes('already taken') || serverMessage.toLowerCase().includes('already exists')) {
            errorMessage = "That username is already taken";
            fieldErrors.username = "This username is already taken. Try a different one?";
          } else {
            errorMessage = serverMessage;
            fieldErrors.username = serverMessage;
          }
        } else if (serverMessage.toLowerCase().includes('password')) {
          errorMessage = serverMessage;
          fieldErrors.password = serverMessage;
        } else {
          // General error
          errorMessage = serverMessage;
          fieldErrors.general = serverMessage;
        }
      } else if (err.response?.status === 400) {
        errorMessage = "Something's not quite right with your info";
        fieldErrors.general = "Please double-check your information and try again";
      } else if (err.response?.status >= 500) {
        errorMessage = "Our servers are having trouble right now";
        fieldErrors.general = "Our servers are having trouble. Please try again in a moment.";
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Can't connect to our servers";
        fieldErrors.general = "Check your internet connection and try again";
      }
      
      // Set the errors to display in the form
      setErrors(fieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signinUser,
    signupUser,
    values,
    handleChange,
    username,
    handleUserNameChange,
    errors,
    isLoading,
  };
};

export default useAuthProvider;
