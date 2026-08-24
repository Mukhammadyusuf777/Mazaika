import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scene3D } from '../components/3d/Scene3D';
import { OverlayContent } from '../components/ui/OverlayContent';
import '../styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // Layer separation state — drives Scene3D prop reactively
  const [separation, setSeparation] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ==============================================================
      // PHASE 1: Exploded view — layers spread apart on scroll
      // ==============================================================
      ScrollTrigger.create({
        trigger: '#feature-0',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.2,
        onUpdate: (self) => {
          setSeparation(self.progress * 0.85);
        },
      });

      // ==============================================================
      // PHASE 2: Canvas tilt / camera feel — subtle rotation via CSS
      // ==============================================================
      gsap.to(canvasWrapRef.current, {
        scrollTrigger: {
          trigger: '#feature-0',
          start: 'top 70%',
          end: '#feature-2 bottom',
          scrub: 2,
        },
        rotateY: -12,
        rotateX: 4,
        scale: 0.92,
        ease: 'none',
      });

      // ==============================================================
      // PHASE 3: Reassemble — layers come back together
      // ==============================================================
      ScrollTrigger.create({
        trigger: '.cta-section',
        start: 'top 80%',
        end: 'top 20%',
        scrub: 1.5,
        onUpdate: (self) => {
          setSeparation(0.85 * (1 - self.progress));
        },
      });

      // Return canvas to neutral position at CTA
      gsap.to(canvasWrapRef.current, {
        scrollTrigger: {
          trigger: '.cta-section',
          start: 'top 70%',
          end: 'top 20%',
          scrub: 2,
        },
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        ease: 'none',
      });

      // ==============================================================
      // Feature text reveal animations
      // ==============================================================
      gsap.utils.toArray<HTMLElement>('.feature-content').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -60 : 60, filter: 'blur(8px)' },
          {
            opacity: 1, x: 0, filter: 'blur(0px)',
            duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 75%',
              end: 'top 45%',
              scrub: false,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Hero text entrance
      gsap.fromTo('.hero-badge',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)', delay: 0.2 }
      );
      gsap.fromTo('.hero-title',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 }
      );
      gsap.fromTo('.hero-sub',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.7 }
      );
      gsap.fromTo('.hero-cta-row',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.95 }
      );
      gsap.fromTo('.scroll-hint',
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.5, delay: 1.4,
          repeat: -1, yoyo: true, repeatDelay: 1.5,
        }
      );

    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="landing-root">
      {/* Sticky 3D canvas */}
      <div className="canvas-sticky-wrapper">
        <div ref={canvasWrapRef} className="canvas-inner" style={{ transformStyle: 'preserve-3d' }}>
          <Scene3D separation={separation} />
        </div>
        {/* Gradient vignette */}
        <div className="canvas-vignette" />
      </div>

      {/* Scrollable overlay */}
      <div className="scroll-overlay">
        <OverlayContent />
      </div>
    </div>
  );
}
