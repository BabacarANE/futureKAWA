import React from "react";
import { Coffee, Home, ArrowLeft } from "lucide-react";

/* ============================================================================
   FutureKawa — Page 404 premium
   - Illustration : tasse de café renversée + grains éparpillés (SVG animé)
   - Message clair, ton produit
   - Bouton retour Dashboard + retour précédent
   - Animation : tasse qui "fume" légèrement, grains qui flottent au chargement
   ========================================================================= */

interface NotFoundPageProps {
  onGoDashboard?: () => void;
  onGoBack?: () => void;
}

export default function NotFoundPage({ onGoDashboard, onGoBack }: NotFoundPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f2ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "inherit",
      }}
    >
      <style>{`
        @keyframes steamRise {
          0% { opacity: 0; transform: translateY(0) scaleX(1); }
          30% { opacity: .55; }
          100% { opacity: 0; transform: translateY(-26px) scaleX(1.4); }
        }
        @keyframes beanDrift {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(8deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes numberPop {
          0% { opacity: 0; transform: scale(.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        .fk-404-btn:hover { background: #3d1f0f !important; }
        .fk-404-ghost:hover { background: #ece8e1 !important; }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 460,
        }}
      >
        {/* Illustration SVG */}
        <div
          style={{
            position: "relative",
            width: 220,
            height: 180,
            marginBottom: 8,
            animation: "fadeUp .5s ease-out",
          }}
        >
          <svg viewBox="0 0 220 180" width="220" height="180">
            {/* Grains de café éparpillés */}
            <g style={{ animation: "beanDrift 4s ease-in-out infinite" }}>
              <ellipse cx="36" cy="148" rx="9" ry="13" fill="#C9783F" opacity="0.85" transform="rotate(-20 36 148)" />
              <path d="M36 138 C36 138 32 148 36 156 C40 164 36 158 36 158" stroke="#7A4528" strokeWidth="1.4" fill="none" transform="rotate(-20 36 148)" />
            </g>
            <g style={{ animation: "beanDrift 5s ease-in-out .4s infinite" }}>
              <ellipse cx="184" cy="156" rx="8" ry="11.5" fill="#C9783F" opacity="0.8" transform="rotate(25 184 156)" />
              <path d="M184 147 C184 147 180.5 156 184 163 C187.5 170 184 165 184 165" stroke="#7A4528" strokeWidth="1.3" fill="none" transform="rotate(25 184 156)" />
            </g>
            <g style={{ animation: "beanDrift 4.5s ease-in-out .8s infinite" }}>
              <ellipse cx="60" cy="166" rx="6" ry="8.5" fill="#E8C9A3" opacity="0.9" transform="rotate(10 60 166)" />
            </g>

            {/* Soucoupe */}
            <ellipse cx="110" cy="150" rx="58" ry="11" fill="#E5DFD3" />
            <ellipse cx="110" cy="148" rx="58" ry="10" fill="#F1EBDE" />

            {/* Tasse renversée */}
            <g transform="rotate(-12 96 118)">
              <path
                d="M62 100 C62 122 78 134 96 134 C114 134 130 122 130 100 L124 96 L68 96 Z"
                fill="#7A4528"
              />
              <ellipse cx="96" cy="98" rx="34" ry="8" fill="#5C3420" />
              {/* Anse */}
              <path
                d="M130 104 C142 104 148 112 144 120 C140 128 130 126 128 118"
                stroke="#7A4528"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Café renversé */}
            <ellipse cx="60" cy="152" rx="24" ry="6" fill="#5C3420" opacity="0.55" />
            <path
              d="M70 130 C66 138 60 144 56 150"
              stroke="#5C3420"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />

            {/* Vapeur */}
            <path
              d="M150 90 C150 90 156 80 150 70 C144 60 150 50 150 50"
              stroke="#C9783F"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ animation: "steamRise 2.6s ease-out infinite", transformOrigin: "150px 90px" }}
            />
            <path
              d="M166 95 C166 95 172 85 166 75 C160 65 166 55 166 55"
              stroke="#C9783F"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              style={{ animation: "steamRise 2.6s ease-out .5s infinite", transformOrigin: "166px 95px" }}
            />
          </svg>
        </div>

        {/* Code erreur */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1c1a17",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            animation: "numberPop .5s ease-out .1s both",
          }}
        >
          404
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 500,
            color: "#1c1a17",
            marginTop: 10,
            animation: "fadeUp .5s ease-out .15s both",
          }}
        >
          Cette page s'est renversée en route
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#7a766f",
            marginTop: 8,
            lineHeight: 1.6,
            animation: "fadeUp .5s ease-out .2s both",
          }}
        >
          La page que vous cherchez n'existe pas ou a été déplacée. Vérifiez
          l'adresse ou retournez à votre tableau de bord.
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 26,
            animation: "fadeUp .5s ease-out .25s both",
          }}
        >
          <button
            onClick={onGoBack}
            className="fk-404-ghost"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              borderRadius: 8,
              border: "0.5px solid #d0ccc5",
              background: "#fff",
              color: "#1c1a17",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .15s",
            }}
          >
            <ArrowLeft size={14} /> Page précédente
          </button>
          <button
            onClick={onGoDashboard}
            className="fk-404-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 8,
              border: "0.5px solid #4a2810",
              background: "#4a2810",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .15s",
            }}
          >
            <Home size={14} /> Retour au Dashboard
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 36,
            fontSize: 11,
            color: "#a39d92",
            animation: "fadeUp .5s ease-out .3s both",
          }}
        >
          <Coffee size={12} /> FutureKawa · Coffee Intelligence
        </div>
      </div>
    </div>
  );
}