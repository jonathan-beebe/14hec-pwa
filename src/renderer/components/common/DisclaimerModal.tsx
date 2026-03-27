interface DisclaimerModalProps {
  onAccept: () => void
}

export default function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/80 backdrop-blur-md animate-fade-in">
      <div className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-hidden relative overflow-hidden rounded-3xl animate-scale-in"
           style={{
             background: 'rgba(16, 15, 12, 0.92)',
             backdropFilter: 'blur(24px) saturate(160%)',
             WebkitBackdropFilter: 'blur(24px) saturate(160%)',
             border: '1px solid rgba(255, 255, 255, 0.08)',
             boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6)'
           }}>
        {/* Decorative orbs */}
        <div className="hero-orb w-40 h-40 -top-20 -right-20 bg-botanical-500 animate-breathe" />
        <div className="hero-orb w-40 h-40 -bottom-20 -left-20 bg-celestial-500 animate-breathe" style={{ animationDelay: '2s' }} />

        <div className="relative p-7">
          {/* Logo */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2.5"
                 style={{
                   background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.12), rgba(124, 94, 237, 0.12))',
                   border: '1px solid rgba(255, 255, 255, 0.08)',
                   boxShadow: '0 0 20px rgba(93, 168, 126, 0.06)'
                 }}>
              <span className="text-xl font-display font-bold text-gradient-botanical">14</span>
            </div>
            <h1 className="text-xl font-display font-bold text-gradient-botanical tracking-wide">14 HEC</h1>
            <p className="text-[10px] text-earth-500 tracking-[0.2em] uppercase mt-1">Herbal {'\u00b7'} Energetic {'\u00b7'} Celestial</p>
            <div className="divider-gradient mt-3" />
          </div>

          <div className="space-y-3.5 mb-5">
            <p className="text-sm text-earth-300 leading-relaxed text-center">
              Welcome to the 14 HEC Plant Intelligence System {'\u2014'} an educational reference library
              honoring humanity's enduring relationship with the plant kingdom across cultures,
              traditions, and disciplines.
            </p>

            {/* Educational Purpose */}
            <div className="rounded-xl p-4"
                 style={{
                   background: 'linear-gradient(135deg, rgba(93, 168, 126, 0.04), rgba(16, 15, 12, 0.65))',
                   border: '1px solid rgba(93, 168, 126, 0.08)',
                   boxShadow: 'inset 0 1px 0 0 rgba(93, 168, 126, 0.04)'
                 }}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-botanical-500">{'\u2618'}</span>
                <h3 className="text-sm font-display font-semibold text-botanical-300">Educational Reference</h3>
              </div>
              <p className="text-xs text-earth-400 leading-relaxed">
                14 HEC is an independent educational reference database providing information about plants,
                herbs, fungi, and their historical, cultural, and ethnobotanical significance. All content
                is presented for educational and informational purposes to support botanical literacy and
                informed decision-making.
              </p>
            </div>

            {/* Health Disclaimer */}
            <div className="rounded-xl p-4"
                 style={{
                   background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(16, 15, 12, 0.65))',
                   border: '1px solid rgba(245, 158, 11, 0.08)',
                   boxShadow: 'inset 0 1px 0 0 rgba(245, 158, 11, 0.04)'
                 }}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-amber-500">{'\u2695'}</span>
                <h3 className="text-sm font-display font-semibold text-amber-400">Health Information Notice</h3>
              </div>
              <div className="space-y-2 text-xs text-earth-400 leading-relaxed">
                <p>
                  This application <strong className="text-earth-300">does not provide medical advice, diagnosis, or
                  treatment recommendations</strong>. The information contained herein is not intended to be a
                  substitute for professional medical advice, diagnosis, or treatment. Always seek the advice
                  of your physician or other qualified health provider with any questions you may have
                  regarding a medical condition or the use of any herbal substance.
                </p>
                <p>
                  Traditional uses, preparation methods, and historical information presented in this
                  application reflect documented ethnobotanical knowledge from various cultural traditions
                  and are not endorsements or recommendations for personal use. Individual responses to
                  herbal substances vary, and interactions with medications are possible.
                </p>
                <p className="font-medium text-earth-300">
                  Statements in this application have not been evaluated by the Food and Drug Administration.
                  No information in this application is intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="rounded-xl p-4"
                 style={{
                   background: 'linear-gradient(135deg, rgba(124, 94, 237, 0.04), rgba(16, 15, 12, 0.65))',
                   border: '1px solid rgba(124, 94, 237, 0.08)',
                   boxShadow: 'inset 0 1px 0 0 rgba(124, 94, 237, 0.04)'
                 }}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-celestial-400">{'\u2696'}</span>
                <h3 className="text-sm font-display font-semibold text-celestial-300">Legal Awareness</h3>
              </div>
              <div className="space-y-2 text-xs text-earth-400 leading-relaxed">
                <p>
                  Some plants in this database are classified as controlled substances under federal and/or
                  state law. These entries are provided solely for educational, historical, and ethnobotanical
                  reference purposes. Nothing in this application should be construed as encouraging or
                  facilitating any illegal activity. Users are responsible for understanding and complying
                  with all applicable laws in their jurisdiction.
                </p>
                <p>
                  Astrological correspondences are rooted in the Culpeper tradition and historical herbal
                  astrology. They are presented as a cultural and philosophical framework for exploration.
                </p>
              </div>
            </div>

            {/* Independence Statement */}
            <p className="text-[11px] text-earth-500 text-center leading-relaxed">
              14 HEC is an independent educational resource. It does not sell, distribute, or endorse any
              products, preparations, or practices. No content should be construed as product endorsement.
            </p>

            <p className="text-[11px] text-earth-600 italic text-center font-display">
              "As above, so below" {'\u2014'} The Hermetic principle guiding this work
            </p>
          </div>

          <button
            onClick={onAccept}
            className="btn-primary w-full py-3"
          >
            I Understand {'\u2014'} Enter 14 HEC
          </button>
        </div>
      </div>
    </div>
  )
}
