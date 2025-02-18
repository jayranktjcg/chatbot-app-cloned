export default function Button({ icon, children, onClick, className }) {
  return (
    <button
      className={`${className}`}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}
