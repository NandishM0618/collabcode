import React, { useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import {
  FaSave,
  FaEraser,
  FaHighlighter,
  FaTrash,
  FaUndo,
} from "react-icons/fa";

const DrawingPad = () => {
  const [brushColor, setBrushColor] = useState("#000000");
  const canvasRef = useRef(null);

  const handlePenClick = () => {
    canvasRef.current.eraseMode(false);
  };

  const handleEraserClick = () => {
    canvasRef.current.eraseMode(true);
  };

  const handleClearClick = () => {
    canvasRef.current.clearCanvas();
  };

  const handleSaveClick = async () => {
    const dataURL = await canvasRef.current.exportImage("png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "drawing.png";
    link.click();
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };
  const handleColorChange = (event) => {
    setBrushColor(event.target.value);
  };

  return (
    <div className="flex flex-col  items-start justify-start">
      <div className=" relative">
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={5}
          strokeColor={brushColor}
          canvasColor="#282a36"
          width="570px"
          height="340px"
          className=" shadow-2xl"
          style={{ border: "none" }}
        />

        <div className=" w-full absolute bottom-0 left-0 flex gap-4 justify-center items-center space-x-4 mt-4">
          <div className=" bg-gray-700 px-4 space-x-4 py-1 mb-3 gap-4">
            <button
              onClick={handlePenClick}
              className="text-white p-2   hover:bg-slate-500"
            >
              <FaHighlighter size={20} />
            </button>
            <button
              onClick={handleEraserClick}
              className="text-white p-2   hover:bg-slate-500"
            >
              <FaEraser size={20} />
            </button>
            <button
              onClick={handleClearClick}
              className="text-white p-2   hover:bg-slate-500"
            >
              <FaTrash size={20} />
            </button>
            <button
              onClick={handleUndo}
              className="text-white p-2  hover:bg-slate-500"
            >
              <FaUndo size={20} />
            </button>
            <button
              onClick={handleSaveClick}
              className="text-white p-2 hover:bg-slate-500"
            >
              <FaSave size={20} />
            </button>
            <button className=" text-white mb-2 rounded-full">
              <input
                type="color"
                value={brushColor}
                className=" w-7 h-7 p-1 rounded-full"
                onChange={handleColorChange}
                style={{ margin: "1px" }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingPad;
