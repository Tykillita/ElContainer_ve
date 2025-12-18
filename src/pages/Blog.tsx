const posts = [
  {
    title: 'Cada cuánto lavar tu auto sin dañar la pintura',
    excerpt: 'Guía rápida para climas soleados y con polvo, evitando micro-rayas y pérdida de brillo.',
    tag: 'Pintura'
  },
  {
    title: 'Tapicería: trucos para derrames y malos olores',
    excerpt: 'Qué hacer en los primeros minutos y cómo prevenir manchas persistentes en telas y cuero.',
    tag: 'Tapicería'
  },
  {
    title: 'Motos: lavado seguro de partes eléctricas',
    excerpt: 'Puntos a cubrir, productos suaves y tiempos de secado para motos de calle y enduro.',
    tag: 'Motos'
  }
]

export default function Blog() {
  return (
    <section className="container-shell space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.12em] text-white/50">Blog / Tips</p>
        <h1 className="text-3xl font-semibold leading-tight">Consejos rápidos para cuidar tu vehículo</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Tips cortos y accionables para proteger pintura, tapicería y componentes. Ayudan al SEO y a educar a tus
          clientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.title} className="card space-y-2">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.1em] text-white/70">
              {post.tag}
            </span>
            <h2 className="text-lg font-semibold leading-snug">{post.title}</h2>
            <p className="text-sm text-white/70">{post.excerpt}</p>
            <button className="text-sm font-semibold text-white hover:text-white/80">Leer más</button>
          </article>
        ))}
      </div>
    </section>
  )
}
