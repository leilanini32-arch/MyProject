import React, { createContext, useContext, useState } from "react";

/* =========================
   Type (optionnel mais propre)
========================= */
type GlobalContextType = {
  // Factory
  gs_factoryCode: string;
  setFactoryCode: (v: string) => void;

  // Warehouse
  gs_wareCode: string;
  setWareCode: (v: string) => void;
  gs_wareName: string;
  setWareName: (v: string) => void;
  gs_wareType: string;
  setWareType: (v: string) => void;

  // Class
  gs_classCode: string;
  setClassCode: (v: string) => void;
  gs_className: string;
  setClassName: (v: string) => void;

  // Group
  gs_groupCode: string;
  setGroupCode: (v: string) => void;
  gs_groupName: string;
  setGroupName: (v: string) => void;

  // User
  gs_userCode: string;
  setUserCode: (v: string) => void;
  gs_userName: string;
  setUserName: (v: string) => void;

  // Role
  gs_roleCode: string;
  setRoleCode: (v: string) => void;

  // Workdate
  gs_workdate: string;
  setWorkdate: (v: string) => void;

  // IP
  gs_IPAddress: string;
  setIPAddress: (v: string) => void;

  // Web config
  g_webUrl: string;
  setWebUrl: (v: string) => void;
  g_isRealUrl: boolean;
  setIsRealUrl: (v: boolean) => void;
};

/* =========================
   Context
========================= */
const GlobalContext = createContext<GlobalContextType | null>(null);

/* =========================
   Provider (équivalent globalstr)
========================= */
export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // Factory
  const [gs_factoryCode, setFactoryCode] = useState("001");

  // Warehouse
  const [gs_wareCode, setWareCode] = useState("");
  const [gs_wareName, setWareName] = useState("");
  const [gs_wareType, setWareType] = useState("");

  // Class
  const [gs_classCode, setClassCode] = useState("");
  const [gs_className, setClassName] = useState("");

  // Group
  const [gs_groupCode, setGroupCode] = useState("");
  const [gs_groupName, setGroupName] = useState("");

  // User
  const [gs_userCode, setUserCode] = useState("");
  const [gs_userName, setUserName] = useState("");

  // Role
  const [gs_roleCode, setRoleCode] = useState("");

  // Workdate
  const [gs_workdate, setWorkdate] = useState("");

  // IP
  const [gs_IPAddress, setIPAddress] = useState("");

  // Web service
  const [g_webUrl, setWebUrl] = useState(
    "https://mespdamobile.condor.dz/WINCEWeb.asmx"
  );
  const [g_isRealUrl, setIsRealUrl] = useState(true);

  return (
    <GlobalContext.Provider
      value={{
        gs_factoryCode,
        setFactoryCode,

        gs_wareCode,
        setWareCode,
        gs_wareName,
        setWareName,
        gs_wareType,
        setWareType,

        gs_classCode,
        setClassCode,
        gs_className,
        setClassName,

        gs_groupCode,
        setGroupCode,
        gs_groupName,
        setGroupName,

        gs_userCode,
        setUserCode,
        gs_userName,
        setUserName,

        gs_roleCode,
        setRoleCode,

        gs_workdate,
        setWorkdate,

        gs_IPAddress,
        setIPAddress,

        g_webUrl,
        setWebUrl,
        g_isRealUrl,
        setIsRealUrl
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

/* =========================
   Hook d’accès global
========================= */
export const useGlobal = () => {
  const ctx = useContext(GlobalContext);
  if (!ctx) {
    throw new Error("useGlobal must be used inside GlobalProvider");
  }
  return ctx;
};
