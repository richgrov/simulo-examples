export default function Button(
  props: React.PropsWithChildren<{ style?: React.CSSProperties }>
) {
  return (
    <button
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        ...props.style,
      }}
    >
      {props.children}
    </button>
  );
}
