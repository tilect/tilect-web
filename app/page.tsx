export default function Home() {
  return (
    <div className="flex flex-col justify-end items-center w-full min-h-screen m-0 p-0">
      <video
        className="absolute top-0 left-0 right-0 bottom-0 m-auto w-full h-auto max-w-[1980px] z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/tilect_prueba02.mp4" type="video/mp4" />
      </video>
      <div className="flex h-[33%] items-center">
        {/* <div className="h-[33%] grid grid-cols-4 gap-8 z-[2]">
          <div className="flex justify-center items-center">
            <a
              href="https://t.me/tilectartpublic"
              target="_blank"
              rel="noreferrer"
              className="w-12 text-center md:w-12 sm:w-8"
            >
              <Icon icon="telegram" />
            </a>
          </div>
          <div className="flex justify-center items-center">
            <a
              href="https://instagram.com/tilect.art"
              target="_blank"
              rel="noreferrer"
              className="w-12 text-center md:w-12 sm:w-8"
            >
              <Icon icon="instagram" />
            </a>
          </div>
          <div className="flex justify-center items-center">
            <a
              href="https://github.com/tilect"
              target="_blank"
              rel="noreferrer"
              className="w-12 text-center md:w-12 sm:w-8"
            >
              <Icon icon="github" />
            </a>
          </div>
          <div className="flex justify-center items-center">
            <a
              href="https://soundcloud.com/tilect"
              target="_blank"
              rel="noreferrer"
              className="w-12 text-center md:w-12 sm:w-8"
            >
              <Icon icon="soundcloud" />
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
}
