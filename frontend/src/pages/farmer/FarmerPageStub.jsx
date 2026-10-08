export default function FarmerPageStub({ title, body }) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-xl shadow-[#0F3D2E]/8">
      <h1 className="text-2xl font-semibold tracking-tight text-[#0F3D2E]">{title}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-[#5C6B63]">{body}</p>
      <p className="mt-6 text-sm text-[#1F6B4A]">Demo view — API later.</p>
    </section>
  )
}
