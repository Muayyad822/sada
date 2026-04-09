import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-black text-sada-sand-50 mb-8">About SADA</h1>
      
      <div className="space-y-8 text-sada-sand-100/70">
        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">What is SADA?</h2>
          <p className="leading-relaxed">
            SADA (Echoes of Quran) is an AI-powered spiritual companion that helps you connect with the Quran 
            based on your current mood and emotional state. Through intelligent semantic search, SADA recommends 
            relevant Quranic verses to guide, comfort, and inspire you throughout your day.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">How It Works</h2>
          <p className="leading-relaxed mb-4">
            Simply share how you're feeling—whether you're seeking peace, gratitude, guidance, or strength—and 
            SADA uses AI to understand your emotional context and find Quranic verses that speak to your needs.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-sada-sand-50">Listen</strong> - Browse Quranic verses based on your mood</li>
            <li><strong className="text-sada-sand-50">Reflect</strong> - Write personal reflections and journal entries</li>
            <li><strong className="text-sada-sand-50">Growth</strong> - Track your spiritual journey over time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Features</h2>
          <ul className="space-y-3 ml-2">
            <li className="flex items-start gap-3">
              <span className="text-sada-emerald-400 mt-1">✦</span>
              <span><strong className="text-sada-sand-50">AI-Powered Recommendations</strong> — Semantic search matches your mood with relevant verses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sada-emerald-400 mt-1">✦</span>
              <span><strong className="text-sada-sand-50">Audio Recitations</strong> — Listen to beautiful recitations from renowned reciters</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sada-emerald-400 mt-1">✦</span>
              <span><strong className="text-sada-sand-50">Personal Journal</strong> — Save reflections and thoughts connected to specific verses</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sada-emerald-400 mt-1">✦</span>
              <span><strong className="text-sada-sand-50">Progress Tracking</strong> — Monitor your listening history and journaling habits</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sada-emerald-400 mt-1">✦</span>
              <span><strong className="text-sada-sand-50">Private & Secure</strong> — All your data stays on your device</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-sada-sand-50 mb-4">Our Mission</h2>
          <p className="leading-relaxed">
            SADA aims to make the wisdom of the Quran more accessible and personally relevant in our daily lives. 
            We believe that connecting with sacred text through emotional awareness can provide profound guidance, 
            comfort, and spiritual growth.
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