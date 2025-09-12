"use client";
import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const login = async (email, password, role) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (data.ok) {
        dispatch({
          type: "LOGIN",
          payload: { user: data.user, token: data.token },
        });
        return { success: true };
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
        return { success: false, error: data.error };
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const register = async (name, email, password, role) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (data.ok) {
        dispatch({ type: "SET_LOADING", payload: false });
        return { success: true, data: data.data };
      } else {
        dispatch({ type: "SET_ERROR", payload: data.error });
        return { success: false, error: data.error, details: data.details };
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
