import { Link } from 'react-router-dom';

export const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-sada-sand-50 mb-8">Privacy Policy</h1>
      
      <div className="space-y-8 text-sada-sand-100/70">
        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Data Collection</h2>
          <p className="leading-relaxed">
            SADA stores your reflection entries locally on your device. We do not collect, store, or transmit 
            personal data to external servers. Your journal entries, mood logs, and listening history remain 
            private and under your control.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">AI Processing</h2>
          <p className="leading-relaxed">
            Your reflection inputs are processed through AI to generate personalized Quranic recommendations. 
            This processing occurs in real-time and is not stored beyond the immediate session.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Third-Party Services</h2>
          <p className="leading-relaxed">
            SADA fetches Quranic content from public APIs (Quran.com) to provide verses and audio recitations. 
            We do not share any personal data with these services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Contact</h2>
          <p className="leading-relaxed">
            For privacy concerns, contact us at privacy@sada.app
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-sada-sand-100/10">
        <Link to="/" className="text-sada-sand-200 hover:text-sada-sand-50 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};