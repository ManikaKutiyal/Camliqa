export default function GoldenDivider({ className = "py-8 sm:py-12" }) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-6 px-4">
        <div 
          className="h-px w-20" 
          style={{ backgroundColor: '#bf8821ff', opacity: 0.4 }} 
        />
        <div 
          className="h-1.5 w-1.5 rotate-45 border" 
          style={{ borderColor: '#bf8821ff', opacity: 0.6 }} 
        />
        <div 
          className="h-px w-20" 
          style={{ backgroundColor: '#bf8821ff', opacity: 0.4 }} 
        />
      </div>
    </div>
  );
}



