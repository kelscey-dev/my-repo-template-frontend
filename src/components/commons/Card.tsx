import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      className={twMerge(
        "bg-white p-6 rounded-xl shadow shadow-standard-shadow relative text-base",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
