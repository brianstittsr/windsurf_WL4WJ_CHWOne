'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe, Heart, Users, Megaphone, Vote, Handshake, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { wl4wj, type ProgramSection, type Person } from './content';

const PROGRAM_ICONS: Record<string, React.ReactNode> = {
  food: <Heart className="h-5 w-5" />,
  chws: <Users className="h-5 w-5" />,
  education: <Megaphone className="h-5 w-5" />,
  gotv: <Vote className="h-5 w-5" />,
  coalition: <Handshake className="h-5 w-5" />,
};

const PROGRAM_VIDEOS: Record<string, { src: string; poster: string }> = {
  food: { src: '/wl4wj/programs/food/food_security.mp4', poster: '/wl4wj/programs/food/bags.jpg' },
  chws: { src: '/wl4wj/programs/chw/mending_bodies.mp4', poster: '/wl4wj/programs/chw/chw.png' },
};

function PersonCard({ person }: { person: Person }) {
  return (
    <div className="apple-card overflow-hidden text-left">
      {person.image ? (
        <div className="relative aspect-[4/5] w-full bg-[#F5F5F7]">
          <Image
            src={person.image}
            alt={person.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div className="relative aspect-[4/5] w-full bg-[#F5F5F7] flex items-center justify-center">
          <Users className="h-16 w-16 text-[#D2D2D7]" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#1D1D1F]">{person.name}</h3>
        <p className="text-sm text-[#0071E3] font-medium mb-3">{person.role}</p>
        {person.bio && (
          <p className="text-sm text-[#6E6E73] leading-relaxed">{person.bio}</p>
        )}
      </div>
    </div>
  );
}

function ProgramBlock({ program, flip }: { program: ProgramSection; flip: boolean }) {
  const video = PROGRAM_VIDEOS[program.id];
  return (
    <section id={program.id} className="apple-section bg-white scroll-mt-16">
      <div className="apple-container-wide">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}>
          <div>
            <span
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full text-white mb-6"
              style={{ backgroundColor: program.accent }}
            >
              {PROGRAM_ICONS[program.id]}
              {program.eyebrow} · {program.title}
            </span>
            <h3 className="apple-headline text-[#1D1D1F] mb-6">{program.heading}</h3>
            {program.stat && (
              <div
                className="border-l-4 pl-5 py-1 mb-6 text-lg font-medium text-[#1D1D1F] italic"
                style={{ borderColor: program.accent }}
              >
                {program.stat}
              </div>
            )}
            <div className="space-y-4">
              {program.paragraphs.map((p, i) => (
                <p key={i} className="text-[#6E6E73] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="apple-card relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={program.image}
                alt={program.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {video && (
              <video
                className="w-full rounded-[18px] shadow-sm"
                src={video.src}
                poster={video.poster}
                controls
                preload="metadata"
                playsInline
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function WomenLeadingHome() {
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const c = wl4wj[language];

  const programLinks = [
    { href: '#food', label: c.nav.food },
    { href: '#chws', label: c.nav.chws },
    { href: '#education', label: c.nav.education },
    { href: '#gotv', label: c.nav.gotv },
    { href: '#coalition', label: c.nav.coalition },
  ];

  const aboutLinks = [
    { href: '#story', label: c.nav.story },
    { href: '#leadership', label: c.nav.leadership },
    { href: '#board', label: c.nav.board },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || mobileMenuOpen ? 'bg-[rgba(255,255,255,0.85)] backdrop-blur-xl shadow-sm' : 'bg-transparent'
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-[1200px] mx-auto px-[22px] h-[52px] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2" aria-label="Women Leading for Wellness and Justice">
            <Image src="/wl4wj/logo.svg" alt="WL4WJ" width={30} height={30} />
            <span className="font-semibold text-sm text-[#1D1D1F]">WL4WJ</span>
          </a>

          <div className="hidden lg:flex items-center gap-6">
            {programLinks.slice(0, 3).map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-[#1D1D1F] hover:text-[#0071E3] transition-colors">
                {l.label}
              </a>
            ))}
            {aboutLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs text-[#1D1D1F] hover:text-[#0071E3] transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
              aria-label={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'Español' : 'English'}
            </button>
            <Link href="/chwone" className="text-xs text-[#1D1D1F] hover:text-[#0071E3] transition-colors">
              {c.nav.platform}
            </Link>
            <Link
              href="/login"
              className="text-xs bg-[#0071E3] text-white px-4 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors"
            >
              {c.nav.signIn}
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1D1D1F]"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-[60px] lg:hidden overflow-y-auto">
          <div className="p-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6E6E73]">{c.nav.programs}</p>
            {programLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl font-semibold text-[#1D1D1F] hover:text-[#0071E3]"
              >
                {l.label}
              </a>
            ))}
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6E6E73] pt-4">{c.nav.about}</p>
            {aboutLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl font-semibold text-[#1D1D1F] hover:text-[#0071E3]"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-6 border-t border-[#D2D2D7] space-y-4">
              <button onClick={toggleLanguage} className="flex items-center gap-2 text-lg text-[#1D1D1F]">
                <Globe className="h-5 w-5" />
                {language === 'en' ? 'Español' : 'English'}
              </button>
              <Link
                href="/chwone"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg text-[#0071E3]"
              >
                {c.nav.platform}
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-[#0071E3] text-white py-3 rounded-xl text-lg font-medium"
              >
                {c.nav.signIn}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <header id="top" className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/wl4wj/home/hero_bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center px-6 max-w-[980px] mx-auto pt-[52px]">
          <Image
            src="/wl4wj/logo.svg"
            alt="Women Leading for Wellness and Justice logo"
            width={96}
            height={96}
            className="mx-auto mb-8"
          />
          <h1 className="apple-headline-large text-white mb-6">{c.hero.tagline}</h1>
          <p className="apple-subhead text-white/85 max-w-[680px] mx-auto mb-10">{c.hero.sub}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#programs" className="apple-btn apple-btn-primary">
              {c.programsTitle}
            </a>
            <a href="#story" className="apple-btn apple-btn-secondary !text-white flex items-center gap-2">
              {c.nav.story} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Mission intro */}
      <section className="apple-section bg-white">
        <div className="apple-container max-w-[820px]">
          <div className="space-y-6 text-lg leading-relaxed text-[#1D1D1F]">
            {c.intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="apple-subhead text-[#0071E3] font-semibold text-center mt-14">{c.vision}</p>
        </div>
      </section>

      {/* Impact video band */}
      <section className="relative bg-[#1D1D1F]">
        <video
          className="w-full max-h-[70vh] object-cover opacity-80"
          src="/wl4wj/home/impact.mp4"
          poster="/wl4wj/home/hands.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </section>

      {/* With you we are stronger */}
      <section className="apple-section apple-bg-gray">
        <div className="apple-container max-w-[820px]">
          <h2 className="apple-headline text-[#1D1D1F] mb-6">{c.stronger.title}</h2>
          <p className="text-lg text-[#6E6E73] leading-relaxed mb-10">{c.stronger.body}</p>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {c.stronger.actions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="apple-card flex items-center justify-between p-5 text-[#1D1D1F] font-medium hover:text-[#0071E3]"
              >
                {a.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <p className="apple-headline text-[#0071E3]">{c.stronger.cta}</p>
        </div>
      </section>

      {/* Programs */}
      <div id="programs" className="scroll-mt-16">
        <section className="apple-section-tight bg-white text-center">
          <div className="apple-container">
            <h2 className="apple-headline text-[#1D1D1F] mb-4">{c.programsTitle}</h2>
            <p className="apple-subhead">{c.programsSub}</p>
          </div>
        </section>
        {c.programs.map((program, i) => (
          <ProgramBlock key={program.id} program={program} flip={i % 2 === 1} />
        ))}
      </div>

      {/* Our Story */}
      <section id="story" className="apple-section apple-bg-gray scroll-mt-16">
        <div className="apple-container-wide">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#6E6E73] mb-4">
              {c.about.eyebrow}
            </span>
            <h2 className="apple-headline text-[#1D1D1F] mb-2">{c.about.title}</h2>
            <p className="apple-subhead">{c.about.heading}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6 text-[#6E6E73] leading-relaxed">
              {c.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="apple-card relative aspect-[3/4] overflow-hidden col-span-2">
                <Image
                  src="/wl4wj/about/story/ana-kim.jpg"
                  alt="Ana Ilarraza-Blackburn and Kim Porter, founders of Women Leading"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="apple-card relative aspect-square overflow-hidden">
                <Image
                  src="/wl4wj/about/story/ana.jpg"
                  alt="Ana Ilarraza-Blackburn"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="apple-card relative aspect-square overflow-hidden">
                <Image
                  src="/wl4wj/about/story/kim.jpg"
                  alt="Kim Porter"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Mission / Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div className="apple-card p-8">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-4">{c.about.missionTitle}</h3>
              <p className="text-[#6E6E73] leading-relaxed">{c.about.mission}</p>
            </div>
            <div className="apple-card p-8">
              <h3 className="text-2xl font-semibold text-[#1D1D1F] mb-4">{c.about.visionTitle}</h3>
              <p className="text-[#6E6E73] leading-relaxed">{c.about.vision}</p>
            </div>
          </div>

          {/* Core 4 Values */}
          <div className="mb-8">
            <h3 className="apple-headline text-[#1D1D1F] mb-4 text-center">{c.about.valuesTitle}</h3>
            <p className="apple-subhead text-center max-w-[640px] mx-auto mb-12">{c.about.valuesIntro}</p>
            <div className="grid md:grid-cols-2 gap-6">
              {c.about.values.map((v, i) => (
                <div key={i} className="apple-card p-8">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0071E3] text-white font-semibold mb-4">
                    {i + 1}
                  </span>
                  <h4 className="text-xl font-semibold text-[#1D1D1F] mb-3">{v.title}</h4>
                  <p className="text-[#6E6E73] leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[18px] overflow-hidden mt-16">
            <Image
              src="/wl4wj/about/story/tree_hands.jpg"
              alt="Hands joined together"
              width={1200}
              height={500}
              className="w-full h-[320px] object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-6">
              <p className="text-white text-2xl md:text-3xl font-semibold text-center max-w-[700px]">
                {c.about.valuesCoda}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="apple-section bg-white scroll-mt-16">
        <div className="apple-container-wide">
          <h2 className="apple-headline text-[#1D1D1F] text-center mb-16">{c.leadershipTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {c.staff.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="apple-section apple-bg-gray scroll-mt-16">
        <div className="apple-container-wide">
          <h2 className="apple-headline text-[#1D1D1F] text-center mb-16">{c.boardTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.board.map((person) => (
              <PersonCard key={person.name} person={person} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D1D1F] py-12">
        <div className="apple-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-3">
              <Image src="/wl4wj/logo.svg" alt="WL4WJ" width={36} height={36} />
              <div>
                <p className="text-sm font-semibold text-white">{c.footer.tagline}</p>
                <p className="text-xs text-[#86868B]">{c.footer.platform}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-xs text-[#86868B] hover:text-white transition-colors"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'Español' : 'English'}
              </button>
              <Link href="/chwone" className="text-xs text-[#86868B] hover:text-white transition-colors">
                {c.footer.chwone}
              </Link>
              <Link href="/login" className="text-xs text-[#86868B] hover:text-white transition-colors">
                {c.footer.signIn}
              </Link>
            </div>
          </div>
          <div className="border-t border-[#2D2D2F] pt-8 text-center">
            <p className="text-xs text-[#86868B]">
              © {new Date().getFullYear()} Women Leading for Wellness &amp; Justice. {c.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
