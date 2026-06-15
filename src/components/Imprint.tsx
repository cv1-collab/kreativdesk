import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Imprint() {
  const { language } = useLanguage();
  const currentLang = typeof language === 'string' && language.toLowerCase().includes('de') ? 'de' : 'en';

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] py-12 px-4 sm:px-6 lg:px-8 selection:bg-brand-500/30">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-[#fafafa] transition-colors mb-10 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          {currentLang === 'de' ? 'Zurück zur Startseite' : 'Back to Homepage'}
        </Link>
        
        {currentLang === 'de' ? (
          <div className="space-y-8 leading-relaxed">
            <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">Impressum</h1>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Angaben gemäss Schweizer Recht</h2>
              <p>Vescio Design GmbH<br />Nürenbergstrasse 15<br />8037 Zürich<br />Schweiz</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Kontakt</h2>
              <p>E-Mail: info@vesciodesign.ch<br />Website: www.vesciodesign.ch</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Vertretungsberechtigte Person</h2>
              <p>Carlo Vescio, Geschäftsführer</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Unternehmensinformationen</h2>
              <p>Unternehmensform: Gesellschaft mit beschränkter Haftung (GmbH)<br/>Handelsregister: Kanton Zürich<br/>UID-Nummer: CHE-427.784.678 MWST</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Haftungsausschluss</h2>
              <p>Die Inhalte dieser Website und Plattform wurden mit grösstmöglicher Sorgfalt erstellt. Dennoch übernimmt der Anbieter keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Inhalte. Die Nutzung der Plattform erfolgt auf eigenes Risiko.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Haftung für externe Links</h2>
              <p>Diese Website oder Plattform kann Links zu externen Websites Dritter enthalten. Für die Inhalte externer Websites übernehmen wir keine Verantwortung oder Haftung. Für die Inhalte der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Urheberrechte</h2>
              <p>Alle Inhalte, Designs, Texte, Grafiken, Logos, Softwarebestandteile und visuellen Elemente dieser Website und Plattform unterliegen dem Urheberrecht und dürfen ohne schriftliche Zustimmung nicht vervielfältigt oder verwendet werden. Davon ausgenommen bleiben Inhalte, Dateien und Daten, die von Nutzern selbst hochgeladen oder erstellt wurden.</p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 leading-relaxed">
            <h1 className="text-3xl md:text-4xl font-bold text-[#fafafa] mb-8">Legal Notice / Imprint</h1>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Information in accordance with Swiss Law</h2>
              <p>Vescio Design GmbH<br />Nürenbergstrasse 15<br />8037 Zurich<br />Switzerland</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Contact</h2>
              <p>Email: info@vesciodesign.ch<br />Website: www.vesciodesign.ch</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Authorized Representative</h2>
              <p>Carlo Vescio, Managing Director</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Company Information</h2>
              <p>Legal Form: Limited Liability Company (GmbH)<br/>Commercial Register: Canton of Zurich<br/>UID Number: CHE-427.784.678 MWST</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Disclaimer of Liability</h2>
              <p>The content of this website and platform was created with the greatest possible care. However, the provider assumes no liability for the accuracy, completeness, or timeliness of the content provided. The use of the platform is at your own risk.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Liability for External Links</h2>
              <p>This website or platform may contain links to external third-party websites. We assume no responsibility or liability for the content of external websites. The operators of the linked pages are solely responsible for their content.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold text-[#fafafa] mb-3">Copyright</h2>
              <p>All content, designs, texts, graphics, logos, software components, and visual elements of this website and platform are subject to copyright and may not be reproduced or used without written consent. Exempt from this is content, files, and data that users have uploaded or created themselves.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}