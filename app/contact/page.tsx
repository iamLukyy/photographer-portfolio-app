export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-16 sm:pt-40">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-12">
            Contact
          </h1>
          <div className="space-y-12 text-gray-600">
            <p className="text-base sm:text-lg leading-relaxed">
              I&apos;d love to hear from you. Whether you&apos;re interested in prints,
              commissions, or just want to say hello.
            </p>

            <div className="space-y-8">
              <div>
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Email
                </h2>
                <a
                  href="mailto:your.email@example.com"
                  className="text-base text-gray-700 hover:text-black transition-colors duration-300"
                >
                  your.email@example.com
                </a>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Instagram
                </h2>
                <a
                  href="https://instagram.com/yourusername"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-gray-700 hover:text-black transition-colors duration-300"
                >
                  @yourusername
                </a>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Location
                </h2>
                <p className="text-base text-gray-700">Your City, Country</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
