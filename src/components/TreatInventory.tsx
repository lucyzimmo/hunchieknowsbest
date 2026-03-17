import { useState } from 'react'
import { Button } from './Button'
import { TreatIllustration, TREAT_NAMES, TREAT_TIERS, TREAT_EMOJI, TIER_ORDER, TIER_SECTION_COLORS, type TreatType, type TreatTier } from './TreatIllustration'
import styles from './TreatInventory.module.css'

interface Props {
  treats: TreatType[]
  canFeed: boolean
  sessionHealth: number
  maxHealth: number
  onFeed: (index: number) => void
  hunchieAway?: boolean
}

interface GroupedTreat {
  treat: TreatType
  count: number
  indices: number[]
}

function groupByTier(treats: TreatType[]): Record<TreatTier, GroupedTreat[]> {
  const groups: Record<TreatTier, Map<TreatType, { count: number; indices: number[] }>> = {
    legendary: new Map(),
    rare: new Map(),
    uncommon: new Map(),
    common: new Map(),
  }

  treats.forEach((t, i) => {
    const tier = TREAT_TIERS[t].tier
    const map = groups[tier]
    if (!map.has(t)) map.set(t, { count: 0, indices: [] })
    const entry = map.get(t)!
    entry.count++
    entry.indices.push(i)
  })

  const result: Record<TreatTier, GroupedTreat[]> = {
    legendary: [],
    rare: [],
    uncommon: [],
    common: [],
  }

  for (const tier of TIER_ORDER) {
    for (const [treat, data] of groups[tier]) {
      result[tier].push({ treat, count: data.count, indices: data.indices })
    }
  }

  return result
}

const TIER_DISPLAY_NAMES: Record<TreatTier, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
}

const TIER_LABEL_COLORS: Record<TreatTier, string> = {
  common: '#9E9E9E',
  uncommon: '#66BB6A',
  rare: '#AB47BC',
  legendary: '#FFD700',
}

export function TreatInventory({ treats, canFeed, sessionHealth: _sh, maxHealth: _mh, onFeed, hunchieAway }: Props) {
  const [open, setOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [confirmingFeed, setConfirmingFeed] = useState<{ index: number; treat: TreatType } | null>(null)

  const grouped = groupByTier(treats)

  const handleFeedClick = (_treat: TreatType, index: number) => {
    if (!canFeed || hunchieAway) return
    setOpen(false)
    onFeed(index)
  }

  const handleConfirmFeed = () => {
    if (confirmingFeed) {
      onFeed(confirmingFeed.index)
      setConfirmingFeed(null)
      setOpen(false)
    }
  }

  return (
    <>
      {/* Inline control group */}
      <div className={styles.controlGroup} data-coach="feed-btn">
        <button
          type="button"
          className={styles.controlBtn}
          onClick={() => setOpen(!open)}
          aria-label={`Inventory: ${treats.length} treats`}
        >
          <span className={styles.controlIcon} aria-hidden>🎒</span>
          {treats.length > 0 && (
            <span className={styles.badge}>{treats.length}</span>
          )}
        </button>
        <span className={styles.controlLabel}>Items</span>
        {treats.length === 0 && (
          <span className={styles.emptyHint}>No treats yet — earn some by completing breaks</span>
        )}
      </div>

      {/* Treat guide button */}
      <div className={styles.controlGroup} data-coach="treat-guide">
        <button
          type="button"
          className={styles.guideBtn}
          onClick={() => setShowHelp(true)}
          aria-label="Treat guide"
          data-guide-btn
        >
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
            {/* Book body */}
            <rect x="5" y="4" width="22" height="26" rx="3" fill="#C8B8E8" stroke="#9B8BBF" strokeWidth="1.5"/>
            {/* Page fold */}
            <path d="M23 4 L27 4 L27 8 Z" fill="#DDD0F0" stroke="#9B8BBF" strokeWidth="0.8"/>
            {/* Leaf wreath left */}
            <path d="M10 13 Q8 11 10 9" fill="none" stroke="#A8D8B0" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 13 Q8 15 10 17" fill="none" stroke="#A8D8B0" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Leaf wreath right */}
            <path d="M22 13 Q24 11 22 9" fill="none" stroke="#A8D8B0" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M22 13 Q24 15 22 17" fill="none" stroke="#A8D8B0" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Apple treat */}
            <circle cx="16" cy="13" r="4" fill="#E88" stroke="#C66" strokeWidth="1"/>
            <path d="M16 9 Q17 7 18 8" fill="none" stroke="#6A4" strokeWidth="1.2" strokeLinecap="round"/>
            {/* "TREATS" label */}
            <rect x="8" y="19" width="16" height="6" rx="2" fill="#F5F0FF" stroke="#B8A8D8" strokeWidth="0.8"/>
            <text x="16" y="23.5" textAnchor="middle" fontSize="3.8" fontWeight="700" fill="#7B6A9B">TREATS</text>
          </svg>
        </button>
        <span className={styles.controlLabel}>Treat Guide</span>
      </div>

      {/* Inventory panel overlay */}
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <h3 className={styles.panelTitle}>Treat Inventory</h3>
            {treats.length === 0 ? (
              <p className={styles.emptyMsg}>No treats yet. Complete a break to earn one!</p>
            ) : (
              <div className={styles.tierList}>
                {TIER_ORDER.map(tier => {
                  const items = grouped[tier]
                  if (items.length === 0) return null
                  return (
                    <div
                      key={tier}
                      className={styles.tierSection}
                      style={{ background: TIER_SECTION_COLORS[tier], borderLeftColor: TIER_LABEL_COLORS[tier] }}
                    >
                      <div className={styles.tierHeader}>
                        <span className={styles.tierName} style={{ color: TIER_LABEL_COLORS[tier] }}>
                          {TIER_DISPLAY_NAMES[tier]}
                        </span>
                      </div>
                      {items.map(({ treat, count, indices }) => {
                        const meta = TREAT_TIERS[treat]
                        return (
                          <div key={treat} className={styles.treatRow}>
                            <div className={styles.treatRowIcon}>
                              <TreatIllustration treat={treat} size={44} />
                            </div>
                            <div className={styles.treatRowInfo}>
                              <span className={styles.treatRowName}>
                                {TREAT_EMOJI[treat]} {TREAT_NAMES[treat]}
                              </span>
                              <span className={styles.treatRowHeal}>{meta.healDescription}</span>
                            </div>
                            <span className={styles.treatRowQty}>x{count}</span>
                            <div className={styles.feedBtnWrap}>
                              <Button
                                variant="teal"
                                className={styles.feedBtn}
                                onClick={() => handleFeedClick(treat, indices[0])}
                                disabled={!canFeed || !!hunchieAway}
                              >
                                {hunchieAway ? 'Away' : canFeed ? 'Feed' : 'Full'}
                              </Button>
                              {(!canFeed || !!hunchieAway) && (
                                <span className={styles.feedTooltip}>
                                  {hunchieAway ? 'Hunchie is away' : 'Hunchie is full!'}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
            {hunchieAway && (
              <p className={styles.awayMsg}>Hunchie is away... complete breaks to bring it back</p>
            )}
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help popup */}
      {showHelp && (
        <div className={styles.overlay} onClick={() => setShowHelp(false)}>
          <div className={`${styles.panel} ${styles.helpPanel}`} onClick={e => e.stopPropagation()}>
            <h3 className={styles.panelTitle}>🌿 Hunchie's Treat Guide</h3>
            <div className={styles.helpContent}>
              <p>Feed Hunchie treats to help it recover from hits!</p>
              <div className={styles.guideRow}>
                <div className={styles.guideIcons}>
                  <TreatIllustration treat="blueberries" size={36} />
                  <TreatIllustration treat="apple" size={36} />
                </div>
                <p>
                  <strong style={{ color: '#3949AB' }}>Blueberries</strong> & <strong style={{ color: '#C62828' }}>Apples</strong> — Easy to find! Heals a small scratch.
                </p>
              </div>
              <div className={styles.guideRow}>
                <div className={styles.guideIcons}>
                  <TreatIllustration treat="strawberry" size={36} />
                  <TreatIllustration treat="acorn" size={36} />
                </div>
                <p>
                  <strong style={{ color: '#E53935' }}>Strawberries</strong> & <strong style={{ color: '#B8863C' }}>Acorns</strong> — A little harder to come by. Heals a moderate bump.
                </p>
              </div>
              <div className={styles.guideRow}>
                <div className={styles.guideIcons}>
                  <TreatIllustration treat="grapes" size={36} />
                </div>
                <p>
                  <strong style={{ color: '#7B1FA2' }}>Grapes</strong> — Rare and juicy! Heals a big ouch.
                </p>
              </div>
              <div className={styles.guideRow}>
                <div className={styles.guideIcons}>
                  <TreatIllustration treat="mushroom" size={36} />
                </div>
                <p>
                  <strong style={{ color: '#F9A825' }}>Golden Mushroom</strong> — Extremely rare and magical. Fully restores Hunchie to perfect health!
                </p>
              </div>
              <p className={styles.helpHint}>
                Complete your focus breaks to earn treats. The rarer the treat, the luckier you are! 🍀
              </p>
            </div>
            <Button variant="teal" onClick={() => setShowHelp(false)} className={styles.helpCloseBtn}>
              Got it! ✨
            </Button>
          </div>
        </div>
      )}

      {/* Legendary confirmation dialog */}
      {confirmingFeed && (
        <div className={styles.overlay} onClick={() => setConfirmingFeed(null)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <TreatIllustration treat={confirmingFeed.treat} size={64} />
            <p className={styles.confirmText}>
              Hunchie only has a scratch! Are you sure you want to use your Golden Mushroom? 🍄
            </p>
            <div className={styles.confirmButtons}>
              <Button variant="pink" onClick={handleConfirmFeed} className={styles.confirmBtn}>
                Use it anyway
              </Button>
              <Button variant="teal" onClick={() => setConfirmingFeed(null)} className={styles.confirmBtn}>
                Save for later
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
