const BEANS = [
  { left: "5%", top: "16%", size: 34 },
  { left: "88%", top: "20%", size: 42 },
  { left: "91%", top: "60%", size: 28 },
  { left: "4%", top: "66%", size: 48 },
  { left: "78%", top: "7%", size: 22 },
  { left: "13%", top: "86%", size: 26 },
];

export function BeanDrift() {
  return (
    <div className="bean-drift" aria-hidden>
      {BEANS.map((bean, index) => (
        <span
          key={index}
          className={`bean-drift-item bean-drift-item-${index + 1}`}
          style={{ left: bean.left, top: bean.top, width: bean.size, height: bean.size * 1.45 }}
        >
          <svg viewBox="0 0 40 58" fill="none">
            <ellipse cx="20" cy="29" rx="15" ry="26" fill="currentColor" />
            <path
              d="M20 7c-5 9 5 18 0 44"
              stroke="#011b3d"
              strokeOpacity="0.35"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
