import { mockPlant } from "../mockNodeData";

export const GardenCanvas = () => {
  const SATURATION = 80;
  const BRIGHTNESS = 65;
  const data = mockPlant;
  return (
    <svg
      className="border-4 border-purple-400 bg-mist-900"
      width="200"
      height="200"
      viewBox="0 0 400 400"
    >
      {data.plantNodes.map((n) => (
        <circle
          key={n.id}
          cx={100}
          cy={200}
          r={n.size / 2}
          fill={`hsl(${n.hue} ${SATURATION}% ${BRIGHTNESS}%)`}
        />
      ))}
    </svg>
  );
};
