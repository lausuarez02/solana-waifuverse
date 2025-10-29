"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/8bit/button";
import styles from "./page.module.css";

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [findHerSubSlide, setFindHerSubSlide] = useState(0);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const totalSlides = 11;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.pitchContainer}>
      {/* Slide 0: Intro Image */}
      <div
        className={`${styles.slide} ${styles.introSlide} ${currentSlide === 0 ? styles.active : ""}`}
      >
        <div className={styles.introContent}>
          <div className={`${styles.introTextContainer} ${currentSlide === 0 ? styles.animate : ""}`}>
            <p className={`${styles.introLine} ${styles.line1}`}>You found her.</p>
            <p className={`${styles.introLine} ${styles.line2}`}>You charmed her.</p>
            <p className={`${styles.introLine} ${styles.line3}`}>She&apos;s with you now.</p>
            <p className={`${styles.introLine} ${styles.introHighlight} ${styles.line4}`}>Make her real.</p>
          </div>
        </div>
      </div>

      {/* Slide 1: Why Waifuverse */}
      <div
        className={`${styles.slide} ${styles.whySlide} ${currentSlide === 1 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <h2 className={styles.slideTitle}>Why Waifuverse?</h2>

          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <Image src="/corazon8bit.png" alt="Heart icon" width={80} height={80} className={styles.whyIconImg} />
              <p className={styles.whyText}>
                Many players don&apos;t chase raw power—they seek bond and dream of making her real.
              </p>
            </div>

            <div className={styles.whyCard}>
              <Image src="/mapa8bit.png" alt="Map icon" width={80} height={80} className={styles.whyIconImg} />
              <p className={styles.whyText}>
                The IRL map creates regional scarcity and opens the door to our virtual→real narrative.
              </p>
            </div>

            <div className={styles.whyCard}>
              <Image src="/waifulvlup.png" alt="Waifu evolution icon" width={80} height={80} className={styles.whyIconImg} />
              <p className={styles.whyText}>
                The visual evolution (pixel → illustration → photo) isn&apos;t just a mechanic; it&apos;s an emotional progression.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 2: Gameplay */}
      <div
        className={`${styles.slide} ${styles.gameplaySlide} ${currentSlide === 2 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <h2 className={styles.slideTitle}>Gameplay</h2>
        </div>
      </div>

      {/* Slide 3: Find her, charm her */}
      <div
        className={`${styles.slide} ${styles.defaultBgSlide} ${currentSlide === 3 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <div className={styles.splitLayout}>
            <div className={styles.videoPlaceholder}>
              <div className={styles.phoneMockupLarge}>
                <video
                  className={styles.phoneVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  key={currentSlide === 3 ? "playing" : "paused"}
                >
                  <source src="/videos/demowaifu.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className={styles.contentSection}>
              <h2 className={styles.slideTitle}>Find her, charm her</h2>

              {/* Sub-slide navigation */}
              <div className={styles.subSlideNavigation}>
                <button
                  className={`${styles.subSlideTab} ${findHerSubSlide === 0 ? styles.activeTab : ""}`}
                  onClick={() => setFindHerSubSlide(0)}
                >
                  Discover
                </button>
                <button
                  className={`${styles.subSlideTab} ${findHerSubSlide === 1 ? styles.activeTab : ""}`}
                  onClick={() => setFindHerSubSlide(1)}
                >
                  Charm
                </button>
                <button
                  className={`${styles.subSlideTab} ${findHerSubSlide === 2 ? styles.activeTab : ""}`}
                  onClick={() => setFindHerSubSlide(2)}
                >
                  Bond
                </button>
                <button
                  className={`${styles.subSlideTab} ${findHerSubSlide === 3 ? styles.activeTab : ""}`}
                  onClick={() => setFindHerSubSlide(3)}
                >
                  Interact
                </button>
              </div>

              {/* Sub-slide 0: Discover */}
              {findHerSubSlide === 0 && (
                <div className={styles.subSlideContent}>
                  <div className={styles.stepsList}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Discover waifus on your local map as you explore.
                      </p>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Each location has unique waifus tied to the area.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-slide 1: Charm */}
              {findHerSubSlide === 1 && (
                <div className={styles.subSlideContent}>
                  <div className={styles.stepsList}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Use charms to capture & enchant the ones you encounter.
                      </p>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Different waifus require different charm strategies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-slide 2: Bond */}
              {findHerSubSlide === 2 && (
                <div className={styles.subSlideContent}>
                  <div className={styles.stepsList}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Build affinity through short, daily interactions and care.
                      </p>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Before 7 days make a bond with your waifu creating she as a NFT or she will leave.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-slide 3: Interact */}
              {findHerSubSlide === 3 && (
                <div className={styles.subSlideContent}>
                  <div className={styles.stepsList}>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Chat with her. She&apos;s an AI companion that talks, reacts, and remembers you.
                      </p>
                    </div>
                    <div className={styles.stepItem}>
                      <div className={styles.stepBullet}>•</div>
                      <p className={styles.stepText}>
                        Play, flirt, or just hang out. Every chat makes your bond grow stronger.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide 4: Make her real */}
      <div
        className={`${styles.slide} ${styles.defaultBgSlide} ${currentSlide === 4 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <div className={styles.splitLayout}>
            <div className={styles.videoPlaceholder}>
              <div className={styles.phoneMockupLarge}>
                <video
                  className={styles.phoneVideo}
                  autoPlay
                  muted
                  playsInline
                  key={currentSlide === 4 ? "playing" : "paused"}
                >
                  <source src="/videos/envolvevideo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className={styles.contentSection}>
              <h2 className={styles.slideTitle}>Make her real</h2>

              <div className={styles.evolutionList}>
                <div className={styles.evolutionItem}>
                  <h3 className={styles.evolutionStageTitle}>Pixel</h3>
                  <p className={styles.evolutionDescription}>
                    Core identity, basic features.
                  </p>
                </div>

                <div className={styles.evolutionItem}>
                  <h3 className={styles.evolutionStageTitle}>Illustration</h3>
                  <p className={styles.evolutionDescription}>
                    Richer expressions, advanced interactions.
                  </p>
                </div>

                <div className={styles.evolutionItem}>
                  <h3 className={styles.evolutionStageTitle}>Photoreal</h3>
                  <p className={styles.evolutionDescription}>
                    Ultimate presence + AI chat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 5: Global Map */}
      <div
        className={`${styles.slide} ${styles.mapSlide} ${currentSlide === 5 ? styles.active : ""}`}
      >
        <div className={styles.mapContainer}>
          <h2 className={styles.slideTitle}>Global Reach</h2>

          <div className={styles.worldMap}>
            {/* Brazil Region */}
            <div
              className={`${styles.mapRegion} ${styles.brazilRegion} ${hoveredRegion === 'brazil' ? styles.zoomed : ''}`}
              onMouseEnter={() => setHoveredRegion('brazil')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={styles.regionContent}>
                <div className={styles.regionPinImage}>
                  <Image
                    src="/waifubrasilrm.png"
                    alt="Brazil Waifu"
                    width={80}
                    height={80}
                    className={styles.waifuImage}
                  />
                </div>
                <div className={styles.regionLabel}>Brazil</div>
              </div>
            </div>

            {/* USA Region */}
            <div
              className={`${styles.mapRegion} ${styles.usaRegion} ${hoveredRegion === 'usa' ? styles.zoomed : ''}`}
              onMouseEnter={() => setHoveredRegion('usa')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={styles.regionContent}>
                <div className={styles.regionPinImage}>
                  <Image
                    src="/waifueeuurm.png"
                    alt="USA Waifu"
                    width={80}
                    height={80}
                    className={styles.waifuImage}
                  />
                </div>
                <div className={styles.regionLabel}>USA</div>
              </div>
            </div>

            {/* Russia Region */}
            <div
              className={`${styles.mapRegion} ${styles.russiaRegion} ${hoveredRegion === 'russia' ? styles.zoomed : ''}`}
              onMouseEnter={() => setHoveredRegion('russia')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={styles.regionContent}>
                <div className={styles.regionPinImage}>
                  <Image
                    src="/waifurusarm.png"
                    alt="Russia Waifu"
                    width={80}
                    height={80}
                    className={styles.waifuImage}
                  />
                </div>
                <div className={styles.regionLabel}>Russia</div>
              </div>
            </div>

            {/* Italy Region */}
            <div
              className={`${styles.mapRegion} ${styles.italyRegion} ${hoveredRegion === 'italy' ? styles.zoomed : ''}`}
              onMouseEnter={() => setHoveredRegion('italy')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={styles.regionContent}>
                <div className={styles.regionPinImage}>
                  <Image
                    src="/waifuitaliarm.png"
                    alt="Italy Waifu"
                    width={80}
                    height={80}
                    className={styles.waifuImage}
                  />
                </div>
                <div className={styles.regionLabel}>Italy</div>
              </div>
            </div>

            {/* Japan Region */}
            <div
              className={`${styles.mapRegion} ${styles.japanRegion} ${hoveredRegion === 'japan' ? styles.zoomed : ''}`}
              onMouseEnter={() => setHoveredRegion('japan')}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={styles.regionContent}>
                <div className={styles.regionPinImage}>
                  <Image
                    src="/waifujaponrm.png"
                    alt="Japan Waifu"
                    width={80}
                    height={80}
                    className={styles.waifuImage}
                  />
                </div>
                <div className={styles.regionLabel}>Japan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 6: Business Model & Economy */}
      <div
        className={`${styles.slide} ${styles.businessSlide} ${currentSlide === 6 ? styles.active : ""}`}
      >
        <div className={styles.businessContent}>
          <h2 className={styles.businessTitle}>Business Model & Economy</h2>

          <div className={styles.businessCardsContainer}>
            <div className={styles.economyCard}>
              <h3>Revenue Streams</h3>
              <ul>
                <li>NFT Minting (after 7 days)</li>
                <li>Evolution Payments</li>
                <li>Charm Purchases</li>
                <li>Secondary Market Royalties (5% fee)</li>
              </ul>
            </div>

            <div className={styles.economyCard}>
              <h3>Scarcity Model</h3>
              <ul>
                <li>Region-specific waifus</li>
                <li>Limited supply per location</li>
                <li>Time-based spawns</li>
                <li>Rarity tiers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 7: Market Opportunity */}
      <div
        className={`${styles.slide} ${styles.defaultBgSlide} ${currentSlide === 7 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <h2 className={styles.slideTitle}>Market Opportunity</h2>

          <p className={styles.marketIntro}>Waifuverse sits at the intersection of 3 massive markets</p>

          <div className={styles.marketCardsGrid}>
            <div className={styles.marketCard}>
              <div className={styles.marketAmount}>$20B</div>
              <h3 className={styles.marketCardTitle}>Gacha Gaming</h3>
              <p className={styles.marketCardDetail}>$12B Waifu/Anime focused (60%)</p>
            </div>

            <div className={styles.marketCard}>
              <div className={styles.marketAmount}>$1.3B</div>
              <h3 className={styles.marketCardTitle}>Pokémon GO-like</h3>
              <p className={styles.marketCardDetail}>Location-based AR gaming</p>
            </div>

            <div className={styles.marketCard}>
              <div className={styles.marketAmount}>$5B</div>
              <h3 className={styles.marketCardTitle}>AI Companions</h3>
              <p className={styles.marketCardDetail}>AI-powered relationships</p>
            </div>
          </div>

          <div className={styles.targetAudience}>
            <h3>Target Audience</h3>
            <div className={styles.audienceTags}>
              <span className={styles.tag}>Degen Crypto Users</span>
              <span className={styles.tag}>Anime Fanbase</span>
              <span className={styles.tag}>Asian Market Focus</span>
              <span className={styles.tag}>Mobile Gamers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 8: Team */}
      <div
        className={`${styles.slide} ${styles.teamSlide} ${currentSlide === 8 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <h2 className={styles.slideTitle}>Team</h2>

          <div className={styles.teamGrid}>
            <div className={styles.teamMember}>
              <div className={styles.pixelAvatar}>
                <Image src="/lordfilipo.jpg" alt="lordfilipo" className={styles.avatarImage} width={100} height={100} />
              </div>
              <h3 className={styles.memberName}>lordfilipo</h3>
              <p className={styles.memberRole}>Co-Founder</p>
            </div>

            <div className={styles.teamMember}>
              <div className={styles.pixelAvatar}>
                <Image src="/lautaro.png" alt="lautaro" className={styles.avatarImage} width={100} height={100} />
              </div>
              <h3 className={styles.memberName}>lautaro</h3>
              <p className={styles.memberRole}>Co-Founder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 9: Roadmap */}
      <div
        className={`${styles.slide} ${styles.roadmapSlide} ${currentSlide === 9 ? styles.active : ""}`}
      >
        <div className={styles.slideContent}>
          <h2 className={styles.slideTitle}>Roadmap</h2>

          <div className={styles.roadmapTimeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}></div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>v0 Demo</h3>
                <div className={styles.timelineFeatures}>
                  <div className={styles.featureItem}>
                    <span className={styles.checkmark}>✓</span>
                    <span>Geolocalized capture system</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkmark}>✓</span>
                    <span>Minimal interaction mechanics</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.checkmark}>✓</span>
                    <span>Custodial NFT minting</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} style={{ opacity: 0.5 }}></div>
              <div className={styles.timelineContent} style={{ opacity: 0.7 }}>
                <h3 className={styles.timelineTitle}>Future Iterations</h3>
                <p className={styles.timelineDescription}>
                  Additional features and improvements coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 10: Call to Action */}
      <div
        className={`${styles.slide} ${styles.ctaSlide} ${currentSlide === 10 ? styles.active : ""}`}
      >
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Want to try?</h2>
          <Link href="/" className={styles.ctaButton}>
            PLAY NOW
          </Link>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={styles.navigation}>
        <Button
          onClick={prevSlide}
          size="icon"
          variant="outline"
          className={styles.navButton}
        >
          <ChevronLeft size={24} />
        </Button>

        <div className={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentSlide === index ? styles.activeDot : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          size="icon"
          variant="outline"
          className={styles.navButton}
        >
          <ChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
}
