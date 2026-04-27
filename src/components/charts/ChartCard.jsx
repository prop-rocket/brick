export default function ChartCard({ title, action, children }) {
  return (
    <section className="rounded-2xl bg-ash p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="heading text-lg text-chalk">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}
