interface BrandLogoProps {
  size?: 'small' | 'large';
  showWordmark?: boolean;
}

export default function BrandLogo({ size = 'small', showWordmark = true }: BrandLogoProps) {
  const logoSrc = size === 'small' 
    ? '/assets/generated/safespace-logo.dim_64x64.png'
    : '/assets/generated/safespace-logo.dim_256x256.png';
  
  const logoSize = size === 'small' ? 'w-10 h-10' : 'w-20 h-20';

  return (
    <div className="flex items-center gap-3">
      <img 
        src={logoSrc} 
        alt="SafeSpace Logo" 
        className={logoSize}
      />
      {showWordmark && (
        <span className="text-safespace-primary font-bold text-xl uppercase tracking-wide">
          SAFESPACE
        </span>
      )}
    </div>
  );
}
