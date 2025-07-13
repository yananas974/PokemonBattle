type SearchInputProps = {
  defaultValue?: string;
};

const SearchInput = ({ defaultValue = "" }: SearchInputProps) => (
  <div className="relative">
    <input
      type="text"
      name="search"
      defaultValue={defaultValue}
      placeholder="Rechercher par nom ou numéro..."
      className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
    />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-50">
      🔍
    </div>
  </div>
);

export default SearchInput;