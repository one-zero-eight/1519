import React from "react";
import styles from './SectionIntro.module.css'

export interface SectionIntroProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SectionIntro({ children, className = '', ...props }: SectionIntroProps) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`} {...props}>
      <div className={`${styles.wave} grow shrink hidden md:block`}></div>
      <div className="md:w-[440px] shrink-0">{children}</div>
      <div className={`${styles.wave} grow shrink hidden md:block`}></div>
    </div>
  )
}
