import React from "react";
import styles from "./styles.module.css";

const defaultOptions = {
  invertedIconLogic: false
};

function ThemeButton({isDark,onChange,invertedIconLogic = defaultOptions.invertedIconLogic}){
  return(
    <label
      className={styles.container}
      title={isDark ? "Activate light mode" : "Activate dark mode"}
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
    >
      <input
        type="checkbox"
        defaultChecked={invertedIconLogic ? !isDark : isDark}
        onChange={onChange}
      />
      <div />
    </label>
  )
}

export default ThemeButton;
