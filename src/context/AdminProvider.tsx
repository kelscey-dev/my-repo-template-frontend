"use client";
import React, { Dispatch, createContext, useReducer } from "react";
import { AuthProfileType } from "@app-types/GlobalTypes";

type ActionType = {
  type: "SET_PROFILE";
  value: any;
};

type StateTypes = {
  profile: AuthProfileType | null;
};

type DispatchTypes = {
  setProfile: (value: boolean) => void;
};

function reducer(state: StateTypes, action: ActionType) {
  switch (action.type) {
    case "SET_PROFILE":
      return { ...state, isDrawerOpen: action.value };

    default:
      return state;
  }
}

const initialState: StateTypes = {
  profile: null,
};

export const Context = createContext({} as StateTypes & DispatchTypes);

export default function AdminProvider({ children, ...rest }: any) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialDispatch: DispatchTypes = {
    setProfile: (value: boolean) => {
      dispatch({ type: "SET_PROFILE", value });
    },
  };

  const value = {
    ...state,
    ...initialDispatch,
    ...rest,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
