type TypeSelectProps = {
  types: string[];
  defaultValue?: string;
};

const TypeSelect = ({ types, defaultValue = "" }: TypeSelectProps) => (
  <select
    name="type"
    defaultValue={defaultValue}
    className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
  >
    <option value="">Tous les types</option>
    {types.map((type) => (
      <option key={type} value={type} className="text-black">
        {type}
      </option>
    ))}
  </select>
);

export default TypeSelect;
