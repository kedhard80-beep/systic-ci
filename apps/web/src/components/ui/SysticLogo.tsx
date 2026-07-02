import Image from "next/image";
import { cn } from "@/lib/utils";

interface SysticLogoProps {
  /** "light" = logo bleu sur fond clair | "dark" = logo blanc/cyan sur fond sombre */
  variant?: "light" | "dark";
  /** Hauteur souhaitée en px — la largeur est calculée automatiquement (ratio 386:120) */
  height?: number;
  className?: string;
}

// Ratio réel du logo recadré : 386 x 120
const LOGO_RATIO = 386 / 120;

/**
 * Logo officiel SYSTIC-CI (format horizontal, texte inclus dans l'image).
 * Ne pas ajouter de texte "SYSTIC-CI" à côté — il est déjà dans le PNG.
 */
export function SysticLogo({
  variant = "light",
  height = 40,
  className,
}: SysticLogoProps) {
  const width = Math.round(height * LOGO_RATIO);

  return (
    <Image
      src={variant === "dark" ? "/images/logo-dark.png" : "/images/logo-light.png"}
      alt="SYSTIC-CI — Informatique & Sécurité Électronique"
      width={width}
      height={height}
      className={cn("object-contain flex-shrink-0", className)}
      priority
    />
  );
}
