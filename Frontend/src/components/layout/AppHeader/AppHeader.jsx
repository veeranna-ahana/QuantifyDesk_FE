import { ChevronDown } from "lucide-react";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";

import { Avatar } from "@/components/ui/Avatar";

import styles from "./AppHeader.module.css";

export function AppHeader() {
  const reduxUser = useSelector((state) => state.auth?.user);

  let user = reduxUser;
  if (!user) {
    try {
      user = JSON.parse(Cookies.get("user") || "null");
    } catch {
      user = null;
    }
  }
  const uName = user?.emp_name || localStorage.getItem("userName") || "Kusum G G";
  const uEmpId = user?.emp_id || localStorage.getItem("emp_id") || "AS03363";

  return (
    <header className={styles.header}>
      <div className={styles.account}>
        <Avatar size="lg" className={styles.avatar} />
        <span className={styles.accountText}>
          <span className={styles.name}>{uName}</span>
          <span className={styles.employeeId}>{uEmpId}</span>
        </span>
        <ChevronDown className={styles.accountChevron} aria-hidden="true" />
      </div>
    </header>
  );
}

export default AppHeader;
