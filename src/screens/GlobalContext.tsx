import React, { createContext, useContext, useState } from "react";
/* =========================
   Context
========================= */
/* =========================
   Type pour le contexte global
========================= */
type GlobalContextType = {
  // Factory
  gs_factoryCode: string;
  setgs_factoryCode: (v: string) => void;

  // Warehouse
  gs_wareCode: string;
  setgs_wareCode: (v: string) => void;
  gs_wareName: string;
  setgs_wareName: (v: string) => void;
  gs_wareType: string;
  setgs_wareType: (v: string) => void;

  // Class
  gs_classCode: string;
  setgs_classCode: (v: string) => void;
  gs_className: string;
  setgs_className: (v: string) => void;

  // Group
  gs_groupCode: string;
  setgs_groupCode: (v: string) => void;
  gs_groupName: string;
  setgs_groupName: (v: string) => void;

  // User
  gs_userCode: string;
  setgs_userCode: (v: string) => void;
  gs_userName: string;
  setgs_userName: (v: string) => void;

  // Role
  gs_roleCode: string;
  setgs_roleCode: (v: string) => void;

  // Workdate
  gs_workdate: string;
  setgs_workdate: (v: string) => void;

  // IP
  gs_IPAddress: string;
  setgs_IPAddress: (v: string) => void;

  // Web config
  g_webUrl: string;
  setg_webUrl: (v: string) => void;
  g_isRealUrl: boolean;
  setg_isRealUrl: (v: boolean) => void;
};

/* =========================
   Création du contexte
========================= */
const GlobalContext = createContext<GlobalContextType | null>(null);

/* =========================
   Provider
========================= */
export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  // Factory
  const [gs_factoryCode, _setFactoryCode] = useState("001");

  // Warehouse
  const [gs_wareCode, _setWareCode] = useState("");
  const [gs_wareName, _setWareName] = useState("");
  const [gs_wareType, _setWareType] = useState("");

  // Class
  const [gs_classCode, _setClassCode] = useState("");
  const [gs_className, _setClassName] = useState("");

  // Group
  const [gs_groupCode, _setGroupCode] = useState("");
  const [gs_groupName, _setGroupName] = useState("");

  // User
  const [gs_userCode, _setUserCode] = useState("");
  const [gs_userName, _setUserName] = useState("");

  // Role
  const [gs_roleCode, _setRoleCode] = useState("");

  // Workdate
  const [gs_workdate, _setWorkdate] = useState("");

  // IP
  const [gs_IPAddress, _setIPAddress] = useState("");

  // Web service
  const [g_webUrl, _setWebUrl] = useState("https://mespdamobile.condor.dz/WINCEWeb.asmx");
  const [g_isRealUrl, _setIsRealUrl] = useState(true);

  return (
    <GlobalContext.Provider
      value={{
        gs_factoryCode,
        setgs_factoryCode: _setFactoryCode,

        gs_wareCode,
        setgs_wareCode: _setWareCode,
        gs_wareName,
        setgs_wareName: _setWareName,
        gs_wareType,
        setgs_wareType: _setWareType,

        gs_classCode,
        setgs_classCode: _setClassCode,
        gs_className,
        setgs_className: _setClassName,

        gs_groupCode,
        setgs_groupCode: _setGroupCode,
        gs_groupName,
        setgs_groupName: _setGroupName,

        gs_userCode,
        setgs_userCode: _setUserCode,
        gs_userName,
        setgs_userName: _setUserName,

        gs_roleCode,
        setgs_roleCode: _setRoleCode,

        gs_workdate,
        setgs_workdate: _setWorkdate,

        gs_IPAddress,
        setgs_IPAddress: _setIPAddress,

        g_webUrl,
        setg_webUrl: _setWebUrl,
        g_isRealUrl,
        setg_isRealUrl: _setIsRealUrl,
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
