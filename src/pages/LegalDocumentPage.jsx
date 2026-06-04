import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Mail, Shield, Scale } from 'lucide-react';
import {
  SELLER_AGREEMENT_META,
  SELLER_AGREEMENT_SECTIONS,
} from '../content/sellerAgreement';
import logo from '../assets/logo.png';
import './LegalDocumentPage.css';

const PAGE_CONFIG = {
  '/terms': {
    eyebrow: 'Terms & Conditions',
    headline: 'Seller Agreement',
    description:
      'Please read this agreement carefully before registering your business on Pochi Commerce.',
    icon: Scale,
  },
  '/privacy': {
    eyebrow: 'Privacy Policy',
    headline: 'Seller Agreement',
    description:
      'This policy outlines how seller data and customer information are handled on the Pochi platform.',
    icon: Shield,
  },
};

const renderBullets = (items, className = 'legal-list') => {
  if (!items?.length) return null;
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

const renderSectionBody = (section) => (
  <>
    {section.intro && <p className="legal-intro">{section.intro}</p>}
    {section.paragraphs?.map((text) => (
      <p key={text} className="legal-paragraph">
        {text}
      </p>
    ))}
    {renderBullets(section.bullets)}
    {section.nestedBullets && (
      <ul className="legal-list legal-list-nested">
        {section.nestedBullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
    {section.footerIntro && <p className="legal-intro">{section.footerIntro}</p>}
    {renderBullets(section.footerBullets)}
    {section.subsections?.map((sub) => (
      <div key={sub.heading} className="legal-subsection">
        <h4>{sub.heading}</h4>
        {renderBullets(sub.bullets)}
      </div>
    ))}
    {section.contact && (
      <div className="legal-contact-card">
        <p className="legal-contact-company">{section.contact.company}</p>
        {section.contact.lines.map((line) => (
          <a key={line.value} href={`mailto:${line.value}`} className="legal-contact-line">
            <Mail size={16} />
            <span>
              <strong>{line.label}:</strong> {line.value}
            </span>
          </a>
        ))}
      </div>
    )}
  </>
);

const LegalDocumentPage = () => {
  const { pathname } = useLocation();
  const config = PAGE_CONFIG[pathname] || PAGE_CONFIG['/terms'];
  const Icon = config.icon;
  const [activeSection, setActiveSection] = useState(SELLER_AGREEMENT_SECTIONS[0]?.id);

  useEffect(() => {
    const observers = SELLER_AGREEMENT_SECTIONS.map((section) => {
      const element = document.getElementById(section.id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
      );
      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <div className="legal-topbar-inner">
          <Link to="/register" className="legal-back-link">
            <ArrowLeft size={18} />
            Back to Registration
          </Link>
          <div className="legal-brand">
            <img src={logo} alt="Pochi Commerce" />
            <span>Pochi Commerce</span>
          </div>
        </div>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="legal-hero-badge">
            <Icon size={18} />
            {config.eyebrow}
          </div>
          <h1>{config.headline}</h1>
          <p>{config.description}</p>
          <div className="legal-meta-row">
            <div className="legal-meta-chip">
              <FileText size={16} />
              <span>
                <strong>Last Updated:</strong> {SELLER_AGREEMENT_META.lastUpdated}
              </span>
            </div>
            <div className="legal-meta-chip">
              <Shield size={16} />
              <span>
                <strong>Effective:</strong> {SELLER_AGREEMENT_META.effectiveDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="legal-layout">
        <aside className="legal-toc glass">
          <h3>Contents</h3>
          <nav>
            {SELLER_AGREEMENT_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`legal-toc-link ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        <main className="legal-main">
          <article className="legal-document glass">
            <div className="legal-preamble">
              <p className="legal-preamble-label">This Seller Agreement (&quot;Agreement&quot;) is entered into between:</p>
              <ul className="legal-list">
                {SELLER_AGREEMENT_META.parties.map((party) => (
                  <li key={party}>{party}</li>
                ))}
              </ul>
            </div>

            {SELLER_AGREEMENT_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="legal-section">
                <h2>{section.title}</h2>
                {renderSectionBody(section)}
              </section>
            ))}
          </article>

          <div className="legal-footer-actions">
            <Link to="/register" className="legal-primary-btn">
              Return to Registration
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LegalDocumentPage;
