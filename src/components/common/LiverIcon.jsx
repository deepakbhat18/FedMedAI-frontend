const LiverIcon = ({ size = 24, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M10 40 C8 20, 25 5, 48 8 C52 8, 54 7, 56 10 C58 7, 62 5, 68 8 C85 12, 95 25, 92 42 C89 58, 75 70, 58 70 C52 70, 48 67, 46 63 C44 67, 38 72, 28 68 C16 62, 12 56, 10 40 Z"
      fill="#C0392B"
    />
    <path
      d="M52 10 C54 14, 54 18, 52 22 C50 26, 50 30, 52 34"
      stroke="#E8917A"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M25 45 Q35 52, 30 60"
      stroke="#A93226"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M66 30 Q72 36, 68 44"
      stroke="#A93226"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <ellipse
      cx="72"
      cy="22"
      rx="10"
      ry="7"
      fill="#AD2C1E"
    />
  </svg>
);

export default LiverIcon;
