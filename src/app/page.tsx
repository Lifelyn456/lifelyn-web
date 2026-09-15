"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  ShieldCheck,
  FileText,
  Activity,
  LockKeyhole,
  Plus,
  Check,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brand } from "@/components/brand";

const faqs = [
  [
    "What is Lifelyn?",
    "Lifelyn brings your medical records into one continuous, patient-owned timeline. It helps you find what is in your history, with links back to the original evidence.",
  ],
  [
    "Does Lifelyn give medical advice?",
    "No. Lifelyn helps you retrieve and understand recorded history. It does not independently diagnose conditions or prescribe treatment.",
  ],
  [
    "Who can see my health records?",
    "You choose which verified clinicians can access specific records, and for how long. You can revoke access and review the access history.",
  ],
  [
    "Are my medical records stored on a blockchain?",
    "No. Medical records remain encrypted off-chain. Stellar is used only for opaque consent and integrity proofs, never readable medical information.",
  ],
];
export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(".hero-reveal", {
          y: 65,
          opacity: 0,
          duration: 1.1,
          stagger: 0.13,
          ease: "power3.out",
        });
        gsap.from(".memory-stage", {
          y: 80,
          opacity: 0,
          rotate: 4,
          duration: 1.3,
          delay: 0.3,
          ease: "power3.out",
        });
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
          },
        });
        gsap.to(".hero-logo", {
          y: -100,
          rotation: 12,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
          gsap.from(el, {
            y: 45,
            opacity: 0,
            duration: 0.9,
            scrollTrigger: { trigger: el, start: "top 88%" },
          }),
        );
      }, root);
      return () => ctx.revert();
    });
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.to(".story-track", {
          xPercent: -66.6667,
          ease: "none",
          scrollTrigger: {
            trigger: ".story",
            start: "top top",
            end: "+=2200",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  return (
    <div ref={root} className="landing">
      <div className="scroll-progress" />
      <header className="site-header">
        <Brand />
        <nav className={menu ? "main-nav open" : "main-nav"}>
          <a href="#how-it-works" onClick={() => setMenu(false)}>
            How it works
          </a>
          <a href="#your-control" onClick={() => setMenu(false)}>
            Your privacy
          </a>
          <a href="#for-clinicians" onClick={() => setMenu(false)}>
            For clinicians
          </a>
        </nav>
        <div className="header-actions">
          <Link href="/login" className="login-link">
            Log in
          </Link>
          <Link href="/register" className="button button-small">
            Create account <ArrowUpRight size={16} />
          </Link>
          <button
            className="menu-toggle icon-button"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow hero-reveal">
              <span className="tiny-line" /> A LIFETIME OF YOU. ALL TOGETHER.
            </div>
            <h1 className="hero-reveal">
              Your health,
              <br />
              <span>remembered.</span>
            </h1>
            <p className="hero-reveal hero-description">
              Every record. Every chapter. One continuous story.
              <br className="desktop" /> A health memory that stays with you, wherever life goes.
            </p>
            <div className="hero-reveal hero-buttons">
              <Link className="button" href="/register">
                Create your health memory <ArrowUpRight size={19} />
              </Link>
              <a className="text-button" href="#how-it-works">
                See how it works{" "}
                <span className="round-arrow">
                  <ArrowDown size={17} />
                </span>
              </a>
            </div>
            <div className="hero-reveal hero-trust">
              <ShieldCheck size={17} />
              <span>Patient-owned.</span>
              <span>Private by design.</span>
              <span>Always yours.</span>
            </div>
          </div>
          <div className="memory-stage" aria-label="Lifelyn product capability overview">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="stage-label">YOUR LIFE, CONNECTED</div>
            <img
              className="hero-logo"
              src="/logo.png"
              alt="Lifelyn continuous health memory symbol"
            />
            <div className="floating-record record-one">
              <div className="record-symbol">
                <Activity size={21} />
              </div>
              <div>
                <small>ENCRYPTED RECORDS</small>
                <strong>Private by default.</strong>
                <span>Every source stays protected.</span>
              </div>
              <span className="verified-circle">
                <Check size={12} />
              </span>
            </div>
            <div className="floating-record record-two">
              <span className="record-symbol blue">
                <FileText size={20} />
              </span>
              <div>
                <small>MEDICAL HISTORY</small>
                <strong>Nothing left behind.</strong>
                <span>Connected across a lifetime.</span>
              </div>
            </div>
            <div className="floating-record record-three">
              <ShieldCheck size={20} />
              <span>Your records. Your permission.</span>
              <LockKeyhole size={14} />
            </div>
            <div className="stage-bottom">
              <span className="small-cross">+</span>
              <span>ONE MEMORY. A LIFETIME OF CARE.</span>
              <span>01 — ∞</span>
            </div>
          </div>
          <div className="hero-bottom">
            <span>BUILT AROUND YOU, NOT A HOSPITAL.</span>
            <a href="#how-it-works">
              Scroll to connect the dots <ArrowDown size={15} />
            </a>
            <span className="edition">THE NEXT CHAPTER OF HEALTH</span>
          </div>
        </section>
        <section className="manifesto reveal">
          <span className="eyebrow">A LITTLE LESS FRAGMENTED. A LOT MORE YOU.</span>
          <h2>
            Your life doesn’t happen
            <br />
            in one place.
            <span>
              {" "}
              Neither should
              <br />
              your health story.
            </span>
          </h2>
          <div className="manifesto-bottom">
            <span className="section-number">01 / THE BIG PICTURE</span>
            <p>
              A lab result here. A prescription there. Years of history in different places. Lifelyn
              brings it all together, so your next chapter starts with the whole story.
            </p>
          </div>
        </section>
        <section className="story" id="how-it-works">
          <div className="story-heading">
            <span className="eyebrow">FROM SCATTERED RECORDS TO A CONNECTED YOU</span>
            <span>
              THREE SIMPLE STEPS <ArrowRight size={15} />
            </span>
          </div>
          <div className="story-track">
            <article className="story-panel">
              <div className="story-content">
                <span className="step-number">01</span>
                <h2>
                  Bring your
                  <br />
                  story together.
                </h2>
                <p>
                  Upload your records. From a recent lab report to an old prescription, give every
                  piece of your history a home.
                </p>
                <Link href="/register" className="text-button">
                  Create your record library <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="story-visual upload-visual">
                <div className="mini-document back-document">
                  <FileText />
                  <span>Consultation notes</span>
                  <div className="document-lines" />
                </div>
                <div className="mini-document front-document">
                  <div className="document-header">
                    <span className="doc-logo">+</span>
                    <small>HEALTH RECORD</small>
                  </div>
                  <h3>Annual lab report</h3>
                  <span>12 September 2026</span>
                  <div className="document-lines" />
                  <div className="document-footer">
                    <ShieldCheck size={17} /> Original kept intact
                  </div>
                </div>
                <div className="upload-label">
                  <Plus size={20} /> Your history starts here
                </div>
              </div>
            </article>
            <article className="story-panel">
              <div className="story-content">
                <span className="step-number">02</span>
                <h2>
                  Find the thread.
                  <br />
                  See the story.
                </h2>
                <p>
                  Turn separate records into a clear timeline. Ask about your history and follow
                  every answer back to its source.
                </p>
                <Link href="/register" className="text-button">
                  Build your timeline <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="story-visual timeline-visual">
                <div className="timeline-year">2026</div>
                {[
                  ["SEP 12", "Annual health review", "Consultation"],
                  ["JUN 04", "Blood panel", "Lab results"],
                  ["FEB 18", "A new chapter of care", "Medical history"],
                ].map(([date, title, type]) => (
                  <div className="story-event" key={date}>
                    <span className="event-dot" />
                    <small>{date}</small>
                    <h3>{title}</h3>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="story-panel">
              <div className="story-content">
                <span className="step-number">03</span>
                <h2>
                  Share the context.
                  <br />
                  Keep the control.
                </h2>
                <p>
                  Let the right clinician see the right records, for the right amount of time.
                  Change your mind? Revoke access.
                </p>
                <Link href="/register" className="text-button">
                  Set up access controls <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="story-visual consent-visual">
                <div className="consent-preview">
                  <div className="avatar large">AO</div>
                  <h3>Dr. Amara Okafor</h3>
                  <span>Verified clinician · Patient-approved access</span>
                  <div className="scope-row">
                    <FileText size={18} /> Lab results <Check size={17} />
                  </div>
                  <div className="scope-row">
                    <Activity size={18} /> Medical timeline <Check size={17} />
                  </div>
                  <div className="consent-expiry">
                    <LockKeyhole size={17} /> You choose when access ends
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
        <section className="control-section" id="your-control">
          <div className="control-intro reveal">
            <span className="eyebrow">02 / YOUR HEALTH. YOUR RULES.</span>
            <h2>
              Trust isn’t a feature.
              <br />
              <span>It’s the foundation.</span>
            </h2>
            <p>
              Your most personal information deserves more than a password. It deserves to stay in
              your hands.
            </p>
          </div>
          <div className="trust-grid">
            <article className="reveal">
              <LockKeyhole />
              <span>01</span>
              <h3>Private at the core.</h3>
              <p>
                Original records are designed to remain encrypted off-chain. Your health story never
                belongs on a public ledger.
              </p>
            </article>
            <article className="reveal">
              <ShieldCheck />
              <span>02</span>
              <h3>Permission, not assumption.</h3>
              <p>
                Scoped, time-limited access puts you in charge of who sees what. Revoke permission
                when you need to.
              </p>
            </article>
            <article className="reveal">
              <FileText />
              <span>03</span>
              <h3>Evidence behind every answer.</h3>
              <p>
                Follow historical claims back to their source records. Know what is recorded, what
                conflicts, and what is missing.
              </p>
            </article>
          </div>
        </section>
        <section className="clinician-section reveal" id="for-clinicians">
          <div>
            <span className="eyebrow">FOR THE PEOPLE WHO CARE FOR YOU</span>
            <h2>
              Less searching.
              <br />
              <span>More understanding.</span>
            </h2>
            <p>
              Help your clinician start with context. A longitudinal timeline, source-linked
              answers, and a patient’s permission — all in one place.
            </p>
            <Link href="/register" className="button">
              Register as a clinician <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="answer-preview">
            <div className="answer-top">
              <Sparkles size={21} />
              <span>ASK PATIENT HISTORY</span>
              <span className="product-tag">EVIDENCE-LINKED</span>
            </div>
            <div className="question-bubble">Ask from your authenticated workspace</div>
            <p>
              This public page does not generate sample medical answers. Signed-in answers are
              produced only from records the current session is authorized to access.
            </p>
            <div className="source-preview">
              <FileText size={21} />
              <div>
                <strong>Original source citation</strong>
                <span>Opened after authorization is checked</span>
              </div>
              <ArrowUpRight size={17} />
            </div>
            <small>Live evidence only · History, not a diagnosis</small>
          </div>
        </section>
        <section className="faq-section">
          <div className="reveal">
            <span className="eyebrow">A FEW THINGS WORTH KNOWING</span>
            <h2>
              Good questions.
              <br />
              Clear answers.
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a], i) => (
              <div className="faq-item" key={q}>
                <button
                  aria-expanded={faq === i}
                  aria-controls={`faq-${i}`}
                  onClick={() => setFaq(faq === i ? null : i)}
                >
                  {q}
                  <ChevronDown className={faq === i ? "rotated" : ""} size={20} />
                </button>
                <div id={`faq-${i}`} hidden={faq !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="final-cta reveal">
          <span className="eyebrow">EVERY CHAPTER MATTERS.</span>
          <h2>
            Here’s to a healthier
            <br />
            <em>next chapter.</em>
          </h2>
          <Link href="/register" className="button button-mint">
            Create your Lifelyn account <ArrowUpRight size={19} />
          </Link>
          <p>Sign in securely with your Freighter wallet.</p>
          <img src="/logo.png" alt="" />
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <Brand />
          <span>Your health, remembered.</span>
          <a href="#your-control">
            Privacy & ownership <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Lifelyn</span>
          <span>Built for a lifetime. Belonging to you.</span>
          <span>Health history. Not medical advice.</span>
        </div>
      </footer>
    </div>
  );
}
