import { Link } from 'react-router-dom';

export const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-sada-sand-50 mb-8">Terms of Service</h1>
      
      <div className="space-y-8 text-sada-sand-100/70">
        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Acceptance</h2>
          <p className="leading-relaxed">
            By using SADA, you agree to these terms. If you do not agree, please do not use this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Purpose</h2>
          <p className="leading-relaxed">
            SADA is a spiritual reflection tool designed to help users connect with the Quran through 
            AI-assisted mood-based verse recommendations. It is intended for personal, non-commercial use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Content Disclaimer</h2>
          <p className="leading-relaxed">
            Quranic content is fetched from third-party sources (Quran.com). While we strive for accuracy, 
            SADA does not guarantee the completeness or accuracy of translations and recitations. For 
            religious guidance, consult qualified scholars.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Limitation of Liability</h2>
          <p className="leading-relaxed">
            SADA is provided "as is" without warranties of any kind. We are not liable for any damages 
            arising from the use of this application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Contact</h2>
          <p className="leading-relaxed">
            For questions about these terms, contact us at terms@sada.app
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