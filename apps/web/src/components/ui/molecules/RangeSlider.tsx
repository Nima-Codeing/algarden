import { Text } from "../atoms/Text";

type RangeSliderProps = {
  title?: string;
  min: number;
  max: number;
  value: string;
  onChange: (value: string) => void;
};

export const RangeSlider = ({
  title,
  min,
  max,
  value,
  onChange,
}: RangeSliderProps) => {
  return (
    <div className="p-3 w-full">
      <div className="mb-1">
        {title && (
          <Text as="label" htmlFor="rangeBar">
            {title}
          </Text>
        )}
        <input
          type="range"
          id="rangeBar"
          className="w-full accent-indigo-500"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex justify-between text-gray-500">
        <Text id="minRange">{value === "" ? "-" : `${value} m`}</Text>
        <Text id="maxRange">{`${max} m`}</Text>
      </div>
    </div>
  );
};
