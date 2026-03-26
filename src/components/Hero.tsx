const emojis = ["🌙", "🌸", "☕", "🍂", "✨", "📷", "🌿", "🎞", "🕯", "🦋", "🍃", "🌾", "🌙", "🌸", "☕"];

const Hero = () => (
  <div>
    <div className="px-5 pt-6">
      <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1.5">
        The sticker magazine
      </p>
      <h1 className="font-display text-[52px] leading-none tracking-[-2px] mb-5">
        Stick<em className="text-accent italic">yy.</em>
      </h1>
    </div>

    <div className="w-full h-[180px] bg-muted flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-3 opacity-15">
        {emojis.map((e, i) => (
          <span key={i} className="flex items-center justify-center text-[30px]">{e}</span>
        ))}
      </div>
      <div className="relative z-10 text-center">
        <p className="font-display italic text-lg text-foreground leading-snug">
          "Every surface is<br />a canvas."
        </p>
        <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1.5">
          New drops every week
        </span>
      </div>
    </div>
  </div>
);

export default Hero;
