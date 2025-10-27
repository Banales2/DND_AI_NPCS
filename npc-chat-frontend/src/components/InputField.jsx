export default function InputField({ label, type, value, onChange, error }) {
  return (
    <div className="mb-4 w-full">
      <label className="block text-sm mb-1 text-[#b0ffcc] font-semibold">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded-lg bg-[#001a10] text-white border ${
          error ? "border-red-500" : "border-[#00ffcc]"
        } focus:outline-none focus:ring-2 focus:ring-[#00ffcc]`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
