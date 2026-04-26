export default function PlaceholderScreen({ title, icon: Icon }) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-ash text-brick-red dark:bg-ash">
        <Icon size={44} strokeWidth={2} />
      </div>
      <h1 className="heading text-4xl text-chalk dark:text-chalk">{title}</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-iron">
        Coming soon
      </p>
    </section>
  )
}
