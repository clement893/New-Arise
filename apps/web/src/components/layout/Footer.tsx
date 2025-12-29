import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 py-12" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">
              MODELE<span className="text-primary-400">FULLSTACK</span>
            </h3>
            <p className="text-sm">
              Template full-stack moderne pour demarrer rapidement vos projets.
            </p>
          </div>

          <nav aria-label="Ressources">
            <h4 className="text-white font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
                  Plan du Site
                </Link>
              </li>
              <li>
                <Link href="https://github.com/clement893/MODELE-NEXTJS-FULLSTACK" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="GitHub (ouvre dans un nouvel onglet)">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded">
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h4 className="text-white font-semibold mb-4">Technologies</h4>
            <ul className="space-y-2 text-sm" role="list">
              <li>Next.js 16</li>
              <li>React 19</li>
              <li>FastAPI</li>
              <li>PostgreSQL</li>
            </ul>
          </div>

          <nav aria-label="Contact">
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/clement893" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="GitHub du développeur (ouvre dans un nouvel onglet)">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://github.com/clement893/MODELE-NEXTJS-FULLSTACK/issues" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 rounded" aria-label="Signaler un bug sur GitHub (ouvre dans un nouvel onglet)">
                  Report a Bug
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>
            Tous droits reserves. Nukleo {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}