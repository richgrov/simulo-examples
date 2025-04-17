export default function Button(props: React.ComponentProps<"button">) {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    ...props.style,
  };
  return (
    <button {...props} style={style}>
      {props.children}
    </button>
  );
}
