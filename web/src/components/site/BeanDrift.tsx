const BEANS = [
  { left: "6%", top: "18%", size: 34, dur: "32s", dx: "18px", dy: "-28px", from: "-18deg", to: "10deg" },
  { left: "88%", top: "22%", size: 42, dur: "38s", dx: "-22px", dy: "18px", from: "12deg", to: "-8deg" },
  { left: "92%", top: "62%", size: 28, dur: "26s", dx: "-14px", dy: "-22px", from: "8deg", to: "24deg" },
  { left: "4%", top: "68%", size: 48, dur: "42s", dx: "16px", dy: "20px", from: "-6deg", to: "14deg" },
  { left: "78%", top: "8%", size: 22, dur: "29s", dx: "10px", dy: "26px", from: "20deg", to: "-4deg" },
  { left: "14%", top: "88%", size: 26, dur: "36s", dx: "-12px", dy: "-16px", from: "-12deg", to: "8deg" },
];

export function BeanDrift() {
  return (
    <div className="bean-drift" aria-hidden>
      {BEANS.map((bean, index) => (
        <svg
          key={index}
          className="bean-drift-item"
          style={{
            left: bean.left,
            top: bean.top,
            width: bean.size,
            height: bean.size * 1.45,
            ["--dur" as string]: bean.dur,
            ["--dx" as string]: bean.dx,
            ["--dy" as string]: bean.dy,
            ["--from" as string]: bean.from,
            ["--to" as string]: bean.to,
          }}
          viewBox="0 0 40 58"
          fill="none"
        >
          <ellipse cx="20" cy="29" rx="15" ry="26" fill="currentColor" />
          <path
            d="M20 7c-5 9 5 18 0 44"
            stroke="#011b3d"
            strokeOpacity="0.35"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}
