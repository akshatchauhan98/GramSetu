export default function MillPageStub({
  title = "Mill Page",
  body = "This section is ready for live data.",
}) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#0F3D2E]">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#5C6B63]">{body}</p>
      <p className="mt-4 text-xs font-medium text-emerald-700">
        Demo view — full module connected in portal navigation.
      </p>
    </div>
  );
}