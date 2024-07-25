const Features = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-7">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 p-3">
          <div className="">
            <h2 className=" text-3xl text-gray-400 mb-2">
              Feature rich code editor
            </h2>
            <p className=" text-left leading-relaxed text-white text-xl">
              The CollabCode code editor supports 5+ different languages, and
              comes with syntax highlighting and auto-complete.
            </p>
          </div>
          <div className="">
            <h2 className="text-3xl text-gray-400 mb-2">In browser compiler</h2>
            <p className="text-white leading-relaxed text-xl">
              Compile or run your code in the browser using the high performance
              CollabCode compiler.
            </p>
          </div>
          <div className="">
            <h2 className="text-3xl text-gray-400 mb-2">
              Video and audio chat
            </h2>
            <p className="text-white leading-relaxed text-xl">
              Chat with your fellow collaborators using the inbuilt video and
              audio chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
