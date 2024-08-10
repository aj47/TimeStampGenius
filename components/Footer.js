export default function Footer() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.6,
        padding: "1rem",
        fontSize: "0.8rem",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <p>
        Currently IP banned from youtube on timestampgenius.com . <br /> I'm
        working on refactoring to fix. Meanwhile you can run this yourself
        locally: <br />
        <a href="https://github.com/aj47/timestampgenius">
          https://github.com/aj47/timestampgenius
        </a>
      </p>
    </div>
  );
}
