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

export function TreatInventory({ treats, canFeed, sessionHealth, maxHealth, onFeed, hunchieAway }: Props) {
  const [open, setOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [confirmingFeed, setConfirmingFeed] = useState<{ index: number; treat: TreatType } | null>(null)

  const grouped = groupByTier(treats)
  const currentDamage = maxHealth - sessionHealth

  const handleFeedClick = (treat: TreatType, index: number) => {
    if (hunchieAway) return
    const meta = TREAT_TIERS[treat]
    if (meta.tier === 'legendary' && currentDamage <= 12) {
      setConfirmingFeed({ index, treat })
      return
    }
    onFeed(index)
    if (treats.length <= 1) setOpen(false)
  }

  const handleConfirmFeed = () => {
    if (confirmingFeed) {
      onFeed(confirmingFeed.index)
      setConfirmingFeed(null)
      if (treats.length <= 1) setOpen(false)
    }
  }

  const feedDisabled = !canFeed || !!hunchieAway

  return (
    <>
      {/* Inline control group */}
      <div className={styles.controlGroup}>
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
      </div>

      {/* Help button */}
      <div className={styles.controlGroup}>
        <button
          type="button"
          className={styles.helpBtn}
          onClick={() => setShowHelp(true)}
          aria-label="Treat guide"
        >
          ?
        </button>
        <span className={styles.controlLabel}>Guide</span>
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
                            <Button
                              variant="teal"
                              className={styles.feedBtn}
                              onClick={() => handleFeedClick(treat, indices[0])}
                              disabled={feedDisabled}
                            >
                              {hunchieAway ? 'Away' : canFeed ? 'Feed' : 'Full'}
                            </Button>
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
